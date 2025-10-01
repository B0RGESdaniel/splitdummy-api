import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { connection } from "../../database/duckdb/client.ts";
import { recordBufferPartDelta } from "../../database/duckdb/buffer.ts";

export const recordPartDeltaRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/parts/delta",
    {
      schema: {
        tags: ["parts"],
        summary: "Create a new part delta",
        body: z.object({
          itemId: z.uuid(),
          tabId: z.uuid(),
          participantId: z.uuid(),
          delta: z.int(),
        }),
      },
    },
    async (request, reply) => {
      const { itemId, tabId, participantId, delta } = request.body;

      await connection.run(`
        CREATE TABLE IF NOT EXISTS part_changes (
          id TEXT,
          item_id TEXT,
          participant_id TEXT,
          tab_id TEXT,
          delta INTEGER
        );
      `);

      const result = await recordBufferPartDelta(
        itemId,
        tabId,
        participantId,
        delta
      );

      return reply.status(201).send({ result });
    }
  );
};
