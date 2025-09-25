import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../database/client.ts";
import { participants, tabs, users } from "../database/schema.ts";
import z from "zod";
import { eq } from "drizzle-orm";

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

      const user = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, ownerId));

      await db.insert(participants).values({
        userId: ownerId,
        name: user[0].name,
        tabId: result[0].id,
      });

      return reply.status(201).send({ tabId: result[0].id });
    }
  );
};
