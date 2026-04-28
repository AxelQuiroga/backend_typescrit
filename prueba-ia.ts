import { consultarIA } from "./src/application/use-cases/ai.service.ts";

consultarIA("Dame un consejo para un desarrollador backend junior")
  .then(res => console.log("IA dice:", res));