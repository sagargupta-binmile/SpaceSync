import { z } from 'zod';

export const BookingSchema = z
  .object({
    room_id: z.string().uuid(),
    employee_id: z.string().uuid(),
    startTime: z
      .string()
      .transform((val, ctx) => {
        const date = new Date(val);
        if (isNaN(date.getTime())) {
          ctx.addIssue({
            code: 'custom',
            message: 'Invalid startTime format',
          });
          return z.NEVER;
        }
        return date;
      }),
    endTime: z
      .string()
      .transform((val, ctx) => {
        const date = new Date(val);
        if (isNaN(date.getTime())) {
          ctx.addIssue({
            code: 'custom',
            message: 'Invalid endTime format',
          });
          return z.NEVER;
        }
        return date;
      }),
    recurrenceRule: z
  .enum(['DAILY', 'WEEKLY', 'MONTHLY'])
  .nullable()
  .optional()
  .transform((val) => val || undefined),

    recurrenceEndDate: z
  .string()
  .nullable()
  .optional()
  .transform((val, ctx) => {
    if (!val) return undefined;
    const date = new Date(val);
    if (isNaN(date.getTime())) {
      ctx.addIssue({
        code: 'custom',
        message: 'Invalid recurrenceEndDate format',
      });
      return z.NEVER;
    }
    return date;
  })

  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'endTime must be after startTime',
    path: ['endTime'],
  })
  .refine(
    (data) => !data.recurrenceRule || (data.recurrenceRule && data.recurrenceEndDate),
    {
      message: 'recurrenceEndDate is required when recurrenceRule is provided',
      path: ['recurrenceEndDate'],
    }
  );

export type BookingDto = z.infer<typeof BookingSchema>;
