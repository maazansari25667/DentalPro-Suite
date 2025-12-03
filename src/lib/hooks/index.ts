// Re-export all hooks for easy importing

// Legacy hooks (WavenetCare operations) - explicit exports to avoid conflicts
export { 
  useDentists,
  useDentist as useLegacyDentist,
  useRooms,
  useRoom,
  useProcedures,
  useProcedure as useLegacyProcedure,
  useProceduresByCategory as useLegacyProceduresByCategory,
} from './useResources';

export * from './useCheckIns';
export * from './useQueue';

// Legacy appointments (avoiding conflict with new clinical appointments)
export { 
  useAppointments as useLegacyAppointments,
  useAppointment as useLegacyAppointment,
  useTodayAppointments
} from './useAppointments';

// New clinical hooks (Dental Hospital operations) - these are the primary hooks to use
export * from './appointments';
export * from './dentists';
export * from './procedures';