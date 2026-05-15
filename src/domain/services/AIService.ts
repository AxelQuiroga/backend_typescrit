export interface AIService {
  consultar(prompt: string): Promise<string>;
}
