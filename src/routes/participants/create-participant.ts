import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../../database/postgres/client.ts";
import { participants } from "../../database/postgres/schema.ts";
import z from "zod";

export const createParticipantRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/participants",
    {
      schema: {
        tags: ["participants"],
        summary: "Create a new participant",
        body: z.object({
          name: z.string(),
          tabId: z.uuid(),
        }),
        response: {
          201: z
            .object({ participantId: z.uuid() })
            .describe("Participant created successfully"),
        },
      },
    },
    async (request, reply) => {
      const { name, tabId } = request.body;

      const result = await db
        .insert(participants)
        .values({
          name,
          tabId,
        })
        .returning();

      return reply.status(201).send({ participantId: result[0].id });
    }
  );
};
