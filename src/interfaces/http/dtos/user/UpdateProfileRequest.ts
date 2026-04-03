export interface UpdateProfileRequest {//Para: PUT /users/me
  // opcionalmente mantenés esto si querés seguir permitiendo update de email/username
  email?: string;
  username?: string;

  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  location?: string | null;
  website?: string | null;
}
