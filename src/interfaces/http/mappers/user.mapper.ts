import type { LoginRequest } from "../dtos/user/LoginRequest.js";
import type { LoginResponse } from "../dtos/user/LoginResponse.js";
import type { RegisterUserRequest } from "../dtos/user/RegisterUserRequest.js";
import type { UpdateUserRequest } from "../dtos/user/UpdateUserRequest.js";
import type { UserResponse } from "../dtos/user/UserResponse.js";
import type { LoginInput } from "../../../application/contracts/user/LoginInput.js";
import type { LoginOutput } from "../../../application/contracts/user/LoginOutput.js";
import type { RegisterUserInput } from "../../../application/contracts/user/RegisterUserInput.js";
import type { UpdateUserInput } from "../../../application/contracts/user/UpdateUserInput.js";
import type { UserOutput } from "../../../application/contracts/user/UserOutput.js";
import type { UpdateProfileRequest } from "../dtos/user/UpdateProfileRequest.js";
import type { UserPrivateProfileResponse } from "../dtos/user/UserPrivateProfileResponse.js";
import type { UserPublicProfileResponse } from "../dtos/user/UserPublicProfileResponse.js";

import type { UpdateProfileInput } from "../../../application/contracts/user/UpdateProfileInput.js";
import type { UserPrivateProfileOutput } from "../../../application/contracts/user/UserPrivateProfileOutput.js";
import type { UserPublicProfileOutput } from "../../../application/contracts/user/UserPublicProfileOutput.js";



export function toLoginInput(body: LoginRequest): LoginInput {
  return {
    email: body.email,
    password: body.password
  };
}

export function toRegisterUserInput(
  body: RegisterUserRequest
): RegisterUserInput {
  return {
    email: body.email,
    password: body.password,
    username: body.username
  };
}

export function toUpdateUserInput(body: UpdateUserRequest): UpdateUserInput {
  const input: UpdateUserInput = {};

  if (body.email !== undefined) {
    input.email = body.email;
  }

  if (body.username !== undefined) {
    input.username = body.username;
  }

  return input;
}

export function toUserResponse(output: UserOutput): UserResponse {
  return {
    id: output.id,
    email: output.email,
    username: output.username,
    role: output.role,
    createdAt: output.createdAt,
    updatedAt: output.updatedAt
  };
}

export function toLoginResponse(output: LoginOutput): LoginResponse {
  return {
    token: output.token
  };
}

export function toUpdateProfileInput(
  body: UpdateProfileRequest
): UpdateProfileInput {
  const input: UpdateProfileInput = {};

  if (body.displayName !== undefined) input.displayName = body.displayName;
  if (body.bio !== undefined) input.bio = body.bio;
  if (body.avatarUrl !== undefined) input.avatarUrl = body.avatarUrl;
  if (body.coverUrl !== undefined) input.coverUrl = body.coverUrl;
  if (body.location !== undefined) input.location = body.location;
  if (body.website !== undefined) input.website = body.website;

  return input;
}


export function toUserPrivateProfileResponse(
  output: UserPrivateProfileOutput
): UserPrivateProfileResponse {
  return {
    id: output.id,
    email: output.email,
    username: output.username,
    displayName: output.displayName ?? null,
    bio: output.bio ?? null,
    avatarUrl: output.avatarUrl ?? null,
    coverUrl: output.coverUrl ?? null,
    location: output.location ?? null,
    website: output.website ?? null,
    createdAt: output.createdAt.toISOString(),
    updatedAt: output.updatedAt.toISOString()
  };
}

export function toUserPublicProfileResponse(
  output: UserPublicProfileOutput
): UserPublicProfileResponse {
  return {
    id: output.id,
    username: output.username,
    displayName: output.displayName ?? null,
    bio: output.bio ?? null,
    avatarUrl: output.avatarUrl ?? null,
    coverUrl: output.coverUrl ?? null,
    location: output.location ?? null,
    website: output.website ?? null,
    createdAt: output.createdAt.toISOString()
  };
}

