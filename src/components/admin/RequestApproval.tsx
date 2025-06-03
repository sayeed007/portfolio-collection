// src/components/admin/RequestApproval.tsx
'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import {
    fetchCategoryRequests,
    approveCategoryRequest,
    rejectCategoryRequest
} from '@/lib/redux/slices/categoryRequestsSlice';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, X, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils/formatters';

export const RequestApproval: React.FC = () => {
    const dispatch = useDispatch();
    const { requests, loading, error } = useSelector((state: RootState) => state.categoryRequests);

    useEffect(() => {
        dispatch(fetchCategoryRequests() as any);
    }, [dispatch]);

    const handleApprove = async (requestId: string) => {
        try {
            await dispatch(approveCategoryRequest(requestId) as any);
        } catch (error) {
            console.error('Error approving request:', error);
        }
    };

    const handleReject = async (requestId: string) => {
        const reason = window.prompt('Please provide a reason for rejection (optional):');
        try {
            await dispatch(rejectCategoryRequest({ requestId, reason: reason || '' }) as any);
        } catch (error) {
            console.error('Error rejecting request:', error);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <Check className="w-4 h-4 text-green-500" />;
            case 'rejected':
                return <X className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-yellow-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    if (loading) return <div>Loading requests...</div>;
    if (error) return <div>Error: {error}</div>;

    const pendingRequests = requests.filter(req => req.status === 'pending');
    const processedRequests = requests.filter(req => req.status !== 'pending');

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Category Requests</h2>

            {pendingRequests.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4">Pending Requests ({pendingRequests.length})</h3>
                    <div className="grid gap-4">
                        {pendingRequests.map((request) => (
                            <Card key={request.id} className="p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            {getStatusIcon(request.status)}
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                                {request.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <h4 className="text-lg font-semibold">{request.categoryName}</h4>
                                        <p className="text-sm text-gray-600">
                                            Requested by: {request.userEmail}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {formatDate(request.createdAt)}
                                        </p>
                                        {request.suggestedSkills && request.suggestedSkills.length > 0 && (
                                            <div className="mt-2">
                                                <p className="text-sm font-medium">Suggested Skills:</p>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {request.suggestedSkills.map((skill) => (
                                                        <span
                                                            key={skill}
                                                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button
                                            size="sm"
                                            onClick={() => handleApprove(request.id)}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <Check className="w-4 h-4 mr-1" />
                                            Approve
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleReject(request.id)}
                                        >
                                            <X className="w-4 h-4 mr-1" />
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {processedRequests.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4">Processed Requests</h3>
                    <div className="grid gap-4">
                        {processedRequests.map((request) => (
                            <Card key={request.id} className="p-4 opacity-75">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            {getStatusIcon(request.status)}
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                                {request.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <h4 className="text-lg font-semibold">{request.categoryName}</h4>
                                        <p className="text-sm text-gray-600">
                                            Requested by: {request.userEmail}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {formatDate(request.createdAt)}
                                        </p>
                                        {request.adminComment && (
                                            <p className="text-sm text-gray-600 mt-2">
                                                <strong>Admin Comment:</strong> {request.adminComment}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {requests.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No category requests found.
                </div>
            )}
        </div>
    );
};
