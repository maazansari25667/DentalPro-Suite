import { useMemo } from 'react';
import { PatientRef } from '@/lib/domain';

// Mock patients data - replace with real API call
const mockPatients: PatientRef[] = [
  {
    id: 'patient-1',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '(555) 123-4567',
    email: 'john.doe@email.com',
    dateOfBirth: '1985-03-15',
    gender: 'male' as any,
  },
  {
    id: 'patient-2',
    firstName: 'Jane',
    lastName: 'Smith',
    phoneNumber: '(555) 987-6543',
    email: 'jane.smith@email.com',
    dateOfBirth: '1990-07-22',
    gender: 'female' as any,
  },
  {
    id: 'patient-3',
    firstName: 'Robert',
    lastName: 'Johnson',
    phoneNumber: '(555) 456-7890',
    email: 'robert.johnson@email.com',
    dateOfBirth: '1978-11-08',
    gender: 'male' as any,
  },
];

export function usePatients() {
  const patients = useMemo(() => mockPatients, []);
  
  return { patients };
}