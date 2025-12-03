import { z } from 'zod';
import { Priority, Gender } from '@/lib/domain';

export const checkInFormSchema = z.object({
  // Patient selection
  patientId: z.string().optional(),
  isWalkIn: z.boolean(),
  
  // Walk-in patient details (only required if isWalkIn is true)
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().optional().or(z.literal('')),
  dateOfBirth: z.string().optional(),
  gender: z.nativeEnum(Gender).optional(),
  
  // Visit details
  procedureId: z.string().min(1, 'Reason for visit is required'),
  priority: z.nativeEnum(Priority),
  symptoms: z.string().optional(),
  notes: z.string().optional(),
  
  // Insurance and consent
  insuranceVerified: z.boolean(),
  consentSigned: z.boolean(),
  
  // Appointment linking
  linkedAppointmentId: z.string().optional(),
}).refine((data) => {
  // If it's a walk-in, walk-in patient details are required
  if (data.isWalkIn) {
    return !!(data.firstName && data.lastName && data.phoneNumber && data.dateOfBirth && data.gender);
  }
  // If not a walk-in, patientId is required
  return !!data.patientId;
}, {
  message: "Please either select an existing patient or provide walk-in patient details",
  path: ['patientId']
});

export type CheckInFormData = z.infer<typeof checkInFormSchema>;