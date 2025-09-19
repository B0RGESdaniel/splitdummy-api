import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../database/client.ts";
import { parts } from "../database/schema.ts";
import z from "zod";

export const createPartRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/parts",
    {
      schema: {
        tags: ["parts"],
        summary: "Create a new part",
        body: z.object({
          partsCount: z.int().min(0, "Part can't be less than zero"),
          tabId: z.uuid(),
          participantId: z.uuid(),
          itemId: z.uuid(),
        }),
        response: {
          201: z
            .object({ partId: z.uuid() })
            .describe("Part created successfully"),
        },
      },
    },
    async (request, reply) => {
      const { partsCount, participantId, itemId, tabId } = request.body;

      const result = await db
        .insert(parts)
        .values({
          partsCount,
          participantId,
          itemId,
          tabId,
        })
        .returning();

      return reply.status(201).send({ partId: result[0].id });
    }
  );
};
