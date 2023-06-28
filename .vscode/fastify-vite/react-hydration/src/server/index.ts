// import fs from "fs";
// import path from "path";
import { promisify } from "util";
import { EventEmitter } from "events";
import { fileURLToPath } from "url";
import Fastify from "fastify";
import FastifyCors from "@fastify/cors";
import FastifyStatic from "@fastify/static";
import type { FastifyInstance } from "fastify";
import apiRouter from "./api";
// React 18's non-streaming server-side rendering function
//import { renderToString } from 'react-dom/server'
// Used to safely serialize JavaScript into
// <script> tags, preventing a few types of attack
//import { uneval } from 'devalue'
// import Fastify from "fastify";
// import FastifyVite from "@fastify/vite";
// import renderer from "./renderer.js";

const HOST = "0.0.0.0";
const PORT = 3000;
const isProd = process.env.NODE_ENV === "production";
const executor = new EventEmitter();
executor.on("start", start);
executor.on("error", error);
executor.emit("start");

async function start(): Promise<void> {
  try {
    const app = Fastify();
    await app.register(FastifyCors, {
      preflightContinue: true,
    });
    await app.register(apiRouter, {
      prefix: "/api",
    });

    // if (isProd) {
    //   await serveProdution(app);
    // } else {
    //   await serveDevelopment(app);
    // }

    await app.ready();
    app.listen({
      host: HOST,
      port: PORT,
    });
    console.log(`🚀 My Application is listening on http://${HOST}:${PORT}`);
  } catch (e) {
    executor.emit("error", e);
  }
}

async function error(err: Error): Promise<void> {
  try {
    executor.off("start", start);
    executor.off("error", error);
    throw err;
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
}

// export async function main(dev) {
//   // const server = Fastify();
//   // await server.register(FastifyVite, {
//   //   root: "/Users/admin/Desktop/react-hydration",
//   //   dev: dev || process.argv.includes("--dev"),
//   //   renderer,
//   // });

//   // await server.vite.ready();

//   return server;
// }

// const server = await main();
// await server.listen({ port: 3000 });

// function createRenderFunction ({ createApp }) {
//   // createApp is exported by client/index.js
//   return function (server, req, reply) {
//     // Server data that we want to be used for SSR
//     // and made available on the client for hydration
//     const data = {
//       todoList: [
//         'Do laundry',
//         'Respond to emails',
//         'Write report'
//       ]
//     }
//     // Creates main React component with all the SSR context it needs
//     const app = createApp({ data, server, req, reply }, req.url)
//     // Perform SSR, i.e., turn app.instance into an HTML fragment
//     const element = renderToString(app)
//     return {
//       // Server-side rendered HTML fragment
//       element,
//       // The SSR context data is also passed to the template, inlined for hydration
//       hydration: `<script>window.hydration = ${uneval({ data })}</script>`
//     }
//   }
// }
