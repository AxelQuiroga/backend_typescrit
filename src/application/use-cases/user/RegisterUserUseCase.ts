import { prisma } from "../../../infrastructure/database/prisma.js";
import type { RegisterUserDTO } from "../../dtos/RegisterUserDTO.js";
import type { User } from "../../../domain/entities/user.js";
export class RegisterUserUseCase {
  async execute(data: RegisterUserDTO): Promise<User> {
    
    // 🔒 Validaciones
    if (!data.email.includes("@")) {
      throw new Error("Email inválido");
    }

    if (data.password.length < 6) {
      throw new Error("Password muy corta");
    }

    if (data.username.length < 3) {
      throw new Error("Username muy corto");
    }

    // 🔍 Verificar si existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error("El usuario ya existe");
    }

    // 🗄️ Guardar en DB
    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        username: data.username,
        role: "USER"
      }
    });

    return newUser;
  }
}