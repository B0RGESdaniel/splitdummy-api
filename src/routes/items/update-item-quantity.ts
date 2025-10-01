import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../../database/postgres/client.ts";
import { items } from "../../database/postgres/schema.ts";
import z from "zod";
import { eq } from "drizzle-orm";

export const updateItemQuantityRoute: FastifyPluginAsyncZod = async (
  server
) => {
  server.patch(
    "/items/:id",
    {
      schema: {
        tags: ["items"],
        summary: "Update the quantity of an existing item",
        params: z.object({
          id: z.uuid(),
        }),
        body: z.object({
          quantity: z.int().min(1, "Must have at least one item"),
        }),
        response: {
          200: z
            .object({
              itemId: z.uuid(),
              newQuantity: z.int(),
            })
            .describe("Item quantity updated successfuly"),
        },
      },
    },
    async (request, reply) => {
      const { quantity } = request.body;
      const itemId = request.params.id;

      const result = await db
        .update(items)
        .set({
          quantity,
        })
        .where(eq(items.id, itemId))
        .returning();

      return reply
        .status(200)
        .send({ itemId: result[0].id, newQuantity: result[0].quantity });
    }
  );
};
