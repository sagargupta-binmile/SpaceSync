import { z } from 'zod';

export const RoomSchema = z.object({
  name: z.string().min(2, { message: 'Room name must have at least 2 characters' }),
  capacity:z.number(),
});

export type RoomDto = z.infer<typeof RoomSchema>;
