'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Calendar, Clock, User } from 'lucide-react';

import { checkInFormSchema, CheckInFormData } from './schema';
import { useProcedures } from '@/lib/hooks/useResources';
import { useTodayAppointments } from '@/lib/hooks/useAppointments';
import { useCreateCheckIn } from '@/lib/hooks/useCheckIns';
import { useCreateTicket } from '@/lib/hooks/useQueue';
import { usePatients } from '@/hooks/usePatients';
import { Priority, Gender, CreateCheckInRequest, Appointment, PatientRef } from '@/lib/domain';
import ComponentCard from '@/components/common/ComponentCard';
import Button from '@/components/ui/button/Button';
import Label from '@/components/form/Label';

export function CheckInForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nearbyAppointments, setNearbyAppointments] = useState<Appointment[]>([]);
  
  const { data: procedures } = useProcedures();
  const { data: todayAppointments } = useTodayAppointments();
  const { patients } = usePatients();
  const createCheckInMutation = useCreateCheckIn();
  const createTicketMutation = useCreateTicket();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset
  } = useForm<CheckInFormData>({
    resolver: zodResolver(checkInFormSchema),
    defaultValues: {
      isWalkIn: false,
      priority: Priority.NORMAL,
      insuranceVerified: false,
      consentSigned: false
    }
  });

  const isWalkIn = watch('isWalkIn');
  const selectedPatientId = watch('patientId');

  // Auto-scan appointments within ±90 minutes when patient is selected
  useEffect(() => {
    if (selectedPatientId && todayAppointments) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight
      
      const nearby = todayAppointments.filter(apt => {
        if (apt.patient.id !== selectedPatientId) return false;
        
        // Parse ISO datetime to get time
        const scheduledDate = new Date(apt.scheduledStart);
        const aptTime = scheduledDate.getHours() * 60 + scheduledDate.getMinutes();
        const timeDiff = Math.abs(currentTime - aptTime);
        
        return timeDiff <= 90; // Within 90 minutes
      });
      
      setNearbyAppointments(nearby);
      
      if (nearby.length === 1) {
        // Auto-link single nearby appointment
        setValue('linkedAppointmentId', nearby[0].id);
        setValue('procedureId', nearby[0].procedure.code);
        
        // Parse ISO datetime for display
        const scheduledDate = new Date(nearby[0].scheduledStart);
        const timeString = scheduledDate.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
        toast.success(`Automatically linked to ${timeString} appointment`);
      }
    } else {
      setNearbyAppointments([]);
      setValue('linkedAppointmentId', '');
    }
  }, [selectedPatientId, todayAppointments, setValue]);

  // Handle form submission
  const onSubmit = async (data: CheckInFormData) => {
    setIsSubmitting(true);
    
    try {
      // Prepare check-in request
      const checkInRequest: CreateCheckInRequest = {
        patientId: data.isWalkIn ? undefined : data.patientId,
        walkInPatient: data.isWalkIn ? {
          firstName: data.firstName!,
          lastName: data.lastName!,
          phoneNumber: data.phoneNumber!,
          email: data.email,
          dateOfBirth: data.dateOfBirth!,
          gender: data.gender!
        } : undefined,
        priority: data.priority,
        reasonForVisit: procedures?.find(p => p.id === data.procedureId)?.name || 'General Visit',
        symptoms: data.symptoms,
        isWalkIn: data.isWalkIn
      };

      // Create check-in
      const checkIn = await createCheckInMutation.mutateAsync(checkInRequest);
      
      // Create queue ticket
      await createTicketMutation.mutateAsync({
        checkInId: checkIn.id,
        procedureId: data.procedureId,
        priority: data.priority,
        estimatedDuration: procedures?.find(p => p.id === data.procedureId)?.duration || 30
      });

      // Success feedback
      const patientName = data.isWalkIn 
        ? `${data.firstName} ${data.lastName}`
        : patients.find((p: PatientRef) => p.id === data.patientId)?.firstName + ' ' + patients.find((p: PatientRef) => p.id === data.patientId)?.lastName;
      
      toast.success(`✅ ${patientName} checked in successfully! Queue ticket created.`);
      
      // Reset form
      reset();
      setNearbyAppointments([]);
      
    } catch (error) {
      console.error('Check-in failed:', error);
      toast.error('❌ Failed to check in patient. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit(onSubmit)();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit, onSubmit]);

  return (
    <ComponentCard title="Patient Check-In" className="max-w-4xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Walk-in Toggle */}
        <div className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <input
            type="checkbox"
            id="isWalkIn"
            {...register('isWalkIn')}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <Label htmlFor="isWalkIn" className="text-blue-800 font-medium">
            Walk-in Patient (No Appointment)
          </Label>
        </div>

        {/* Patient Selection or Walk-in Details */}
        {!isWalkIn ? (
          <div>
            <Label htmlFor="patientId">Select Existing Patient *</Label>
            <select
              {...register('patientId')}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a patient...</option>
              {patients.map((patient: PatientRef) => (
                <option key={patient.id} value={patient.id}>
                  {patient.firstName} {patient.lastName} - {patient.phoneNumber}
                </option>
              ))}
            </select>
            {errors.patientId && (
              <p className="mt-1 text-sm text-red-600">{errors.patientId.message}</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <input
                {...register('firstName')}
                placeholder="Enter first name"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <input
                {...register('lastName')}
                placeholder="Enter last name"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <input
                {...register('phoneNumber')}
                placeholder="(555) 123-4567"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <input
                {...register('email')}
                type="email"
                placeholder="patient@email.com"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <input
                {...register('dateOfBirth')}
                type="date"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.dateOfBirth && (
                <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="gender">Gender *</Label>
              <select
                {...register('gender')}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select gender...</option>
                <option value={Gender.MALE}>Male</option>
                <option value={Gender.FEMALE}>Female</option>
                <option value={Gender.OTHER}>Other</option>
                <option value={Gender.PREFER_NOT_TO_SAY}>Prefer not to say</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Nearby Appointments Alert */}
        {nearbyAppointments.length > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800">Appointments Found</h4>
                <p className="text-green-700 text-sm mt-1">
                  Found {nearbyAppointments.length} appointment(s) within 90 minutes:
                </p>
                {nearbyAppointments.map(apt => (
                  <div key={apt.id} className="mt-2 p-2 bg-white rounded border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        <Clock className="inline h-4 w-4 mr-1" />
                        {new Date(apt.scheduledStart).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: false 
                        })} - {apt.procedure.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setValue('linkedAppointmentId', apt.id)}
                        className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Link
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Visit Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="procedureId">Reason for Visit *</Label>
            <select
              {...register('procedureId')}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select procedure...</option>
              {procedures?.map(procedure => (
                <option key={procedure.id} value={procedure.id}>
                  {procedure.name} ({procedure.duration}min)
                </option>
              ))}
            </select>
            {errors.procedureId && (
              <p className="mt-1 text-sm text-red-600">{errors.procedureId.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="priority">Priority</Label>
            <select
              {...register('priority')}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={Priority.LOW}>Low</option>
              <option value={Priority.NORMAL}>Normal</option>
              <option value={Priority.HIGH}>High</option>
              <option value={Priority.URGENT}>Urgent</option>
              <option value={Priority.EMERGENCY}>Emergency</option>
            </select>
          </div>
        </div>

        {/* Symptoms */}
        <div>
          <Label htmlFor="symptoms">Symptoms / Chief Complaint</Label>
          <textarea
            {...register('symptoms')}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Describe current symptoms or reason for visit..."
          />
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Additional Notes</Label>
          <textarea
            {...register('notes')}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            placeholder="Any additional notes for the dental team..."
          />
        </div>

        {/* Insurance & Consent */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="insuranceVerified"
              {...register('insuranceVerified')}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <Label htmlFor="insuranceVerified" className="text-sm">
              Insurance verified
            </Label>
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="consentSigned"
              {...register('consentSigned')}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <Label htmlFor="consentSigned" className="text-sm">
              Consent forms signed
            </Label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
              Ctrl+Enter
            </kbd>
            {' '}to quick submit
          </div>
          
          <div className="space-x-3">
            <Button
              variant="outline"
              onClick={() => reset()}
              disabled={isSubmitting}
            >
              Clear Form
            </Button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px] inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-5 py-3.5 text-sm bg-blue-600 text-white shadow-theme-xs hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Check In Patient</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </form>
    </ComponentCard>
  );
}