import type express from "express";
import { prisma } from "@backend/database";
import PORT from "./global";

export default async function startServer(
    app: express.Application
): Promise<void> {
    try {
        await prisma.$connect();
        console.log("Successfully connected to the database."); // eslint-disable-line

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`); // eslint-disable-line
        });
    } catch (error) {
        console.error("Failed to connect to the database:", error); // eslint-disable-line
        throw new Error("Database connection failed, server will not start.");
    }
}
