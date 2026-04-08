import type { RegisterUserInput } from "../../contracts/user/RegisterUserInput.js";
import type { UserRepository } from "../../../domain/repositories/UserRepository.js";
import bcrypt from "bcrypt";
import type { UserOutput } from "../../contracts/user/UserOutput.js";

export class RegisterUserUseCase {
  constructor(private userRepository: UserRepository) { }

  async execute(data: RegisterUserInput): Promise<UserOutput> {

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
