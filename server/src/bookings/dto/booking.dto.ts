import { z } from 'zod';

export const BookingSchema = z
  .object({
    room_id: z.string().uuid(),
    employee_id: z.string().uuid(),
    startTime: z.string().transform((val, ctx) => {
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid date format',
        });
        return z.NEVER;
      }
      return date;
    }),
    endTime: z.string().transform((val, ctx) => {
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid date format',
        });
        return z.NEVER;
      }
      return date;
    }),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'endTime must be after startTime',
    path: ['endTime'],
  });

export type BookingDto = z.infer<typeof BookingSchema>;
