import fs from "fs";
import path from "path";
import { promisify } from "util";
import { EventEmitter } from "events";

import Fastify from "fastify";
// import FastifyVite from './fastify-vite';
import FastifyCors from "@fastify/cors";
import FastifyStatic from "@fastify/static";
import type { FastifyInstance } from "fastify";
// import { createServer } from "vite";
import { renderToString } from 'react-dom/server'

import apiRouter from "./api";

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

    if (isProd) {
      await serveProdution(app);
    } else {
      await serveDevelopment(app);
    }

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

async function serveProdution(app: FastifyInstance) {
  const html = await asyncReadFile(
    path.resolve("./dist/client/index.html"),
    "utf-8"
  );

  await app.register(FastifyStatic, {
    prefix: "/assets/",
    maxAge: "14 days",
    root: path.resolve("./dist/client/assets"),
  });

  app.route({
    url: "*",
    method: "GET",
    handler(req, reply) {
      reply.status(200);
      reply.header("Content-Type", "text/html");
      reply.header("Cache-Control", "public, max-age=0, must-revalidate");
      reply.send(html);
    },
  });
}

async function serveDevelopment(app: FastifyInstance) {
  // // const vite = await createServer({
  // //   server: {
  // //     middlewareMode: true,
  // //   },
  // //   appType: "custom",
  // // });

  
  // await app.register(FastifyVite, {
  //   dev: process.argv.includes('--dev'),
  //   // root: import.meta.url, 
  //   createRenderFunction ({ createApp }: any) {
  //     return () => {
  //       return {
  //         element: renderToString(createApp())
  //       }
  //     }
  //   }
  // })
  
  // // await app.vite.ready()

  // app.route({
  //   url: "*",
  //   method: "GET",
  //   async handler(req, reply) {
  //     const template = await asyncReadFile(
  //       path.resolve("./src/client/index.html"),
  //       "utf-8"
  //     );


  //     reply.status(200);
  //     reply.header("Content-Type", "text/html");
  //     reply.header("Cache-Control", "public, max-age=0, must-revalidate");
  //     reply.send("hello");

  //     // reply.html(reply.render())
  //   },
  // });
}

const asyncReadFile = promisify(fs.readFile);