import http, { IncomingMessage, ServerResponse } from "http";
import { Server as SocketServer } from "socket.io";
import { setupSocketHandlers } from "./handlers";
import { redis } from "@backend/database";

export const bootstrap = () => {
  const httpServer = http.createServer();

  const io = new SocketServer(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    transports: ["websocket", "polling"],
  });

  setupSocketHandlers(io);

  httpServer.on(
    "request",
    async (req: IncomingMessage, res: ServerResponse) => {
      try {
        if (req.url === "/health") {
          res.writeHead(200, { "Content-Type": "application/json" });
          const ts = new Date().toISOString();
          await redis.set("ws-api:health", ts);
          const last = await redis.get("ws-api:health");
          res.end(JSON.stringify({ status: "OK", service: "ws-api", last }));
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Not found" }));
        }
      } catch (e) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Health handler error" }));
      }
    }
  );

  return httpServer;
};
