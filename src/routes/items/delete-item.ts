import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../../database/postgres/client.ts";
import { items } from "../../database/postgres/schema.ts";
import z from "zod";
import { eq } from "drizzle-orm";

export const deleteItemRoute: FastifyPluginAsyncZod = async (server) => {
  server.delete(
    "/items/:id",
    {
      schema: {
        tags: ["items"],
        summary: "Delete one item and it's related parts",
        params: z.object({
          id: z.uuid(),
        }),
        response: {
          200: z
            .object({
              message: z.string(),
            })
            .describe("Item deleted successfuly"),
        },
      },
    },
    async (request, reply) => {
      const itemId = request.params.id;

      await db.delete(items).where(eq(items.id, itemId)).returning();

      return reply.status(200).send({ message: "Item deleted successfuly" });
    }
  );
};
