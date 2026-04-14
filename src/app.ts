import express from "express";
import userRoutes from "./interfaces/http/routes/user.routes.js";
import { logger } from "./middlewares/logger.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import postRoutes from "./interfaces/http/routes/post.routes.js";
import likeRoutes from "./interfaces/http/routes/like.routes.js";
import postCommentRoutes from "./interfaces/http/routes/post-comment.routes.js";
import commentRoutes from "./interfaces/http/routes/comment.routes.js";
import cors from "cors";
import { env } from "./config/env.js"; 



const app = express();

app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,  
}));

app.use(express.json());
app.use(logger);

app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/posts", likeRoutes);        // Rutas de likes (POST /:id/like, DELETE /:id/like, GET /:id/likes)
app.use("/posts", postCommentRoutes); // Rutas de comentarios en posts (POST /:id/comments, GET /:id/comments)
app.use("/comments", commentRoutes); // Rutas de comentarios individuales (PUT /:id, DELETE /:id, GET /:id/replies)
// SIEMPRE al final
app.use(errorHandler);

export default app;