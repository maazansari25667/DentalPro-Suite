'use client';

import React, { useState, useMemo } from 'react';
import { 
  User,
  Plus,
  Search,
  Mail,
  Phone,
  Award,
  Calendar,
  Activity,
  Edit,
  Settings,
  MapPin,
  Clock,
  Star,
  Eye,
  X,
  Trash2
} from 'lucide-react';
import { useDentists } from '@/lib/hooks/dentists';
import { Dentist } from '@/lib/domain';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';

// CRUD Modal Components
interface DentistFormData {
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  specialties: string[];
  bio: string;
  color: string;
  active: boolean;
}

interface DentistModalProps {
  isOpen: boolean;
  onClose: () => void;
  dentist?: Dentist;
  mode: 'create' | 'edit' | 'view' | 'delete';
}

function DentistModal({ isOpen, onClose, dentist, mode }: DentistModalProps) {
  const [formData, setFormData] = useState<DentistFormData>(() => ({
    name: dentist?.name || '',
    email: dentist?.email || '',
    phone: dentist?.phone || '',
    licenseNumber: dentist?.licenseNumber || '',
    specialties: dentist?.specialties || [],
    bio: dentist?.bio || '',
    color: dentist?.color || '#3B82F6',
    active: dentist?.active ?? true
  }));

  const availableSpecialties = [
    'General Dentistry',
    'Orthodontics', 
    'Endodontics',
    'Periodontics',
    'Oral Surgery',
    'Pediatric Dentistry',
    'Prosthodontics',
    'Cosmetic Dentistry'
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
    if (!dentist) return;
    // Here you would call the delete mutation
    console.log('Deleting dentist:', dentist.id);
    onClose();
  };

  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      specialties: checked 
        ? [...prev.specialties, specialty]
        : prev.specialties.filter(s => s !== specialty)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'create' ? 'New Dentist' : mode === 'edit' ? 'Edit Dentist' : mode === 'delete' ? 'Delete Dentist' : 'Dentist Details'}
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
              Delete Dentist
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this dentist? This action cannot be undone.
            </p>
            {dentist && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left">
                <div className="font-medium text-gray-900 dark:text-white mb-2">
                  Dr. {dentist.name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {dentist.email}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  License: {dentist.licenseNumber}
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
                Delete Dentist
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name *
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
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={mode === 'view'}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={mode === 'view'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  License Number
                </label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={mode === 'view'}
                />
              </div>
            </div>

            {/* Specialties */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Specialties
              </label>
              <div className="grid grid-cols-2 gap-2">
                {availableSpecialties.map((specialty) => (
                  <label key={specialty} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.specialties.includes(specialty)}
                      onChange={(e) => handleSpecialtyChange(specialty, e.target.checked)}
                      disabled={mode === 'view'}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{specialty}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={mode === 'view'}
                placeholder="Brief professional background..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-10 p-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                  disabled={mode === 'view'}
                />
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
                    {mode === 'create' ? 'Create Dentist' : 'Save Changes'}
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

const specialtyColors = {
  'General Dentistry': 'info',
  'Orthodontics': 'success', 
  'Endodontics': 'primary',
  'Periodontics': 'warning',
  'Oral Surgery': 'error',
  'Pediatric Dentistry': 'info',
  'Prosthodontics': 'primary',
  'Cosmetic Dentistry': 'info'
} as const;

export default function DentistsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Modal states
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view' | 'delete';
    dentist?: Dentist;
  }>({
    isOpen: false,
    mode: 'create'
  });
  
  const { data: dentists = [], isLoading } = useDentists();

  // Modal state management
  const openCreateModal = () => {
    setModalState({
      isOpen: true,
      mode: 'create'
    });
  };

  const openEditModal = (dentist: Dentist) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      dentist
    });
  };

  const openViewModal = (dentist: Dentist) => {
    setModalState({
      isOpen: true,
      mode: 'view',
      dentist
    });
  };

  const openDeleteModal = (dentist: Dentist) => {
    setModalState({
      isOpen: true,
      mode: 'delete',
      dentist
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: 'create'
    });
  };

  const filteredDentists = useMemo(() => {
    return dentists.filter((dentist: Dentist) => {
      const matchesSearch = 
        (dentist.name && dentist.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (dentist.email && dentist.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (dentist.licenseNumber && dentist.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSpecialty = specialtyFilter === 'all' || 
        (dentist.specialties && dentist.specialties.some(s => s.toLowerCase().includes(specialtyFilter.toLowerCase())));
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && dentist.active) ||
        (statusFilter === 'inactive' && !dentist.active);
      
      return matchesSearch && matchesSpecialty && matchesStatus;
    });
  }, [dentists, searchTerm, specialtyFilter, statusFilter]);

  const dentistStats = useMemo(() => {
    const total = dentists.length;
    const active = dentists.filter((d: Dentist) => d && d.active).length;
    const inactive = dentists.filter((d: Dentist) => d && !d.active).length;
    const specialties = [...new Set(dentists.filter((d: Dentist) => d && d.specialties).flatMap((d: Dentist) => d.specialties))].length;
    
    return { total, active, inactive, specialties };
  }, [dentists]);

  const allSpecialties = useMemo(() => {
    return [...new Set(dentists.filter((d: Dentist) => d && d.specialties).flatMap((d: Dentist) => d.specialties))] as string[];
  }, [dentists]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i: number) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
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
              Dental Specialists
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage dental specialist profiles and schedules
            </p>
          </div>
          <Button className="flex items-center gap-2" onClick={openCreateModal}>
            <Plus className="w-4 h-4" />
            Add Dentist
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">{dentistStats.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Dentists</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">{dentistStats.active}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-gray-600">{dentistStats.inactive}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Inactive</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-purple-600">{dentistStats.specialties}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Specialties</div>
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
                  placeholder="Search dentists by name, email, or license..."
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
                  value={specialtyFilter}
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                >
                  <option value="all">All Specialties</option>
                  {allSpecialties.map((specialty) => (
                    <option key={specialty} value={specialty}>{specialty}</option>
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
            </div>
          </div>
        </div>
      </div>

      {/* Dentists Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDentists.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No dentists found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || specialtyFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No dentists have been added yet'
              }
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add First Dentist
            </Button>
          </div>
        ) : (
          filteredDentists.filter((dentist: Dentist) => dentist && dentist.name).map((dentist: Dentist) => (
            <div
              key={dentist.id}
              className="bg-white dark:bg-gray-800 border rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: dentist.color || '#3B82F6' }}
                  >
                    {dentist.name ? dentist.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'D'}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                      Dr. {dentist.name || 'Unknown'}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge color={dentist.active ? 'success' : 'error'}>
                        {dentist.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openViewModal(dentist)}
                    className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(dentist)}
                    className="inline-flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors"
                    title="Edit Dentist"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(dentist)}
                    className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Delete Dentist"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                {dentist.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4" />
                    {dentist.email}
                  </div>
                )}
                {dentist.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4" />
                    {dentist.phone}
                  </div>
                )}
                {dentist.licenseNumber && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Award className="w-4 h-4" />
                    License: {dentist.licenseNumber}
                  </div>
                )}
              </div>

              {/* Specialties */}
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Specialties:
                </div>
                <div className="flex flex-wrap gap-1">
                  {dentist.specialties && dentist.specialties.length > 0 ? dentist.specialties.map((specialty, index) => (
                    <Badge 
                      key={index} 
                      size="sm"
                      color={specialtyColors[specialty as keyof typeof specialtyColors] || 'light'}
                    >
                      {specialty}
                    </Badge>
                  )) : (
                    <span className="text-sm text-gray-500">No specialties listed</span>
                  )}
                </div>
              </div>

              {/* Bio */}
              {dentist.bio && (
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    About:
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {dentist.bio}
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">0</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Today's Patients</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">0</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">This Week</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <Button size="sm" className="flex-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  Schedule
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Activity className="w-4 h-4 mr-1" />
                  Availability
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {modalState.isOpen && (
        <DentistModal
          isOpen={modalState.isOpen}
          mode={modalState.mode}
          dentist={modalState.dentist}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
