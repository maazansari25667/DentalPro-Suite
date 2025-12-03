import { z } from 'zod';

// Procedure validation schema
export const ProcedureSchema = z.object({
  code: z.string()
    .min(2, "Code must be at least 2 characters")
    .max(12, "Code cannot exceed 12 characters")
    .regex(/^[A-Z0-9]+$/, "Code must contain only uppercase letters and numbers")
    .transform((val) => val.toUpperCase()),
  name: z.string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name cannot exceed 100 characters"),
  defaultMinutes: z.number()
    .int("Duration must be a whole number")
    .min(5, "Duration must be at least 5 minutes")
    .max(240, "Duration cannot exceed 240 minutes"),
  price: z.number()
    .min(0, "Price cannot be negative")
    .max(10000, "Price seems unreasonably high"),
  category: z.string()
    .min(1, "Category is required")
    .optional(),
  description: z.string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  active: z.boolean().default(true),
});

// Dentist validation schema
export const DentistSchema = z.object({
  name: z.string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name cannot exceed 100 characters")
    .regex(/^[a-zA-Z\s\-\.]+$/, "Name can only contain letters, spaces, hyphens, and periods"),
  email: z.string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
  phone: z.string()
    .regex(/^[\+]?[0-9\s\-\(\)]{10,}$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
  specialties: z.array(z.string())
    .min(1, "At least one specialty is required")
    .max(10, "Cannot have more than 10 specialties"),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color")
    .default("#3B82F6"),
  licenseNumber: z.string()
    .min(3, "License number must be at least 3 characters")
    .max(20, "License number cannot exceed 20 characters")
    .optional()
    .or(z.literal("")),
  bio: z.string()
    .max(1000, "Bio cannot exceed 1000 characters")
    .optional()
    .or(z.literal("")),
  active: z.boolean().default(true),
});

// Dentist availability schema
export const DentistAvailabilitySchema = z.object({
  dentistId: z.string().min(1, "Dentist ID is required"),
  rules: z.array(
    z.object({
      weekday: z.number().int().min(0).max(6),
      start: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Start time must be in HH:mm format"),
      end: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "End time must be in HH:mm format"),
    }).refine((data) => data.start < data.end, {
      message: "End time must be after start time",
      path: ["end"],
    })
  ).min(1, "At least one availability rule is required"),
  overrides: z.array(
    z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
      start: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
      end: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
      closed: z.boolean().optional(),
    }).refine((data) => {
      if (!data.closed && data.start && data.end) {
        return data.start < data.end;
      }
      return true;
    }, {
      message: "End time must be after start time",
      path: ["end"],
    })
  ).optional(),
});

// Appointment validation schema
export const AppointmentSchema = z.object({
  patientId: z.string()
    .min(1, "Patient selection is required"),
  dentistId: z.string()
    .min(1, "Dentist selection is required"),
  procedureCode: z.string()
    .min(1, "Procedure selection is required"),
  roomId: z.string()
    .optional()
    .or(z.literal("")),
  scheduledStart: z.string()
    .datetime("Please enter a valid date and time")
    .refine((date) => new Date(date) > new Date(), {
      message: "Appointment must be scheduled in the future",
    }),
  scheduledMinutes: z.number()
    .int("Duration must be a whole number")
    .min(5, "Duration must be at least 5 minutes")
    .max(240, "Duration cannot exceed 240 minutes"),
  notes: z.string()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

// Form schemas for create/update operations
export const CreateProcedureSchema = ProcedureSchema.omit({ 
  // Remove fields that are auto-generated
});

export const UpdateProcedureSchema = ProcedureSchema.partial().extend({
  code: z.string().min(1, "Code is required"), // Code is required for updates
});

export const CreateDentistSchema = DentistSchema.omit({
  // All fields are required for creation
});

export const UpdateDentistSchema = DentistSchema.partial().extend({
  name: z.string().min(3, "Name is required"), // Name is always required
});

export const CreateAppointmentSchema = AppointmentSchema.omit({
  // All fields are required for creation
});

export const UpdateAppointmentSchema = AppointmentSchema.partial();

// Status update schemas
export const AppointmentStatusUpdateSchema = z.object({
  status: z.enum(["scheduled", "checked_in", "in_progress", "completed", "cancelled", "no_show"]),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

export const RescheduleAppointmentSchema = z.object({
  scheduledStart: z.string().datetime("Please enter a valid date and time"),
  scheduledMinutes: z.number().int().min(5).max(240),
  dentistId: z.string().min(1, "Dentist is required").optional(),
  roomId: z.string().optional(),
  notes: z.string().max(500).optional(),
});

// Bulk operations schemas
export const BulkAppointmentActionSchema = z.object({
  appointmentIds: z.array(z.string()).min(1, "At least one appointment must be selected"),
  action: z.enum(["cancel", "mark_no_show", "reschedule"]),
  notes: z.string().max(500).optional(),
  newScheduledStart: z.string().datetime().optional(), // For reschedule
  newDentistId: z.string().optional(), // For reschedule
});

export const BulkProcedureActionSchema = z.object({
  procedureCodes: z.array(z.string()).min(1, "At least one procedure must be selected"),
  action: z.enum(["activate", "deactivate", "update_category", "update_price"]),
  category: z.string().optional(), // For update_category
  priceMultiplier: z.number().min(0.1).max(10).optional(), // For update_price
});

// Search and filter schemas
export const AppointmentFilterSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  dentistId: z.string().optional(),
  roomId: z.string().optional(),
  status: z.string().optional(),
  procedureCode: z.string().optional(),
  patientId: z.string().optional(),
  q: z.string().max(100).optional(), // Search query
});

export const DentistFilterSchema = z.object({
  specialty: z.string().optional(),
  active: z.boolean().optional(),
  q: z.string().max(100).optional(),
});

export const ProcedureFilterSchema = z.object({
  category: z.string().optional(),
  active: z.boolean().optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  q: z.string().max(100).optional(),
});

// Export types
export type ProcedureFormData = z.infer<typeof ProcedureSchema>;
export type DentistFormData = z.infer<typeof DentistSchema>;
export type DentistAvailabilityFormData = z.infer<typeof DentistAvailabilitySchema>;
export type AppointmentFormData = z.infer<typeof AppointmentSchema>;
export type AppointmentStatusUpdate = z.infer<typeof AppointmentStatusUpdateSchema>;
export type RescheduleAppointmentData = z.infer<typeof RescheduleAppointmentSchema>;
export type AppointmentFilters = z.infer<typeof AppointmentFilterSchema>;
export type DentistFilters = z.infer<typeof DentistFilterSchema>;
export type ProcedureFilters = z.infer<typeof ProcedureFilterSchema>;