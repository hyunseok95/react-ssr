import * as path from "path";
import { format } from "util";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import FastifyStatic from "@fastify/static";
import FastifyPlugin from "fastify-plugin";

import App from "../../client/app";
interface RendererOptions extends FastifyPluginOptions {
  root: string;
}

export default FastifyPlugin(async function (
  instance: FastifyInstance,
  opts: RendererOptions
): Promise<void> {
  // await instance.register(FastifyStatic, {
  //   root: path.resolve(opts.root, "dist", "client", "assets"),
  //   prefix: `/assets`,
  // });

  await instance.register(FastifyStatic, {
    root: path.resolve(opts.root, "dist", "client"),
    prefix: `/static`,
  });
  // instance.route({
  //   url: "*",
  //   method: "GET",
  //   async handler(this, req, rep) {
  //     try {
  //       const hydration = {
  //         url: req.url,
  //         name: req.url,
  //       };
  //       const element = ReactDOMServer.renderToString(
  //         <App hydration={hydration} />
  //       );
  //       rep.status(200);
  //       rep.header("Content-Type", "text/html");
  //       rep.header("Cache-Control", "public, max-age=0, must-revalidate");
  //       rep.send(element);

  //       // const element = renderToPipeableStream(<App hydration={hydration} />, {
  //       //   bootstrapScripts: ["/static/index.js"],
  //       //   onShellReady() {
  //       //     rep.header("Content-Type", "text/html");
  //       //     rep.header("Cache-Control", "public, max-age=0, must-revalidate");
  //       //     element.pipe(rep.raw);
  //       //   },
  //       // });
  //       return this;
  //     } catch (e: Error | unknown) {
  // if (e instanceof Error) {
  //   throw new Error(format("error!: %s", e.message));
  // } else {
  //   throw new Error("error!: unknown error");
  // }
  //     }
  //   },
  // });

  instance.route({
    url: "*",
    method: "GET",
    async handler(this, req, rep) {
      try {
        const hydration = {
          url: req.url,
          name: req.url,
        };
        const element = ReactDOMServer.renderToString(
          <App hydration={hydration} />
        );

        const html = `
        <!doctype html>
          <html>
          <head>
            <script>window.hydration = ${JSON.stringify({
              ...hydration,
            })}</script>
          </head>
          <body>
          <div id="root">${element}</div>
          <script src="/static/index.js"></script>
        </body>
        </html>`;

        rep.status(200);
        rep.header("Content-Type", "text/html");
        rep.header("Cache-Control", "public, max-age=0, must-revalidate");
        rep.send(html);
        return this;
      } catch (e: Error | unknown) {
        if (e instanceof Error) {
          throw new Error(format("error!: %s", e.message));
        } else {
          throw new Error("error!: unknown error");
        }
      }
    },
  });
});
