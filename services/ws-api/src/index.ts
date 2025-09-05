import { bootstrap } from "./server";

const PORT = Number(process.env.PORT ?? 8081);
const httpServer = bootstrap();

httpServer.listen(PORT, () => {
  console.log(`🚀 WebSocket API server running on port ${PORT}`);
});
