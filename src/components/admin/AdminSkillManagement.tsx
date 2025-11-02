import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { db } from '@/lib/firebase/config';
import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { SkillCategory, useSkillCategories } from '@/lib/hooks/useSkillCategories';
import { useSkillCategoryRequests, useSkillRequests } from '@/lib/hooks/useSkillCategoryRequests';
import { Skill, useSkills } from '@/lib/hooks/useSkills';
import { AlertCircle, CheckCircle, Plus, Save, X } from 'lucide-react';
import React, { useState } from 'react';
import { ApproveButton } from '../ui/ApproveButton';
import { DeleteButton } from '../ui/DeleteButton';
import PrimaryButton from '../ui/PrimaryButton';
import { RejectButton } from '../ui/RejectButton';
import { EditButton } from '../ui/edit-button';

interface BulkCategoryItem {
  name: string;
}

interface BulkSkillItem {
  name: string;
  categoryId: string;
}

const AdminSkillManagement = () => {
  // Use custom hooks
  const {
    categories,
    loading: categoriesLoading,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useSkillCategories();

  const {
    skills,
    loading: skillsLoading,
    addSkill,
    updateSkill,
    deleteSkill,
  } = useSkills(categories);

  const {
    categoryRequests,
    loading: categoryRequestsLoading,
    approveCategoryRequest,
    rejectCategoryRequest,
    getPendingCategoryRequests,
  } = useSkillCategoryRequests();

  const {
    skillRequests,
    loading: skillRequestsLoading,
    approveSkillRequest,
    rejectSkillRequest,
    getPendingSkillRequests,
  } = useSkillRequests();

  // Component state
  const [activeTab, setActiveTab] = useState<'categories' | 'skills' | 'categoryRequests' | 'skillRequests'>('categories');
  const [formData, setFormData] = useState({ name: '', categoryId: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [bulkCategories, setBulkCategories] = useState<BulkCategoryItem[]>([
    { name: '' },
    { name: '' },
    { name: '' },
  ]);
  const [bulkSkills, setBulkSkills] = useState<BulkSkillItem[]>([
    { name: '', categoryId: '' },
    { name: '', categoryId: '' },
    { name: '', categoryId: '' },
  ]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loading = categoriesLoading || skillsLoading || categoryRequestsLoading || skillRequestsLoading;

  const resetForm = () => {
    setFormData({ name: '', categoryId: '' });
    setEditingId(null);
    setShowAddForm(false);
    setError('');
    setSuccess('');
  };

  const resetBulkForm = () => {
    setBulkCategories([{ name: '' }, { name: '' }, { name: '' }]);
    setBulkSkills([
      { name: '', categoryId: '' },
      { name: '', categoryId: '' },
      { name: '', categoryId: '' },
    ]);
    setShowBulkForm(false);
    setError('');
    setSuccess('');
  };

  const addBulkCategoryRow = () => {
    setBulkCategories([...bulkCategories, { name: '' }]);
  };

  const removeBulkCategoryRow = (index: number) => {
    if (bulkCategories.length > 1) {
      setBulkCategories(bulkCategories.filter((_, i) => i !== index));
    }
  };

  const updateBulkCategory = (index: number, value: string) => {
    const updatedItems = [...bulkCategories];
    updatedItems[index] = { name: value };
    setBulkCategories(updatedItems);
  };

  const addBulkSkillRow = () => {
    setBulkSkills([...bulkSkills, { name: '', categoryId: '' }]);
  };

  const removeBulkSkillRow = (index: number) => {
    if (bulkSkills.length > 1) {
      setBulkSkills(bulkSkills.filter((_, i) => i !== index));
    }
  };

  const updateBulkSkill = (index: number, field: 'name' | 'categoryId', value: string) => {
    const updatedItems = [...bulkSkills];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setBulkSkills(updatedItems);
  };

  const handleBulkCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = bulkCategories.filter(item => item.name.trim());

    if (validItems.length === 0) {
      showMessage('Please fill in at least one category name', true);
      return;
    }

    try {
      const batch = writeBatch(db);

      validItems.forEach((item) => {
        const categoryRef = doc(collection(db, 'skillCategories'));
        batch.set(categoryRef, {
          name: item.name.trim(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
      showMessage(`Successfully added ${validItems.length} categor${validItems.length > 1 ? 'ies' : 'y'}`);
      resetBulkForm();
    } catch (error) {
      console.error('Error bulk adding categories:', error);
      showMessage('Failed to add categories', true);
    }
  };

  const handleBulkSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = bulkSkills.filter(item => item.name.trim() && item.categoryId);

    if (validItems.length === 0) {
      showMessage('Please fill in at least one skill with name and category', true);
      return;
    }

    try {
      const batch = writeBatch(db);

      validItems.forEach((item) => {
        const skillRef = doc(collection(db, 'skills'));
        batch.set(skillRef, {
          name: item.name.trim(),
          categoryId: item.categoryId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
      showMessage(`Successfully added ${validItems.length} skill${validItems.length > 1 ? 's' : ''}`);
      resetBulkForm();
    } catch (error) {
      console.error('Error bulk adding skills:', error);
      showMessage('Failed to add skills', true);
    }
  };

  const showMessage = (message: string, isError = false) => {
    if (isError) {
      setError(message);
      setSuccess('');
    } else {
      setSuccess(message);
      setError('');
    }
    setTimeout(() => {
      setError('');
      setSuccess('');
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (activeTab === 'categories') {
        if (editingId) {
          await updateCategory(editingId, formData.name);
          showMessage('Category updated successfully');
        } else {
          await addCategory(formData.name);
          showMessage('Category added successfully');
        }
      } else if (activeTab === 'skills') {
        if (editingId) {
          await updateSkill(editingId, formData.name, formData.categoryId);
          showMessage('Skill updated successfully');
        } else {
          await addSkill(formData.name, formData.categoryId);
          showMessage('Skill added successfully');
        }
      }
      resetForm();
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'An error occurred', true);
    }
  };

  const handleEdit = (item: SkillCategory | Skill) => {
    setFormData({
      name: item.name,
      categoryId: 'categoryId' in item ? item.categoryId : '',
    });
    setEditingId(item.id);
    setShowAddForm(true);
    // Set active tab based on item type
    setActiveTab('categoryId' in item ? 'skills' : 'categories');
  };

  const handleDelete = async (id: string, type: 'category' | 'skill') => {
    const itemType = type === 'category' ? 'category' : 'skill';
    if (!confirm(`Are you sure you want to delete this ${itemType}?`)) return;

    try {
      if (type === 'category') {
        await deleteCategory(id);
        showMessage('Category deleted successfully');
      } else {
        await deleteSkill(id);
        showMessage('Skill deleted successfully');
      }
    } catch (error) {
      showMessage(error instanceof Error ? error.message : `Failed to delete ${itemType}`, true);
    }
  };

  const handleCategoryRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await approveCategoryRequest(requestId);
        showMessage('Category request approved successfully');
      } else {
        await rejectCategoryRequest(requestId);
        showMessage('Category request rejected successfully');
      }
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'Failed to process request', true);
    }
  };

  const handleSkillRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await approveSkillRequest(requestId);
        showMessage('Skill request approved successfully');
      } else {
        await rejectSkillRequest(requestId);
        showMessage('Skill request rejected successfully');
      }
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'Failed to process request', true);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading...</div>;
  }

  const pendingCategoryRequests = getPendingCategoryRequests();
  const pendingSkillRequests = getPendingSkillRequests();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Skill Management</h1>
        {!showAddForm && !showBulkForm && (
          <div className="flex gap-3">
            <PrimaryButton onClick={() => { setShowAddForm(true); setActiveTab('categories'); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Category
            </PrimaryButton>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setShowBulkForm(true)}
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Bulk Create
            </Button>
          </div>
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
          Category Requests ({pendingCategoryRequests.length})
          {pendingCategoryRequests.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {pendingCategoryRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('skillRequests')}
          className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'skillRequests' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'} relative`}
        >
          Skill Requests ({pendingSkillRequests.length})
          {pendingSkillRequests.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {pendingSkillRequests.length}
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

      {showBulkForm && (
        <Card className="mb-8 p-6">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Bulk Create {activeTab === 'categories' ? 'Categories' : 'Skills'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">Add multiple items at once. Empty rows will be ignored.</p>
              </div>
              <Button type="button" variant="outline" onClick={resetBulkForm}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {activeTab === 'categories' ? (
              <form onSubmit={handleBulkCategorySubmit}>
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider px-2">
                    <div className="col-span-10">Category Name *</div>
                    <div className="col-span-2">Actions</div>
                  </div>

                  {bulkCategories.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-10">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateBulkCategory(index, e.target.value)}
                          placeholder="e.g., Programming Languages"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeBulkCategoryRow(index)}
                          disabled={bulkCategories.length === 1}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addBulkCategoryRow}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Row
                  </Button>
                  <div className="flex-1"></div>
                  <Button type="button" variant="outline" onClick={resetBulkForm}>
                    Cancel
                  </Button>
                  <PrimaryButton type="submit">
                    <Save className="w-4 h-4 mr-2" />
                    Create All Categories
                  </PrimaryButton>
                </div>
              </form>
            ) : (
              <form onSubmit={handleBulkSkillSubmit}>
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider px-2">
                    <div className="col-span-5">Skill Name *</div>
                    <div className="col-span-5">Category *</div>
                    <div className="col-span-2">Actions</div>
                  </div>

                  {bulkSkills.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateBulkSkill(index, 'name', e.target.value)}
                          placeholder="e.g., JavaScript"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="col-span-5">
                        <select
                          value={item.categoryId}
                          onChange={(e) => updateBulkSkill(index, 'categoryId', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Category</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeBulkSkillRow(index)}
                          disabled={bulkSkills.length === 1}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addBulkSkillRow}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Row
                  </Button>
                  <div className="flex-1"></div>
                  <Button type="button" variant="outline" onClick={resetBulkForm}>
                    Cancel
                  </Button>
                  <PrimaryButton type="submit">
                    <Save className="w-4 h-4 mr-2" />
                    Create All Skills
                  </PrimaryButton>
                </div>
              </form>
            )}
          </div>
        </Card>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              {activeTab === 'skills' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={e => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <p className="text-gray-500">No categories found. Add a new category to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map(category => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center gap-2 justify-end">
                          <EditButton onEdit={() => handleEdit(category)} editData={category} />
                          <DeleteButton onDelete={() => handleDelete(category.id, 'category')} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'skills' && (
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Skills ({skills.length})</h2>
            <PrimaryButton onClick={() => { setShowAddForm(true); setActiveTab('skills'); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Skill
            </PrimaryButton>
          </div>
          {skills.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">No skills found. Add a new skill to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {skills.map(skill => (
                    <tr key={skill.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{skill.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {categories.find(c => c.id === skill.categoryId)?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center gap-2 justify-end">
                          <EditButton onEdit={() => handleEdit(skill)} editData={skill} />
                          <DeleteButton onDelete={() => handleDelete(skill.id, 'skill')} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
              <p className="text-gray-500">No category requests.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categoryRequests.map(request => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.requestedBy}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {request.status === 'pending' && (
                          <div className="flex items-center gap-2 justify-end">
                            <ApproveButton
                              onApprove={async () => { await handleCategoryRequestAction(request.id, 'approve'); }}
                              tooltip="Approve request"
                            />
                            <RejectButton
                              onReject={async () => { await handleCategoryRequestAction(request.id, 'reject'); }}
                              tooltip="Reject request"
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
              <p className="text-gray-500">No skill requests.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {skillRequests.map(request => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {categories.find(c => c.id === request.categoryId)?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.requestedBy}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {request.status === 'pending' && (
                          <div className="flex items-center gap-2 justify-end">
                            <ApproveButton
                              onApprove={async () => { await handleSkillRequestAction(request.id, 'approve'); }}
                              tooltip="Approve request"
                            />
                            <RejectButton
                              onReject={async () => { await handleSkillRequestAction(request.id, 'reject'); }}
                              tooltip="Reject request"
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default AdminSkillManagement;
