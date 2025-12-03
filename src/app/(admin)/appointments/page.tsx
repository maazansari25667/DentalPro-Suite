'use client';

import React, { useState, useMemo } from 'react';
import { 
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  User,
  MapPin,
  Phone,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  X
} from 'lucide-react';
import { useAppointments } from '@/lib/hooks/appointments';
import { useDentists } from '@/lib/hooks/dentists';
import { useProcedures } from '@/lib/hooks/procedures';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import type { AppointmentStatus, Appointment, Dentist, Procedure } from '@/lib/domain';

// CRUD Modal Components
interface AppointmentFormData {
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  dentistId: string;
  procedureCode: string;
  scheduledStart: string;
  scheduledMinutes: number;
  notes?: string;
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: Appointment;
  mode: 'create' | 'edit' | 'view' | 'delete';
}

function AppointmentModal({ isOpen, onClose, appointment, mode }: AppointmentModalProps) {
  const { data: dentists = [] } = useDentists();
  const { data: procedures = [] } = useProcedures();
  
  const [formData, setFormData] = useState<AppointmentFormData>(() => ({
    patientName: appointment ? `${appointment.patient?.firstName || ''} ${appointment.patient?.lastName || ''}` : '',
    patientEmail: appointment?.patient?.email || '',
    patientPhone: appointment?.patient?.phoneNumber || '',
    dentistId: appointment?.dentist?.id || '',
    procedureCode: appointment?.procedure?.code || '',
    scheduledStart: appointment && appointment.scheduledStart ? appointment.scheduledStart.split('T')[0] + 'T' + appointment.scheduledStart.split('T')[1].slice(0, 5) : '',
    scheduledMinutes: appointment?.scheduledMinutes || 30,
    notes: appointment?.notes || ''
  }));

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
    if (!appointment) return;
    // Here you would call the delete mutation
    console.log('Deleting appointment:', appointment.id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'create' ? 'New Appointment' : mode === 'edit' ? 'Edit Appointment' : mode === 'delete' ? 'Delete Appointment' : 'Appointment Details'}
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
              Delete Appointment
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this appointment? This action cannot be undone.
            </p>
            {appointment && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left">
                <div className="font-medium text-gray-900 dark:text-white mb-2">
                  {appointment.patient?.firstName || 'Unknown'} {appointment.patient?.lastName || ''}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {appointment.scheduledStart ? new Date(appointment.scheduledStart).toLocaleDateString() : 'No date'} at{' '}
                  {appointment.scheduledStart ? new Date(appointment.scheduledStart).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  }) : 'No time'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {appointment.procedure?.name || 'No procedure'} with Dr. {appointment.dentist?.name || 'Unknown'}
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
                Delete Appointment
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Patient Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Patient Name *
                </label>
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
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
                  value={formData.patientEmail}
                  onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={mode === 'view'}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={formData.patientPhone}
                  onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={mode === 'view'}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dentist *
                </label>
                <select
                  value={formData.dentistId}
                  onChange={(e) => setFormData({ ...formData, dentistId: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={mode === 'view'}
                  required
                >
                  <option value="">Select Dentist</option>
                  {dentists.map((dentist: Dentist) => (
                    <option key={dentist.id} value={dentist.id}>
                      Dr. {dentist.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Procedure *
                </label>
                <select
                  value={formData.procedureCode}
                  onChange={(e) => setFormData({ ...formData, procedureCode: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={mode === 'view'}
                  required
                >
                  <option value="">Select Procedure</option>
                  {procedures.map((procedure: Procedure) => (
                    <option key={procedure.code} value={procedure.code}>
                      {procedure.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledStart}
                  onChange={(e) => setFormData({ ...formData, scheduledStart: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={mode === 'view'}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Duration (minutes) *
              </label>
              <input
                type="number"
                min="15"
                step="15"
                value={formData.scheduledMinutes}
                onChange={(e) => setFormData({ ...formData, scheduledMinutes: parseInt(e.target.value) })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={mode === 'view'}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={mode === 'view'}
                placeholder="Special instructions or notes..."
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
                    {mode === 'create' ? 'Create Appointment' : 'Save Changes'}
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

const statusColors = {
  scheduled: 'info' as const,
  checked_in: 'warning' as const,
  in_progress: 'primary' as const, 
  completed: 'success' as const,
  cancelled: 'error' as const,
  no_show: 'error' as const
};

const statusLabels = {
  scheduled: 'Scheduled',
  checked_in: 'Checked In',
  in_progress: 'In Progress', 
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show'
};

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Modal states
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view' | 'delete';
    appointment?: Appointment;
  }>({
    isOpen: false,
    mode: 'create'
  });
  
  const { data: appointments = [], isLoading: appointmentsLoading } = useAppointments();

  // Modal state management
  const openCreateModal = () => {
    setModalState({
      isOpen: true,
      mode: 'create'
    });
  };

  const openEditModal = (appointment: Appointment) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      appointment
    });
  };

  const openViewModal = (appointment: Appointment) => {
    setModalState({
      isOpen: true,
      mode: 'view',
      appointment
    });
  };

  const openDeleteModal = (appointment: Appointment) => {
    setModalState({
      isOpen: true,
      mode: 'delete',
      appointment
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: 'create'
    });
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment: Appointment) => {
      const matchesSearch = 
        (appointment.patient && appointment.patient.firstName && appointment.patient.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (appointment.patient && appointment.patient.lastName && appointment.patient.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (appointment.dentist && appointment.dentist.name && appointment.dentist.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
      
      const appointmentDate = appointment.scheduledStart ? new Date(appointment.scheduledStart).toISOString().split('T')[0] : '';
      const matchesDate = appointmentDate === selectedDate;
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [appointments, searchTerm, statusFilter, selectedDate]);

  const appointmentStats = useMemo(() => {
    const total = filteredAppointments.length;
    const scheduled = filteredAppointments.filter((a: Appointment) => a && a.status === 'scheduled').length;
    const checkedIn = filteredAppointments.filter((a: Appointment) => a && a.status === 'checked_in').length;
    const inProgress = filteredAppointments.filter((a: Appointment) => a && a.status === 'in_progress').length;
    const completed = filteredAppointments.filter((a: Appointment) => a && a.status === 'completed').length;
    
    return { total, scheduled, checkedIn, inProgress, completed };
  }, [filteredAppointments]);

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  if (appointmentsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i: number) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
              Dental Appointments
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Schedule and manage dental consultations and procedures
            </p>
          </div>
          <Button className="flex items-center gap-2" onClick={openCreateModal}>
            <Plus className="w-4 h-4" />
            New Appointment
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">{appointmentStats.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-gray-600">{appointmentStats.scheduled}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Scheduled</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-orange-600">{appointmentStats.checkedIn}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Checked In</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-purple-600">{appointmentStats.inProgress}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">{appointmentStats.completed}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
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
                  placeholder="Search patients or dentists..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <select
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | 'all')}
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="checked_in">Checked In</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No appointments found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No appointments scheduled for this date'
              }
            </p>
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Schedule New Appointment
            </Button>
          </div>
        ) : (
          filteredAppointments.filter((appointment: Appointment) => appointment && appointment.patient && appointment.dentist).map((appointment: Appointment) => (
            <div
              key={appointment.id}
              className="bg-white dark:bg-gray-800 border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold text-lg">
                        {appointment.scheduledStart ? formatTime(appointment.scheduledStart) : 'No time set'}
                      </span>
                      <span className="text-gray-500">
                        ({appointment.scheduledMinutes ? formatDuration(appointment.scheduledMinutes) : '0m'})
                      </span>
                    </div>
                    <Badge color={statusColors[appointment.status as keyof typeof statusColors] || 'light'}>
                      {statusLabels[appointment.status as keyof typeof statusLabels] || appointment.status}
                    </Badge>
                    <Badge color="info" size="sm">
                      {appointment.priority ? appointment.priority.toUpperCase() : 'NORMAL'}
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Patient Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold">Patient</span>
                      </div>
                      <div className="ml-6">
                        <div className="font-medium text-lg">
                          {appointment.patient.firstName || 'Unknown'} {appointment.patient.lastName || ''}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {appointment.patient.phoneNumber || 'No phone'}
                          </div>
                          {appointment.patient.email && (
                            <div>{appointment.patient.email}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Treatment Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-green-600" />
                        <span className="font-semibold">Treatment</span>
                      </div>
                      <div className="ml-6">
                        <div className="font-medium">{appointment.procedure?.name || 'No procedure'}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Dr. {appointment.dentist?.name || 'Unknown'}
                        </div>
                        {appointment.room && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {appointment.room.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notes:
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {appointment.notes}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => openViewModal(appointment)}
                    className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(appointment)}
                    className="inline-flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors"
                    title="Edit Appointment"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(appointment)}
                    className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Delete Appointment"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {modalState.isOpen && (
        <AppointmentModal
          isOpen={modalState.isOpen}
          mode={modalState.mode}
          appointment={modalState.appointment}
          onClose={closeModal}
        />
      )}
    </div>
  );
}