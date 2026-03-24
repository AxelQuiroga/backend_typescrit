import type { RegisterUserDTO } from "../../dtos/RegisterUserDTO.js";
import type { User } from "../../../domain/entities/user.js";
import type { UserRepository } from "../../../domain/repositories/UserRepository.js";
import bcrypt from "bcrypt";
import type { UserResponseDTO } from "../../dtos/UserResponseDTO.js";

export class RegisterUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(data: RegisterUserDTO): Promise<UserResponseDTO> {
    
    // 🔒 Validar existencia de campos
    if (!data.email || !data.password || !data.username) {
      throw new Error("Faltan campos obligatorios");
    }

    // 🔒 Validar tipos (extra pro)
    if (typeof data.email !== "string" || 
        typeof data.password !== "string" || 
        typeof data.username !== "string") {
      throw new Error("Datos inválidos");
    }

    // 🔒 Validaciones de contenido
    if (!data.email.includes("@")) {
      throw new Error("Email inválido");
    }

    if (data.password.length < 6) {
      throw new Error("Password muy corta");
    }

    if (data.username.length < 3) {
      throw new Error("Username muy corto");
    }

    // Verificar si existe
    const existingUser = await this.userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new Error("El usuario ya existe");
    }

    //  Hash password
    const rounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(data.password, rounds);

    const user = await this.userRepository.create({
      email: data.email,
      password: hashedPassword,
      username: data.username,
      role: "USER"
    })
    
    return {
       id: user.id,
  email: user.email,
  username: user.username,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
    }
  }
}