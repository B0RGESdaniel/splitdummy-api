import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { connection } from "../../database/duckdb/client.ts";
import { recordBufferItemDelta } from "../../database/duckdb/buffer.ts";

export const recordItemDeltaRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/items/delta",
    {
      schema: {
        tags: ["items"],
        summary: "Create a new item delta",
        body: z.object({
          itemId: z.uuid(),
          tabId: z.uuid(),
          delta: z.int(),
        }),
      },
    },
    async (request, reply) => {
      const { itemId, tabId, delta } = request.body;

      await connection.run(`
        CREATE TABLE IF NOT EXISTS item_changes (
          id TEXT,
          item_id TEXT,
          tab_id TEXT,
          delta INTEGER
        );
      `);

      const result = await recordBufferItemDelta(itemId, tabId, delta);

      return reply.status(201).send({ result });
    }
  );
};
