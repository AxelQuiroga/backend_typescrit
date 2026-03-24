export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  password: string;
  username: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}