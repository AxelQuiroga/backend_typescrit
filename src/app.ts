import express from "express";
import userRoutes from "./interfaces/http/routes/user.routes.js";
import { logger } from "./middlewares/logger.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());
app.use(logger);

app.use("/users", userRoutes);

// SIEMPRE al final
app.use(errorHandler);

export default app;