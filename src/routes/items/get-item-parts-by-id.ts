import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../database/postgres/client.ts";
import { parts, participants } from "../../database/postgres/schema.ts";
import { eq } from "drizzle-orm";

export const getPartsByItemIdRoute: FastifyPluginAsyncZod = async (server) => {
  server.get(
    "/items/:id/parts",
    {
      schema: {
        tags: ["items"],
        summary: "Get parts by item id",
        params: z.object({
          id: z.uuid(),
        }),
        response: {
          200: z.object({
            participantParts: z.array(
              z.object({
                partId: z.uuid(),
                participantId: z.uuid(),
                participantName: z.string(),
                partsCount: z.int(),
              })
            ),
          }),
          404: z.null().describe("Item's parts not found"),
        },
      },
    },
    async (request, reply) => {
      const itemId = request.params.id;

      const result = await db
        .select({
          partId: parts.id,
          participantId: participants.id,
          participantName: participants.name,
          partsCount: parts.partsCount,
        })
        .from(parts)
        .innerJoin(participants, eq(parts.participantId, participants.id))
        .where(eq(parts.itemId, itemId));

      if (result.length > 0) {
        return reply.send({ participantParts: result });
      }

      return reply.status(404).send();
    }
  );
};
