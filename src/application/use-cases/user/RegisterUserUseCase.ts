import type { RegisterUserDTO } from "../../dtos/RegisterUserDTO.js";
import type { User } from "../../../domain/entities/user.js";
import type { UserRepository } from "../../../domain/repositories/UserRepository.js";
import bcrypt from "bcrypt";
export class RegisterUserUseCase {
  constructor(private userRepository: UserRepository) {}

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

    const existingUser = await this.userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new Error("El usuario ya existe");
    }

    const rounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(data.password, rounds);

    return this.userRepository.create({
      email: data.email,
      password: hashedPassword,
      username: data.username,
      role: "USER"
    });
  }
}