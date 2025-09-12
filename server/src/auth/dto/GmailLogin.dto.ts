import { z } from 'zod';

export const GmailLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type GmailLoginDto = z.infer<typeof GmailLoginSchema>;
