import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../database/client.ts";
import { items } from "../database/schema.ts";
import { eq } from "drizzle-orm";

export const getItemsByTabIdRoute: FastifyPluginAsyncZod = async (server) => {
  server.get(
    "/tabs/:id/items",
    {
      schema: {
        tags: ["tabs"],
        summary: "Get tab items by id",
        params: z.object({
          id: z.uuid(),
        }),
        response: {
          200: z.object({
            items: z.array(
              z.object({
                id: z.uuid(),
                description: z.string(),
                unitPrice: z.string(),
                quantity: z.int(),
              })
            ),
          }),
          404: z.null().describe("Items not found"),
        },
      },
    },
    async (request, reply) => {
      const tabId = request.params.id;

      const result = await db
        .select()
        .from(items)
        .where(eq(items.tabId, tabId));

      if (result.length > 0) {
        return { items: result };
      }

      return reply.status(404).send();
    }
  );
};
