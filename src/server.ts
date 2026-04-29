import moduleAlias from "module-alias";
moduleAlias.addAliases({
  "@domain": "./dist/domain",
  "@application": "./dist/application", 
  "@infrastructure": "./dist/infrastructure",
  "@interfaces": "./dist/interfaces"
});

import app from "./app.js";
import { env } from "./config/env.js";
import { connectEventBus } from "./config/events.config.js";

async function bootstrap() {
  await connectEventBus();
  app.listen(env.PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${env.PORT}`);
  });
}

bootstrap();