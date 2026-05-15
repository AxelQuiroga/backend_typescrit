import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIService } from "../../domain/services/AIService.js";
import * as dotenv from "dotenv";

dotenv.config();

export class GeminiAIService implements AIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }

  async consultar(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error con Gemini:", error);
      return "Hubo un error al procesar tu consulta.";
    }
  }
}
