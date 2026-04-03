export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  password: string;
  username: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  //new changes because of private profile and public profile
  displayName?: string | null
  bio?: string | null
  avatarUrl?: string | null
  coverUrl?: string | null
  location?: string | null
  website?: string | null
}