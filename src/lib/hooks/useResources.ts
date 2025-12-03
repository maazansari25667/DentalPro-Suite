import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DentistRef, Room, ProcedureRef } from '@/lib/domain';

// API base functions
const apiUrl = '/api';

async function fetchDentists(): Promise<DentistRef[]> {
  const response = await fetch(`${apiUrl}/dentists`);
  if (!response.ok) {
    throw new Error('Failed to fetch dentists');
  }
  const data = await response.json();
  return data.data;
}

async function fetchRooms(): Promise<Room[]> {
  const response = await fetch(`${apiUrl}/rooms`);
  if (!response.ok) {
    throw new Error('Failed to fetch rooms');
  }
  const data = await response.json();
  return data.data;
}

async function fetchProcedures(): Promise<ProcedureRef[]> {
  const response = await fetch(`${apiUrl}/procedures`);
  if (!response.ok) {
    throw new Error('Failed to fetch procedures');
  }
  const data = await response.json();
  return data.data;
}

// Dentists Hook
export function useDentists() {
  return useQuery({
    queryKey: ['dentists'],
    queryFn: fetchDentists,
    staleTime: 1000 * 60 * 10, // 10 minutes
    select: (data) => data.filter(dentist => dentist.isActive), // Only active dentists
  });
}

// Rooms Hook
export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: fetchRooms,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Available Rooms Hook (filtered)
export function useAvailableRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: fetchRooms,
    staleTime: 1000 * 60 * 5,
    select: (data) => data.filter(room => 
      room.status === 'available' || room.status === 'cleaning'
    ),
  });
}

// Procedures Hook
export function useProcedures() {
  return useQuery({
    queryKey: ['procedures'],
    queryFn: fetchProcedures,
    staleTime: 1000 * 60 * 15, // 15 minutes (procedures change rarely)
  });
}

// Procedures by Category Hook
export function useProceduresByCategory() {
  const { data: procedures, ...rest } = useProcedures();
  
  const groupedProcedures = procedures?.reduce((acc, procedure) => {
    if (!acc[procedure.category]) {
      acc[procedure.category] = [];
    }
    acc[procedure.category].push(procedure);
    return acc;
  }, {} as Record<string, ProcedureRef[]>);

  return {
    data: groupedProcedures,
    procedures,
    ...rest
  };
}

// Individual hooks for specific entities
export function useDentist(id: string | undefined) {
  const { data: dentists } = useDentists();
  return dentists?.find(dentist => dentist.id === id);
}

export function useRoom(id: string | undefined) {
  const { data: rooms } = useRooms();
  return rooms?.find(room => room.id === id);
}

export function useProcedure(id: string | undefined) {
  const { data: procedures } = useProcedures();
  return procedures?.find(procedure => procedure.id === id);
}