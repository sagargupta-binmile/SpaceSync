import { z } from 'zod';

export const UpdateBookingSchema = z
  .object({
    booking_id: z.string().uuid(),
    room_id: z.string().uuid(),
    start_time: z.coerce.date(), // accepts ISO string or Date
    end_time: z.coerce.date(),
    updateFuture: z.boolean().optional().default(false), // 🔑 series vs single
    recurrenceRule: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional(),
    recurrenceEndDate: z.coerce.date().optional(),
  })
  // Validate end_time > start_time
  .refine((data) => data.end_time > data.start_time, {
    message: 'end_time must be after start_time',
    path: ['end_time'],
  })
  // If recurrenceRule is set, recurrenceEndDate must also be set
  .refine(
    (data) =>
      !data.recurrenceRule || (data.recurrenceRule && !!data.recurrenceEndDate),
    {
      message: 'recurrenceEndDate is required when recurrenceRule is set',
      path: ['recurrenceEndDate'],
    }
  );

export type UpdateBookingDto = z.infer<typeof UpdateBookingSchema>;
