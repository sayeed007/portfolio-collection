/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { db } from '@/lib/firebase/config';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  AlertCircle,
  CheckCircle,
  Plus,
  Save,
  X,
  CheckSquare,
  XSquare,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { DeleteButton } from '../ui/DeleteButton';
import PrimaryButton from '../ui/PrimaryButton';
import { EditButton } from '../ui/edit-button';

interface SkillCategory {
  id: string;
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface SkillCategoryRequest {
  id: string;
  name: string;
  requestedBy: string;
  requestedByEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  adminComment?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Skill {
  id: string;
  name: string;
  categoryId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface SkillRequest {
  id: string;
  name: string;
  categoryId: string;
  requestedBy: string;
  requestedByEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  adminComment?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const POPULAR_CATEGORIES = [
  { name: 'Programming Languages' },
  { name: 'Database Management' },
  { name: 'Frameworks / Library' },
  { name: 'Testing' },
  { name: 'Tools' },
  { name: 'Others' },
];

const POPULAR_SKILLS = [
  { name: 'JavaScript(ES6)', categoryName: 'Programming Languages' },
  { name: 'TypeScript', categoryName: 'Programming Languages' },
  { name: 'Python', categoryName: 'Programming Languages' },
  { name: 'Node', categoryName: 'Programming Languages' },
  { name: 'MongoDB', categoryName: 'Database Management' },
  { name: 'SQLite3', categoryName: 'Database Management' },
  { name: 'jQuery', categoryName: 'Frameworks / Library' },
  { name: 'React-17/18', categoryName: 'Frameworks / Library' },
  { name: 'Next-13/14', categoryName: 'Frameworks / Library' },
  { name: 'React Native', categoryName: 'Frameworks / Library' },
  { name: 'Angular', categoryName: 'Frameworks / Library' },
  { name: 'Ionic', categoryName: 'Frameworks / Library' },
  { name: 'Cordova', categoryName: 'Frameworks / Library' },
  { name: 'Vue3', categoryName: 'Frameworks / Library' },
  { name: 'ExpressJS', categoryName: 'Frameworks / Library' },
  { name: 'CSS3', categoryName: 'Frameworks / Library' },
  { name: 'Bootstrap-3/4/5', categoryName: 'Frameworks / Library' },
  { name: 'Tailwind', categoryName: 'Frameworks / Library' },
  { name: 'SCSS', categoryName: 'Frameworks / Library' },
  { name: 'GIT', categoryName: 'Tools' },
  { name: 'VS Code', categoryName: 'Tools' },
  { name: 'Android Studio', categoryName: 'Tools' },
  { name: 'Object-Oriented Programming (OOP)', categoryName: 'Others' },
  { name: 'Software Architecture', categoryName: 'Others' },
  { name: 'Agile Development', categoryName: 'Others' },
  { name: 'API Development & Integration', categoryName: 'Others' },
  { name: 'Enterprise Resource Planning (ERP)', categoryName: 'Others' },
  { name: 'Agile/Scrum Methodologies', categoryName: 'Others' },
  { name: 'Problem Solving and Analytical Skills', categoryName: 'Others' },
];

const AdminSkillManagement = () => {
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [categoryRequests, setCategoryRequests] = useState<SkillCategoryRequest[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillRequests, setSkillRequests] = useState<SkillRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'categories' | 'skills' | 'categoryRequests' | 'skillRequests'>('categories');
  const [formData, setFormData] = useState({ name: '', categoryId: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const categoriesQuery = query(collection(db, 'skillCategories'), orderBy('name', 'asc'));
    const unsubscribeCategories = onSnapshot(categoriesQuery, snapshot => {
      const categoriesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SkillCategory));
      setCategories(categoriesList);

      if (categoriesList?.length === 0) {
        const batch = writeBatch(db);
        POPULAR_CATEGORIES.forEach(category => {
          const categoryRef = doc(collection(db, 'skillCategories'));
          batch.set(categoryRef, {
            name: category.name,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });
        batch.commit().catch(error => {
          console.error(error);
          setError('Failed to prefill categories');
        });
      }
    });

    const categoryRequestsQuery = query(collection(db, 'skillCategoryRequests'), orderBy('createdAt', 'desc'));
    const unsubscribeCategoryRequests = onSnapshot(categoryRequestsQuery, snapshot => {
      setCategoryRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SkillCategoryRequest)));
    });

    const skillsQuery = query(collection(db, 'skills'), orderBy('name', 'asc'));
    const unsubscribeSkills = onSnapshot(skillsQuery, snapshot => {
      const skillsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Skill));
      setSkills(skillsList);

      if (skillsList.length === 0) {
        const batch = writeBatch(db);
        POPULAR_SKILLS.forEach(skill => {
          const category = categories.find(c => c.name === skill.categoryName);
          if (category) {
            const skillRef = doc(collection(db, 'skills'));
            batch.set(skillRef, {
              name: skill.name,
              categoryId: category.id,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        });
        batch.commit().catch(error => {
          console.error(error);
          setError('Failed to prefill skills');
        });
      }

    });

    const skillRequestsQuery = query(collection(db, 'skillRequests'), orderBy('createdAt', 'desc'));
    const unsubscribeSkillRequests = onSnapshot(skillRequestsQuery, snapshot => {
      setSkillRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SkillRequest)));
    });

    setLoading(false);

    return () => {
      unsubscribeCategories();
      unsubscribeCategoryRequests();
      unsubscribeSkills();
      unsubscribeSkillRequests();
    };
  }, [categories.length, skills.length]);

  const resetForm = () => {
    setFormData({ name: '', categoryId: '' });
    setEditingId(null);
    setShowAddForm(false);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    try {
      if (activeTab === 'categories' && editingId) {
        await updateDoc(doc(db, 'skillCategories', editingId), {
          name: formData.name.trim(),
          updatedAt: serverTimestamp(),
        });
      } else if (activeTab === 'skills' && editingId) {
        if (!formData.categoryId) {
          setError('Category is required');
          return;
        }
        await updateDoc(doc(db, 'skills', editingId), {
          name: formData.name.trim(),
          categoryId: formData.categoryId,
          updatedAt: serverTimestamp(),
        });
      } else if (activeTab === 'categories') {
        await addDoc(collection(db, 'skillCategories'), {
          name: formData.name.trim(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else if (activeTab === 'skills') {
        if (!formData.categoryId) {
          setError('Category is required');
          return;
        }
        await addDoc(collection(db, 'skills'), {
          name: formData.name.trim(),
          categoryId: formData.categoryId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      setSuccess(`${activeTab === 'categories' ? 'Category' : 'Skill'} saved successfully`);
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error(error);
      setError(`Failed to save ${activeTab === 'categories' ? 'category' : 'skill'}`);
    }
  };

  const handleEdit = (item: SkillCategory | Skill) => {
    setFormData({
      name: 'name' in item ? item.name : '',
      categoryId: 'categoryId' in item ? item.categoryId : '',
    });
    setEditingId(item.id);
    setShowAddForm(true);
    setActiveTab('name' in item ? 'categories' : 'skills');
  };

  const handleDelete = async (id: string, collectionName: string) => {
    if (!confirm(`Are you sure you want to delete this ${collectionName === 'skillCategories' ? 'category' : 'skill'}?`)) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
      setSuccess(`${collectionName === 'skillCategories' ? 'Category' : 'Skill'} deleted successfully`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error(error);
      setError(`Failed to delete ${collectionName === 'skillCategories' ? 'category' : 'skill'}`);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject', collectionName: string, name: string, categoryId?: string) => {
    try {
      if (action === 'approve') {
        if (collectionName === 'skillCategoryRequests') {
          await addDoc(collection(db, 'skillCategories'), {
            name,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else if (collectionName === 'skillRequests' && categoryId) {
          await addDoc(collection(db, 'skills'), {
            name,
            categoryId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      }
      await updateDoc(doc(db, collectionName, requestId), {
        status: action === 'approve' ? 'approved' : 'rejected',
        adminComment: action === 'reject' ? 'Rejected by admin' : null,
        updatedAt: serverTimestamp(),
      });
      setSuccess(`Request ${action}d successfully`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error(error);
      setError(`Failed to process ${collectionName === 'skillCategoryRequests' ? 'category' : 'skill'} request`);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Skill Management</h1>
        {!showAddForm && (
          <PrimaryButton onClick={() => { setShowAddForm(true); setActiveTab('categories'); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Category
          </PrimaryButton>
        )}
      </div>

      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'categories' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'skills' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Skills ({skills.length})
        </button>
        <button
          onClick={() => setActiveTab('categoryRequests')}
          className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'categoryRequests' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'} relative`}
        >
          Category Requests ({categoryRequests.filter(r => r.status === 'pending').length})
          {categoryRequests.filter(r => r.status === 'pending').length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {categoryRequests.filter(r => r.status === 'pending').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('skillRequests')}
          className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'skillRequests' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'} relative`}
        >
          Skill Requests ({skillRequests.filter(r => r.status === 'pending').length})
          {skillRequests.filter(r => r.status === 'pending').length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {skillRequests.filter(r => r.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800">{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {showAddForm && (
        <Card className="mb-8 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingId ? 'Edit' : 'Add New'} {activeTab === 'categories' ? 'Category' : 'Skill'}
            </h2>
            <Button type="button" variant="outline" onClick={resetForm}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {activeTab === 'skills' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={e => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <PrimaryButton type="submit">
                <Save className="w-4 h-4 mr-2" /> {editingId ? 'Update' : 'Add'}
              </PrimaryButton>
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {activeTab === 'categories' && (
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Categories ({categories.length})</h2>
          </div>
          {categories.length === 0 ? (
            <div className="p-12 text-center">
              <p>No categories found. Add a new category to get started.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map(category => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{category.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <EditButton onEdit={() => handleEdit(category)} editData={category} />
                        <DeleteButton onDelete={() => handleDelete(category.id, 'skillCategories')} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {activeTab === 'skills' && (
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Skills ({skills.length})</h2>
          </div>
          {skills.length === 0 ? (
            <div className="p-12 text-center">
              <p>No skills found. Add a new skill to get started.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {skills.map(skill => (
                  <tr key={skill.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{skill.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{categories.find(c => c.id === skill.categoryId)?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <EditButton onEdit={() => handleEdit(skill)} editData={skill} />
                        <DeleteButton onDelete={() => handleDelete(skill.id, 'skills')} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {activeTab === 'categoryRequests' && (
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Category Requests ({categoryRequests.length})</h2>
          </div>
          {categoryRequests.length === 0 ? (
            <div className="p-12 text-center">
              <p>No category requests.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categoryRequests.map(request => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{request.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{request.status}</td>
                    {request.status === 'pending' && (
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Button onClick={() => handleRequestAction(request.id, 'approve', 'skillCategoryRequests', request.name)} className="mr-2 bg-green-600 text-white">
                          <CheckSquare className="w-4 h-4 mr-2" /> Approve
                        </Button>
                        <Button onClick={() => handleRequestAction(request.id, 'reject', 'skillCategoryRequests', request.name)} variant="destructive">
                          <XSquare className="w-4 h-4 mr-2" /> Reject
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {activeTab === 'skillRequests' && (
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Skill Requests ({skillRequests.length})</h2>
          </div>
          {skillRequests.length === 0 ? (
            <div className="p-12 text-center">
              <p>No skill requests.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {skillRequests.map(request => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{request.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{categories.find(c => c.id === request.categoryId)?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{request.status}</td>
                    {request.status === 'pending' && (
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Button onClick={() => handleRequestAction(request.id, 'approve', 'skillRequests', request.name, request.categoryId)} className="mr-2 bg-green-600 text-white">
                          <CheckSquare className="w-4 h-4 mr-2" /> Approve
                        </Button>
                        <Button onClick={() => handleRequestAction(request.id, 'reject', 'skillRequests', request.name)} variant="destructive">
                          <XSquare className="w-4 h-4 mr-2" /> Reject
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </div>
  );
};

export default AdminSkillManagement;