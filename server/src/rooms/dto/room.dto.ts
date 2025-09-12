import { z } from 'zod';

export const RoomSchema = z.object({
  name: z.string().min(2, { message: 'Room name must have at least 2 characters' }),
});

export type RoomDto = z.infer<typeof RoomSchema>;
