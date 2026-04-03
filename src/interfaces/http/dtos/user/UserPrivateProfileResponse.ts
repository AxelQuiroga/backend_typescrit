export interface UserPrivateProfileResponse {//Para: GET /users/me (perfil propio)
  id: string;
  email: string;
  username: string;
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  location?: string | null;
  website?: string | null;
  createdAt: string;
  updatedAt: string;
}
