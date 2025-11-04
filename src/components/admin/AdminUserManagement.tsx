// src/components/admin/AdminUserManagement.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/lib/contexts/ToastContext';
import { db } from '@/lib/firebase/config';
import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { Ban, CheckCircle, ExternalLink, Loader2, Search, Trash2, User } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt?: string;
  updatedAt?: string;
  isAdmin?: boolean;
  isBanned?: boolean;
  hasPortfolio?: boolean;
}

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { success, error: showError } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.uid.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const usersData: UserData[] = await Promise.all(
        snapshot.docs.map(async (userDoc) => {
          const userData = userDoc.data() as UserData;

          // Check if user has a portfolio
          const portfolioRef = doc(db, 'users', userDoc.id, 'portfolio', 'data');
          const portfolioSnap = await getDoc(portfolioRef);

          return {
            uid: userDoc.id,
            email: userData.email,
            displayName: userData.displayName,
            photoURL: userData.photoURL,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
            isAdmin: userData.isAdmin || false,
            isBanned: userData.isBanned || false,
            hasPortfolio: portfolioSnap.exists(),
          };
        })
      );

      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      showError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (uid: string, currentBanStatus: boolean) => {
    try {
      setActionLoading(uid);
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        isBanned: !currentBanStatus,
        updatedAt: new Date().toISOString(),
      });

      setUsers(users.map(user =>
        user.uid === uid ? { ...user, isBanned: !currentBanStatus } : user
      ));

      success(currentBanStatus ? 'User unbanned successfully' : 'User banned successfully');
    } catch (error) {
      console.error('Error banning user:', error);
      showError('Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (uid: string, email: string | null) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete user "${email}"? This action cannot be undone and will delete all their data including portfolio.`
    );

    if (!confirmed) return;

    try {
      setActionLoading(uid);

      // Delete user's portfolio if exists
      const portfolioRef = doc(db, 'users', uid, 'portfolio', 'data');
      const portfolioSnap = await getDoc(portfolioRef);
      if (portfolioSnap.exists()) {
        await deleteDoc(portfolioRef);
      }

      // Delete from public portfolios collection
      const publicPortfolioRef = doc(db, 'portfolios', uid);
      const publicPortfolioSnap = await getDoc(publicPortfolioRef);
      if (publicPortfolioSnap.exists()) {
        await deleteDoc(publicPortfolioRef);
      }

      // Delete user document
      const userRef = doc(db, 'users', uid);
      await deleteDoc(userRef);

      setUsers(users.filter(user => user.uid !== uid));
      success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      showError('Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewPortfolio = (uid: string) => {
    router.push(`/portfolio/${uid}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading users...</span>
      </div>
    );
  }


  console.log(filteredUsers);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600 mt-1">
            Manage all registered users and their accounts
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Total Users: <span className="font-semibold text-gray-900">{users.length}</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Search by email, name, or user ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
            </div>
            <User className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">With Portfolio</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {users.filter(u => u.hasPortfolio).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {users.filter(u => u.isAdmin).length}
              </p>
            </div>
            <User className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Banned</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {users.filter(u => u.isBanned).length}
              </p>
            </div>
            <Ban className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Portfolio
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.photoURL ? (
                          <Image
                            src={user.photoURL}
                            width={1200}
                            height={800}
                            alt={user.displayName || 'User'}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.displayName || 'No name'}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {user.uid.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email || 'No email'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {user.isAdmin && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Admin
                          </span>
                        )}
                        {user.isBanned && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Banned
                          </span>
                        )}
                        {!user.isAdmin && !user.isBanned && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.hasPortfolio ? (
                        <span className="inline-flex items-center text-xs text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Has Portfolio
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">No Portfolio</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {user.hasPortfolio && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewPortfolio(user.uid)}
                            className="text-blue-600 hover:text-blue-700"
                            title="View Portfolio"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBanUser(user.uid, user.isBanned || false)}
                          disabled={actionLoading === user.uid || user.isAdmin}
                          className={user.isBanned ? 'text-green-600 hover:text-green-700' : 'text-orange-600 hover:text-orange-700'}
                          title={user.isBanned ? 'Unban User' : 'Ban User'}
                        >
                          {actionLoading === user.uid ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : user.isBanned ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Ban className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.uid, user.email)}
                          disabled={actionLoading === user.uid || user.isAdmin}
                          className="text-red-600 hover:text-red-700"
                          title="Delete User"
                        >
                          {actionLoading === user.uid ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Showing results text */}
      {filteredUsers.length > 0 && (
        <div className="text-sm text-gray-600 text-center">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
