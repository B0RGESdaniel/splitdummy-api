import fastify from "fastify";
import {
  validatorCompiler,
  serializerCompiler,
  type ZodTypeProvider,
  jsonSchemaTransform,
} from "fastify-type-provider-zod";
import { fastifySwagger } from "@fastify/swagger";
import scalarApiReference from "@scalar/fastify-api-reference";
import { createUserRoute } from "./routes/create-user.ts";
import { createItemRoute } from "./routes/create-item.ts";
import { createTabRoute } from "./routes/create-tab.ts";
import { createParticipantRoute } from "./routes/create-participant.ts";
import { createPartRoute } from "./routes/create-part.ts";
import { getItemsByTabIdRoute } from "./routes/get-items-by-tab-id.ts";
import { getParticpantsByTabIdRoute } from "./routes/get-participants-by-tab-id.ts";
import { getPartsByItemIdRoute } from "./routes/get-parts-by-item-id.ts";

const server = fastify().withTypeProvider<ZodTypeProvider>();

if (process.env.NODE_ENV === "development") {
  server.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Splitdummy API",
        version: "1.0.0",
      },
    },
    transform: jsonSchemaTransform,
  });

  server.register(scalarApiReference, {
    routePrefix: "/docs",
  });
}

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.register(createUserRoute);
server.register(createItemRoute);
server.register(createTabRoute);
server.register(createParticipantRoute);
server.register(createPartRoute);

server.register(getItemsByTabIdRoute);
server.register(getParticpantsByTabIdRoute);
server.register(getPartsByItemIdRoute);

export { server };
