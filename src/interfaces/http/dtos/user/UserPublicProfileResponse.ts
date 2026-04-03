export interface UserPublicProfileResponse {//Para: GET /users/u/:username (perfil público)
  id: string;
  username: string;
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  location?: string | null;
  website?: string | null;
  createdAt: string;
}
