import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../database/client.ts";
import { items } from "../database/schema.ts";
import z from "zod";

export const createItemRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/items",
    {
      schema: {
        tags: ["items"],
        summary: "Create a new item",
        body: z.object({
          description: z.string(),
          unitPrice: z.string(),
          quantity: z.int().min(1, "Must have at least one item"),
          createdBy: z.string(),
          tabId: z.uuid(),
        }),
        response: {
          201: z
            .object({ itemId: z.uuid() })
            .describe("Item created successfully"),
        },
      },
    },
    async (request, reply) => {
      const { description, unitPrice, quantity, createdBy, tabId } =
        request.body;

      const result = await db
        .insert(items)
        .values({
          description,
          unitPrice,
          createdBy,
          quantity,
          tabId,
        })
        .returning();

      return reply.status(201).send({ itemId: result[0].id });
    }
  );
};
