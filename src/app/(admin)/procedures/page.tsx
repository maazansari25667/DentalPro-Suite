'use client';

import React, { useState, useMemo } from 'react';
import { 
  Scissors,
  Plus,
  Search,
  Filter,
  DollarSign,
  Clock,
  Activity,
  Edit,
  Trash2,
  Tag,
  Calendar,
  TrendingUp,
  Package,
  Eye,
  X
} from 'lucide-react';
import { useProcedures } from '@/lib/hooks/procedures';
import { Procedure } from '@/lib/domain';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';

// CRUD Modal Components
interface ProcedureFormData {
  name: string;
  code: string;
  description: string;
  category: string;
  price: number;
  defaultMinutes: number;
  active: boolean;
}

interface ProcedureModalProps {
  isOpen: boolean;
  onClose: () => void;
  procedure?: Procedure;
  mode: 'create' | 'edit' | 'view' | 'delete';
}

function ProcedureModal({ isOpen, onClose, procedure, mode }: ProcedureModalProps) {
  const [formData, setFormData] = useState<ProcedureFormData>(() => ({
    name: procedure?.name || '',
    code: procedure?.code || '',
    description: procedure?.description || '',
    category: procedure?.category || '',
    price: procedure?.price || 0,
    defaultMinutes: procedure?.defaultMinutes || 30,
    active: procedure?.active ?? true
  }));

  const availableCategories = [
    'General Dentistry',
    'Orthodontics', 
    'Endodontics',
    'Periodontics',
    'Oral Surgery',
    'Pediatric Dentistry',
    'Prosthodontics',
    'Cosmetic Dentistry',
    'Preventive',
    'Restorative'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view') return;
    
    if (mode === 'delete') {
      handleDeleteConfirm();
      return;
    }
    
    // Here you would call the create/update mutation
    console.log('Form submitted:', formData);
    onClose();
  };

  const handleDeleteConfirm = () => {
    if (!procedure) return;
    // Here you would call the delete mutation
    console.log('Deleting procedure:', procedure.code);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'create' ? 'New Procedure' : mode === 'edit' ? 'Edit Procedure' : mode === 'delete' ? 'Delete Procedure' : 'Procedure Details'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {mode === 'delete' ? (
          <div className="text-center py-6">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <X className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Delete Procedure
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this procedure? This action cannot be undone.
            </p>
            {procedure && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left">
                <div className="font-medium text-gray-900 dark:text-white mb-2">
                  {procedure.name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Code: {procedure.code}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Price: ${procedure.price}
                </div>
              </div>
            )}
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Procedure
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Procedure Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={mode === 'view'}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={mode === 'view'}
                  placeholder="e.g., D0120"
                  required
                />
              </div>
            </div>

            {/* Category & Status */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={mode === 'view'}
                >
                  <option value="">Select Category</option>
                  {availableCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={formData.active ? 'active' : 'inactive'}
                  onChange={(e) => setFormData({ ...formData, active: e.target.value === 'active' })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={mode === 'view'}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Price & Duration */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price ($) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={mode === 'view'}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.defaultMinutes}
                  onChange={(e) => setFormData({ ...formData, defaultMinutes: parseInt(e.target.value) || 30 })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={mode === 'view'}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={mode === 'view'}
                placeholder="Detailed description of the procedure..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              {mode === 'view' ? (
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Close
                </Button>
              ) : (
                <>
                  <button 
                    type="submit" 
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {mode === 'create' ? 'Create Procedure' : 'Save Changes'}
                  </button>
                  <Button variant="outline" onClick={onClose} className="flex-1">
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const categoryColors = {
  'General Dentistry': 'info',
  'Orthodontics': 'success', 
  'Endodontics': 'primary',
  'Periodontics': 'warning',
  'Oral Surgery': 'error',
  'Pediatric Dentistry': 'info',
  'Prosthodontics': 'primary',
  'Cosmetic Dentistry': 'info',
  'Preventive': 'success',
  'Restorative': 'warning'
} as const;

export default function ProceduresPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'duration' | 'usage'>('name');
  
  // Modal states
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view' | 'delete';
    procedure?: Procedure;
  }>({
    isOpen: false,
    mode: 'create'
  });
  
  const { data: procedures = [], isLoading } = useProcedures();

  // Modal state management
  const openCreateModal = () => {
    setModalState({
      isOpen: true,
      mode: 'create'
    });
  };

  const openEditModal = (procedure: Procedure) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      procedure
    });
  };

  const openViewModal = (procedure: Procedure) => {
    setModalState({
      isOpen: true,
      mode: 'view',
      procedure
    });
  };

  const openDeleteModal = (procedure: Procedure) => {
    setModalState({
      isOpen: true,
      mode: 'delete',
      procedure
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: 'create'
    });
  };

  const filteredProcedures = useMemo(() => {
    const filtered = procedures.filter((procedure: Procedure) => {
      const matchesSearch = 
        (procedure.name && procedure.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (procedure.code && procedure.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (procedure.description && procedure.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = categoryFilter === 'all' || 
        (procedure.category && procedure.category.toLowerCase() === categoryFilter.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && procedure.active) ||
        (statusFilter === 'inactive' && !procedure.active);
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort procedures
    filtered.sort((a: Procedure, b: Procedure) => {
      switch (sortBy) {
        case 'price':
          return b.price - a.price;
        case 'duration':
          return b.defaultMinutes - a.defaultMinutes;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [procedures, searchTerm, categoryFilter, statusFilter, sortBy]);

  const procedureStats = useMemo(() => {
    const total = procedures.length;
    const active = procedures.filter((p: Procedure) => p && p.active).length;
    const inactive = procedures.filter((p: Procedure) => p && !p.active).length;
    const categories = [...new Set(procedures.filter((p: Procedure) => p && p.category).map((p: Procedure) => p.category))].length;
    const avgPrice = procedures.length > 0 ? procedures.filter((p: Procedure) => p && typeof p.price === 'number').reduce((sum: number, p: Procedure) => sum + p.price, 0) / procedures.length : 0;
    const avgDuration = procedures.length > 0 ? procedures.filter((p: Procedure) => p && typeof p.defaultMinutes === 'number').reduce((sum: number, p: Procedure) => sum + p.defaultMinutes, 0) / procedures.length : 0;
    
    return { total, active, inactive, categories, avgPrice, avgDuration };
  }, [procedures]);

  const allCategories = useMemo(() => {
    return [...new Set(procedures.filter((p: Procedure) => p && p.category).map((p: Procedure) => p.category))] as string[];
  }, [procedures]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dental Procedures
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage dental services and treatment procedures
            </p>
          </div>
          <Button className="flex items-center gap-2" onClick={openCreateModal}>
            <Plus className="w-4 h-4" />
            Add Procedure
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">{procedureStats.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Procedures</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">{procedureStats.active}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-gray-600">{procedureStats.inactive}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Inactive</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-purple-600">{procedureStats.categories}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-orange-600">{formatPrice(procedureStats.avgPrice)}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Price</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-indigo-600">{Math.round(procedureStats.avgDuration)}m</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Duration</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search procedures by name, code, or description..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div>
                <select
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {allCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <select
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'duration' | 'usage')}
                >
                  <option value="name">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                  <option value="duration">Sort by Duration</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Procedures Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProcedures.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No procedures found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No procedures have been added yet'
              }
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add First Procedure
            </Button>
          </div>
        ) : (
          filteredProcedures.map((procedure: Procedure) => (
            <div
              key={procedure.code}
              className="bg-white dark:bg-gray-800 border rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                      {procedure.name}
                    </h3>
                    <Badge color={procedure.active ? 'success' : 'error'}>
                      {procedure.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Tag className="w-4 h-4" />
                    <span className="font-medium">{procedure.code}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openViewModal(procedure)}
                    className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(procedure)}
                    className="inline-flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors"
                    title="Edit Procedure"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(procedure)}
                    className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Delete Procedure"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Category */}
              {procedure.category && (
                <div className="mb-3">
                  <Badge 
                    size="sm"
                    color={categoryColors[procedure.category as keyof typeof categoryColors] || 'light'}
                  >
                    {procedure.category}
                  </Badge>
                </div>
              )}

              {/* Description */}
              {procedure.description && (
                <div className="mb-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {procedure.description}
                  </div>
                </div>
              )}

              {/* Key Info */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <div>
                    <div className="font-semibold text-green-600">
                      {formatPrice(procedure.price)}
                    </div>
                    <div className="text-xs text-gray-500">Price</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-semibold text-blue-600">
                      {formatDuration(procedure.defaultMinutes)}
                    </div>
                    <div className="text-xs text-gray-500">Duration</div>
                  </div>
                </div>
              </div>

              {/* Usage Stats (placeholder) */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">0</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">This Month</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-indigo-600">0</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Total Usage</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <Button size="sm" className="flex-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  Schedule
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Analytics
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {modalState.isOpen && (
        <ProcedureModal
          isOpen={modalState.isOpen}
          mode={modalState.mode}
          procedure={modalState.procedure}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
