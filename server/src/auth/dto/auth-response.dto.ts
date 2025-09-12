import { UserRole } from 'src/users/entities/user.entity';

export class AuthResponseDto {
  access_token: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    managerName?: string | null;
  };
}
