import { PrismaClient } from "../prisma/generated/client";
import Redis from "ioredis";

declare const globalThis: {
    prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prismaClientSingleton = () => new PrismaClient();

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export { prisma };

if (process.env.NODE_ENV !== "production") {
    globalThis.prismaGlobal = prisma;
}

export const redis = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
});

// export * from '@prisma/client';
