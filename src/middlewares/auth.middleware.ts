import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { AuthPayload } from "../types/auth.js";

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new Error("No autorizado");
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            throw new Error("Token inválido");
        }

        const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;

        //  guardamos usuario en request
        req.user = decoded;

        next();
    } catch (error) {
        res.status(401).json({ error: "No autorizado" });
    }
}
