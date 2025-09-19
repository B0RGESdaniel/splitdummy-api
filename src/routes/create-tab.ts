import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../database/client.ts";
import { tabs } from "../database/schema.ts";
import z from "zod";

export const createTabRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/tabs",
    {
      schema: {
        tags: ["tabs"],
        summary: "Create a new tab",
        body: z.object({
          title: z.string(),
          ownerId: z.uuid(),
        }),
        response: {
          201: z
            .object({ tabId: z.uuid() })
            .describe("Tab created successfully"),
        },
      },
    },
    async (request, reply) => {
      const { title, ownerId } = request.body;

      const result = await db
        .insert(tabs)
        .values({
          title,
          ownerId,
        })
        .returning();

      return reply.status(201).send({ tabId: result[0].id });
    }
  );
};
