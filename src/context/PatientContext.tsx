'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Patient, PatientFormData } from '@/types/patient';

interface PatientContextType {
  patients: Patient[];
  addPatient: (patientData: PatientFormData) => string;
  updatePatient: (id: string, patientData: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  getPatient: (id: string) => Patient | undefined;
  searchPatients: (query: string) => Patient[];
  isLoading: boolean;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

// Mock data
const mockPatients: Patient[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1985-06-15',
    gender: 'Male',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Jane Smith',
      relationship: 'Wife',
      phone: '+1 (555) 123-4568'
    },
    medicalHistory: ['Dental Crown 2023', 'Root Canal 2022', 'Dental Cleaning'],
    allergies: ['Penicillin', 'Latex'],
    currentMedications: ['Antibiotics for gum infection'],
    bloodType: 'O+',
    height: '175',
    weight: '80',
    insuranceInfo: {
      provider: 'Dental Care Plus',
      policyNumber: 'DCP123456789'
    },
    lastVisit: '2024-01-15',
    nextAppointment: '2024-02-15',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 234-5678',
    dateOfBirth: '1990-03-22',
    gender: 'Female',
    address: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Mike Johnson',
      relationship: 'Husband',
      phone: '+1 (555) 234-5679'
    },
    medicalHistory: ['Wisdom Teeth Removal', 'Orthodontic Treatment'],
    allergies: ['Shellfish', 'Local Anesthetic'],
    currentMedications: ['Ibuprofen for tooth pain'],
    bloodType: 'A+',
    height: '165',
    weight: '65',
    insuranceInfo: {
      provider: 'SmileCare Insurance',
      policyNumber: 'SCI987654321'
    },
    lastVisit: '2024-01-10',
    nextAppointment: '2024-02-20',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z'
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@email.com',
    phone: '+1 (555) 345-6789',
    dateOfBirth: '1978-11-08',
    gender: 'Male',
    address: {
      street: '789 Pine St',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Lisa Brown',
      relationship: 'Sister',
      phone: '+1 (555) 345-6780'
    },
    medicalHistory: ['Dental Implant', 'Gum Disease Treatment', 'Teeth Whitening'],
    allergies: ['None'],
    currentMedications: ['Fluoride Toothpaste'],
    bloodType: 'B+',
    height: '180',
    weight: '90',
    insuranceInfo: {
      provider: 'Dental Health Network',
      policyNumber: 'DHN456789123'
    },
    lastVisit: '2024-01-08',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-08T00:00:00Z'
  },
  {
    id: '4',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@email.com',
    phone: '+1 (555) 456-7890',
    dateOfBirth: '1992-07-12',
    gender: 'Female',
    address: {
      street: '321 Elm Street',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Robert Davis',
      relationship: 'Father',
      phone: '+1 (555) 456-7891'
    },
    medicalHistory: ['Dental Cleaning', 'Cavity Filling'],
    allergies: ['Codeine'],
    currentMedications: ['None'],
    bloodType: 'AB+',
    height: '168',
    weight: '58',
    insuranceInfo: {
      provider: 'United Dental',
      policyNumber: 'UD789123456'
    },
    lastVisit: '2024-01-22',
    nextAppointment: '2024-03-10',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-22T00:00:00Z'
  },
  {
    id: '5',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@email.com',
    phone: '+1 (555) 567-8901',
    dateOfBirth: '1975-12-03',
    gender: 'Male',
    address: {
      street: '654 Maple Dr',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Jennifer Wilson',
      relationship: 'Wife',
      phone: '+1 (555) 567-8902'
    },
    medicalHistory: ['Root Canal', 'Bridge Installation', 'Periodontal Treatment'],
    allergies: ['Aspirin', 'Sulfa drugs'],
    currentMedications: ['Blood pressure medication'],
    bloodType: 'O-',
    height: '185',
    weight: '92',
    insuranceInfo: {
      provider: 'Aetna Dental',
      policyNumber: 'AD321654987'
    },
    lastVisit: '2024-01-05',
    nextAppointment: '2024-02-28',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z'
  },
  {
    id: '6',
    firstName: 'Jessica',
    lastName: 'Miller',
    email: 'jessica.miller@email.com',
    phone: '+1 (555) 678-9012',
    dateOfBirth: '1988-04-18',
    gender: 'Female',
    address: {
      street: '987 Cedar Lane',
      city: 'Philadelphia',
      state: 'PA',
      zipCode: '19101',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Mark Miller',
      relationship: 'Brother',
      phone: '+1 (555) 678-9013'
    },
    medicalHistory: ['Orthodontic Treatment', 'Tooth Extraction'],
    allergies: ['Peanuts'],
    currentMedications: ['Birth control'],
    bloodType: 'A-',
    height: '162',
    weight: '55',
    insuranceInfo: {
      provider: 'Delta Dental',
      policyNumber: 'DD456123789'
    },
    lastVisit: '2024-01-18',
    nextAppointment: '2024-02-25',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-18T00:00:00Z'
  },
  {
    id: '7',
    firstName: 'Christopher',
    lastName: 'Taylor',
    email: 'chris.taylor@email.com',
    phone: '+1 (555) 789-0123',
    dateOfBirth: '1982-09-25',
    gender: 'Male',
    address: {
      street: '147 Birch Ave',
      city: 'San Antonio',
      state: 'TX',
      zipCode: '78201',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Amanda Taylor',
      relationship: 'Wife',
      phone: '+1 (555) 789-0124'
    },
    medicalHistory: ['Dental Implants', 'Gum Surgery'],
    allergies: ['Lidocaine'],
    currentMedications: ['Diabetes medication'],
    bloodType: 'B-',
    height: '178',
    weight: '85',
    insuranceInfo: {
      provider: 'Cigna Dental',
      policyNumber: 'CD789456123'
    },
    lastVisit: '2024-01-12',
    nextAppointment: '2024-03-05',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-12T00:00:00Z'
  },
  {
    id: '8',
    firstName: 'Amanda',
    lastName: 'Anderson',
    email: 'amanda.anderson@email.com',
    phone: '+1 (555) 890-1234',
    dateOfBirth: '1995-01-30',
    gender: 'Female',
    address: {
      street: '258 Spruce St',
      city: 'San Diego',
      state: 'CA',
      zipCode: '92101',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Nancy Anderson',
      relationship: 'Mother',
      phone: '+1 (555) 890-1235'
    },
    medicalHistory: ['Dental Cleaning', 'Fluoride Treatment'],
    allergies: ['None'],
    currentMedications: ['Vitamins'],
    bloodType: 'AB-',
    height: '170',
    weight: '62',
    insuranceInfo: {
      provider: 'MetLife Dental',
      policyNumber: 'ML123789456'
    },
    lastVisit: '2024-01-20',
    nextAppointment: '2024-04-15',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    id: '9',
    firstName: 'Robert',
    lastName: 'Martinez',
    email: 'robert.martinez@email.com',
    phone: '+1 (555) 901-2345',
    dateOfBirth: '1970-05-14',
    gender: 'Male',
    address: {
      street: '369 Willow Rd',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75201',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Maria Martinez',
      relationship: 'Wife',
      phone: '+1 (555) 901-2346'
    },
    medicalHistory: ['Dentures', 'Multiple extractions', 'Oral surgery'],
    allergies: ['Iodine'],
    currentMedications: ['Heart medication', 'Blood thinner'],
    bloodType: 'O+',
    height: '182',
    weight: '95',
    insuranceInfo: {
      provider: 'Humana Dental',
      policyNumber: 'HD654987321'
    },
    lastVisit: '2024-01-03',
    nextAppointment: '2024-02-12',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z'
  },
  {
    id: '10',
    firstName: 'Lisa',
    lastName: 'Garcia',
    email: 'lisa.garcia@email.com',
    phone: '+1 (555) 012-3456',
    dateOfBirth: '1987-08-07',
    gender: 'Female',
    address: {
      street: '741 Poplar St',
      city: 'San Jose',
      state: 'CA',
      zipCode: '95101',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Carlos Garcia',
      relationship: 'Husband',
      phone: '+1 (555) 012-3457'
    },
    medicalHistory: ['Cosmetic bonding', 'Teeth whitening', 'Veneers'],
    allergies: ['Latex'],
    currentMedications: ['Prenatal vitamins'],
    bloodType: 'A+',
    height: '164',
    weight: '59',
    insuranceInfo: {
      provider: 'Guardian Dental',
      policyNumber: 'GD987321654'
    },
    lastVisit: '2024-01-25',
    nextAppointment: '2024-03-20',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-25T00:00:00Z'
  }
];

export function PatientProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [isLoading, setIsLoading] = useState(false);

  const addPatient = (patientData: PatientFormData): string => {
    const newPatient: Patient = {
      ...patientData,
      id: Date.now().toString(), // Simple ID generation
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPatients(prev => [...prev, newPatient]);
    return newPatient.id;
  };

  const updatePatient = (id: string, patientData: Partial<Patient>) => {
    setPatients(prev =>
      prev.map(patient =>
        patient.id === id
          ? { ...patient, ...patientData, updatedAt: new Date().toISOString() }
          : patient
      )
    );
  };

  const deletePatient = (id: string) => {
    setPatients(prev => prev.filter(patient => patient.id !== id));
  };

  const getPatient = (id: string): Patient | undefined => {
    return patients.find(patient => patient.id === id);
  };

  const searchPatients = (query: string): Patient[] => {
    const lowercaseQuery = query.toLowerCase();
    return patients.filter(
      patient =>
        patient.firstName.toLowerCase().includes(lowercaseQuery) ||
        patient.lastName.toLowerCase().includes(lowercaseQuery) ||
        patient.email.toLowerCase().includes(lowercaseQuery) ||
        patient.phone.includes(query)
    );
  };

  const value = {
    patients,
    addPatient,
    updatePatient,
    deletePatient,
    getPatient,
    searchPatients,
    isLoading
  };

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatients() {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatients must be used within a PatientProvider');
  }
  return context;
}