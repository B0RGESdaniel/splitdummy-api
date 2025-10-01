import { server, startBufferAndInit, shutdownAll } from "./app.ts";

const port = 3434;
const host = "0.0.0.0";

async function bootstrap() {
  try {
    await startBufferAndInit();

    await server.listen({ port, host });
    console.log(`HTTP server running!`);
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

bootstrap();

// graceful shutdown
const shutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}, shutting down...`);
  try {
    await server.close();
    await shutdownAll();
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
