import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../../database/postgres/client.ts";
import { participants } from "../../database/postgres/schema.ts";
import z from "zod";
import { eq } from "drizzle-orm";

export const deleteParticipantRoute: FastifyPluginAsyncZod = async (server) => {
  server.delete(
    "/participants/:id",
    {
      schema: {
        tags: ["participants"],
        summary: "Delete one participant and it's related parts",
        params: z.object({
          id: z.uuid(),
        }),
        response: {
          200: z
            .object({
              message: z.string(),
            })
            .describe("Participant deleted successfuly"),
        },
      },
    },
    async (request, reply) => {
      const participantId = request.params.id;

      await db
        .delete(participants)
        .where(eq(participants.id, participantId))
        .returning();

      return reply
        .status(200)
        .send({ message: "Participant deleted successfuly" });
    }
  );
};
