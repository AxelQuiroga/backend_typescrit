import { z } from "zod";
import { emailField, passwordField, usernameField } from "./common.js";

export const registerSchema = {
  body: z.object({
    email: emailField,
    password: passwordField,
    username: usernameField
  }).strict()
};

export const loginSchema = {
  body: z.object({
    email: emailField,
    password: passwordField
  }).strict()
};

// Perfil público por username
export const publicProfileSchema = {
  params: z.object({
    username: usernameField
  }).strict()
};

const urlField = z.string().url();
const displayNameField = z.string().trim().min(2).max(50);
const bioField = z.string().trim().min(1).max(240);
const locationField = z.string().trim().min(2).max(80);

export const updateProfileSchema = {
  body: z.object({
    displayName: displayNameField.nullable().optional(),
    bio: bioField.nullable().optional(),
    avatarUrl: urlField.nullable().optional(),
    coverUrl: urlField.nullable().optional(),
    location: locationField.nullable().optional(),
    website: urlField.nullable().optional(),

    // si todavía querés permitir actualizar esto:
    email: emailField.optional(),
    username: usernameField.optional()
  })
  .refine((data) => {
    return Object.values(data).some((v) => v !== undefined);
  }, {
    message: "Debe enviar al menos un campo para actualizar"
  })
  .strict()
};