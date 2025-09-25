import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../database/client.ts";
import { participants } from "../database/schema.ts";
import { eq, sql } from "drizzle-orm";

export const getParticpantsByTabIdRoute: FastifyPluginAsyncZod = async (
  server
) => {
  server.get(
    "/tabs/:id/participants",
    {
      schema: {
        tags: ["tabs"],
        summary: "Get tab participants by id",
        params: z.object({
          id: z.uuid(),
        }),
        response: {
          200: z.object({
            participants: z.array(
              z.object({
                id: z.uuid(),
                name: z.string(),
                isOwner: z.boolean(),
              })
            ),
          }),
          404: z.null().describe("Participants not found"),
        },
      },
    },
    async (request, reply) => {
      const tabId = request.params.id;

      const result = await db
        .select({
          id: participants.id,
          name: participants.name,
          isOwner: sql<boolean>`${participants.userId} IS NOT NULL`,
        })
        .from(participants)
        .where(eq(participants.tabId, tabId));

      if (result.length > 0) {
        return { participants: result };
      }

      return reply.status(404).send();
    }
  );
};
