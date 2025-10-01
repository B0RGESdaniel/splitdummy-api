import fastify from "fastify";
import {
  validatorCompiler,
  serializerCompiler,
  type ZodTypeProvider,
  jsonSchemaTransform,
} from "fastify-type-provider-zod";
import { fastifySwagger } from "@fastify/swagger";
import scalarApiReference from "@scalar/fastify-api-reference";

import { createUserRoute } from "./routes/users/create-user.ts";
import { createItemRoute } from "./routes/items/create-item.ts";
import { createTabRoute } from "./routes/tabs/create-tab.ts";
import { createParticipantRoute } from "./routes/participants/create-participant.ts";
import { createPartRoute } from "./routes/parts/create-part.ts";
import { getItemsByTabIdRoute } from "./routes/tabs/get-tab-items-by-id.ts";
import { getParticpantsByTabIdRoute } from "./routes/tabs/get-tab-participants-by-id.ts";
import { getPartsByItemIdRoute } from "./routes/items/get-item-parts-by-id.ts";
import { recordItemDeltaRoute } from "./routes/items/record-item-delta.ts";
import { recordPartDeltaRoute } from "./routes/parts/record-part-delta.ts";

import {
  initDuckTables,
  startBufferWorker,
  stopBufferWorker,
} from "./database/duckdb/buffer.ts";
import { pool } from "./database/postgres/client.ts";
import { updateItemQuantityRoute } from "./routes/items/update-item-quantity.ts";
import { deleteItemRoute } from "./routes/items/delete-item.ts";
import { deleteParticipantRoute } from "./routes/participants/delete-participant.ts";

const server = fastify().withTypeProvider<ZodTypeProvider>();

if (process.env.NODE_ENV === "development") {
  server.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Splitdummy API",
        version: "1.0.0",
      },
    },
    transform: jsonSchemaTransform,
  });

  server.register(scalarApiReference, {
    routePrefix: "/docs",
  });
}

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.register(createUserRoute);
server.register(createItemRoute);
server.register(createTabRoute);
server.register(createParticipantRoute);
server.register(createPartRoute);

server.register(updateItemQuantityRoute);
server.register(deleteItemRoute);
server.register(deleteParticipantRoute);

server.register(getItemsByTabIdRoute);
server.register(getParticpantsByTabIdRoute);
server.register(getPartsByItemIdRoute);

server.register(recordItemDeltaRoute);
server.register(recordPartDeltaRoute);

export async function startBufferAndInit() {
  await initDuckTables();
  startBufferWorker();
  server.log.info("DuckDB buffer initialized and worker started");
}

export async function shutdownAll() {
  server.log.info("Shutting down buffer worker and DB connections...");
  try {
    await stopBufferWorker();
  } catch (err: any) {
    server.log.warn("Error stopping buffer worker:", err);
  }

  try {
    await pool.end();
  } catch (err: any) {
    server.log.warn("Error closing Postgres pool:", err);
  }
}

export { server };
