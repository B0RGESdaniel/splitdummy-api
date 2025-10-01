import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../../database/postgres/client.ts";
import { users } from "../../database/postgres/schema.ts";
import z from "zod";

export const createUserRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/users",
    {
      schema: {
        tags: ["users"],
        summary: "Create a user new user",
        description: "Based on login made with Firebase Google Authentication",
        body: z.object({
          name: z.string(),
          email: z.email(),
          googleId: z.string(),
        }),
        response: {
          201: z
            .object({ userId: z.uuid() })
            .describe("User created successfully"),
        },
      },
    },
    async (request, reply) => {
      const { name, email, googleId } = request.body;

      const result = await db
        .insert(users)
        .values({
          name,
          email,
          googleId,
        })
        .returning();

      return reply.status(201).send({ userId: result[0].id });
    }
  );
};
