import { fileURLToPath } from "node:url";
import Fastify from "fastify";
import FastifyVite from "@fastify/vite";
import renderer from "./renderer.js";

export async function main(dev) {
  const server = Fastify();
  await server.register(FastifyVite, {
    root: "/Users/admin/Desktop/react-hydration",
    dev: dev || process.argv.includes("--dev"),
    renderer,
  });

  await server.vite.ready();

  return server;
}

if (process.argv[1] === fileURLToPath(new URL(import.meta.url))) {
  const server = await main();
  await server.listen({ port: 3000 });
}
