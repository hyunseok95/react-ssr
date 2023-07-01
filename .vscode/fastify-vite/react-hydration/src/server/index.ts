import { EventEmitter } from "events";
import Fastify from "fastify";

import renderer from "./renderer";
import apiRouter from "./api";
import * as path from "path";

class Executor extends EventEmitter {
  constructor() {
    super();
    this.on("start", this.start);
    this.on("error", this.error);
  }

  async start(): Promise<void> {
    try {
      const host = "0.0.0.0";
      const port = 3000;
      const dev = process.env.NODE_ENV !== "production";
      const app = Fastify();

      // await app.register(FastifyCors, {
      //   preflightContinue: true,
      // });

      await app.register(renderer, {
        root: path.resolve(__dirname, "..", ".."),
        dev,
      });
      await app.register(apiRouter, {
        prefix: "/api",
      });

      // if (isProd) {
      //   await serveProdution(app);
      // } else {
      //   await serveDevelopment(app);
      // }

      // await app.renderer.ready();

      await app.ready();
      app.listen({ host, port });
      console.log(`🚀 My Application is listening on http://${host}:${port}`);
    } catch (e) {
      this.emit("error", e);
    }
  }

  async error(err: Error): Promise<void> {
    try {
      this.off("start", this.start);
      this.off("error", this.error);
      throw err;
    } catch (e) {
      console.log(e);
      process.exit(1);
    }
  }
}

const executor = new Executor();
executor.emit("start");
