import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config(); // Carga la API Key desde el .env

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const consultarIA = async (prompt: string) => {
  try {
    // Usamos el modelo disponible
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error con Gemini:", error);
    return "Hubo un error al procesar tu consulta.";
  }
};