import Fastify, {
  FastifyInstance,
  FastifyRegisterOptions,
  FastifyReply,
  FastifyRequest,
  FastifyTypeProviderDefault,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
  RegisterOptions,
} from "fastify";
import { FastifyPluginAsync } from "fastify";
import { FastifyPluginOptions } from "fastify";
import { RawServerBase } from "fastify";
import { FastifyTypeProvider } from "fastify";
import { FastifyBaseLogger } from "fastify";
import { renderToString } from "react-dom/server";
import { uneval } from "devalue";
import { EventEmitter } from "events";
import * as fs from "fs";
import * as path from "path";
import * as url from "url";
import { format, promisify } from "util";
import { fileURLToPath } from "url";
import middie from "@fastify/middie";
// import { join, resolve, read } from "../ioutils";
// import { ResolvedConfig, resolveConfig as viteResolveConfig } from "vite";
import FastifyStatic from "@fastify/static";
import FastifyPlugin from "fastify-plugin";
import { ViteDevServer, defineConfig, mergeConfig } from "vite";
import { createServer } from "vite";
import { IncomingMessage, ServerResponse } from "http";

declare module "fastify" {
  export interface FastifyInstance {
    renderer: ServerSideRenderer;
  }
  export interface FastifyReply {
    html: any;
    render: any;
  }
}

interface RendererOptions extends FastifyPluginOptions {
  name?: string;
}

export default FastifyPlugin(async function (
  instance: FastifyInstance,
  opts: RendererOptions
): Promise<void> {
  const renderer = new ServerSideRenderer(instance, opts);
  await renderer.decorate();
  // instance.decorate("renderer", renderer);
});

class ServerSideRenderer {
  defaultConfig = {
    dev: process.argv.includes("--dev"),
    root: "",
    outDir: "",
    indexHtml: "",
    clientModule: "",
    createRenderFunction() {},
    // createRenderFunction({ createApp }: any) {
    //   // createApp is exported by client/index.js
    //   return function (server: any, req: any, reply: any) {
    //     // Server data that we want to be used for SSR
    //     // and made available on the client for hydration
    //     const data = {
    //       todoList: ["Do laundry", "Respond to emails", "Write report"],
    //     };
    //     // Creates main React component with all the SSR context it needs
    //     const app = createApp({ data, server, req, reply }, req.url);
    //     // Perform SSR, i.e., turn app.instance into an HTML fragment
    //     const element = renderToString(app);
    //     return {
    //       // Server-side rendered HTML fragment
    //       element,
    //       // The SSR context data is also passed to the template, inlined for hydration
    //       hydration: `<script>window.hydration = ${uneval({ data })}</script>`,
    //     };
    //   };
    // },
    async prepareClient(clientModule: any) {
      if (!clientModule) {
        return null;
      }
      const routes =
        typeof clientModule.routes === "function"
          ? await clientModule.routes()
          : clientModule.routes;
      return Object.assign({}, clientModule, { routes });
    },
    // Function to create the route handler passed to createRoute
    createRouteHandler(client: any, scope: FastifyInstance) {
      return async function (req: any, reply: any) {
        const page = await reply.render(scope, req, reply);
        reply.html(page);
        return reply;
      };
    },
    // Function to create the route errorHandler passed to createRoute
    createErrorHandler(client: any, scope: any, config: any) {
      return (error: any, req: any, reply: any) => {
        if (config.dev) {
          console.error(error);
          scope.vite.devServer.ssrFixStacktrace(error);
        }
        scope.errorHandler(error, req, reply);
      };
    },

    createHtmlTemplateFunction(source: string) {
      const ranges = new Map();
      const interpolated: any = [""];
      const params = [];

      for (const match of source.matchAll(/<!--\s*([\w]+)\s*-->/g)) {
        ranges.set(match.index, {
          param: match[1],
          end: match.index! + match[0].length,
        });
      }

      let cursor = 0;
      const cut = null;
      let range = null;

      for (let i = 0; i < source.length; i++) {
        if (i === cut) {
          interpolated.push("");
          cursor += 1;
        } else if (ranges.get(i)) {
          range = ranges.get(i);
          params.push(range.param);
          interpolated.push({ param: range.param });
          i = range.end;
          interpolated.push("");
          cursor += 2;
        }
        interpolated[cursor] += source[i];
      }

      function serialize(frag: any) {
        if (typeof frag === "object") {
          return `$\{${frag.param}}`;
        } else {
          return frag;
        }
      }

      // eslint-disable-next-line no-eval
      return (0, eval)(
        `(function ({ ${params.join(", ")} }) {` +
          `return \`${interpolated.map((s: any) => serialize(s)).join("")}\`` +
          "})"
      );
    },

    // Create reply.html() response function
    createHtmlFunction(source: string, scope: any, config: any) {
      const indexHtmlTemplate = config.createHtmlTemplateFunction(source);
      if (config.spa) {
        return function () {
          scope.type("text/html");
          scope.send(indexHtmlTemplate({ element: "" }));
        };
      }
      return function (ctx: any) {
        scope.type("text/html");
        scope.send(indexHtmlTemplate(ctx));
      };
    },
  };

  instance: FastifyInstance;
  config: RendererOptions;
  renderer: Renderer;

  constructor(instance: FastifyInstance, opts: FastifyPluginOptions) {
    this.instance = instance;
    this.config = { ...this.defaultConfig, ...opts };
    this.config.outDir = path.join(this.config.root, "dist", "client");
    this.config.assetsDir = path.join(this.config.outDir, "assets");
    this.config.clientModule = path.join(this.config.outDir, "index.js");

    if (!this.config.dev) {
      // prod
      this.config.indexHtml = fs.readFileSync(
        path.resolve(this.config.outDir, "index.html"),
        "utf8"
      );
    }

    if (this.config.dev) {
      this.renderer = new DevelopmentRenderer();
    } else {
      this.renderer = new ProductionRenderer();
    }
  }

  async decorate() {
    await this.renderer.decorate(this.instance, this.config);
  }
}

interface Renderer {
  loadClient(opts: RendererOptions): Promise<any>;
  decorate(instance: FastifyInstance, opts: RendererOptions): Promise<any>;
}

class BaseRenderer implements Renderer {
  loadClient(opts: RendererOptions): Promise<any> {
    throw new Error("Method not implemented.");
  }
  async prepareClient(clientModule: any) {
    if (!clientModule) {
      return null;
    }
    const routes =
      typeof clientModule.routes === "function"
        ? await clientModule.routes()
        : clientModule.routes;
    return Object.assign({}, clientModule, { routes });
  }

  decorate(instance: FastifyInstance, opts: RendererOptions): Promise<any> {
    throw new Error("Method not implemented.");
  }
}

class ProductionRenderer extends BaseRenderer {
  async loadClient(opts: RendererOptions): Promise<any> {
    const serverBundle = await import(opts.clientModule);
    return serverBundle.default || serverBundle;
  }

  async decorate(
    instance: FastifyInstance,
    opts: RendererOptions
  ): Promise<any> {
    await instance.register(async function (scope) {
      await scope.register(FastifyStatic, {
        root: path.resolve(opts.outDir, "assets"),
        prefix: `/assets`,
      });
    });

    const clientModule = await this.loadClient(opts);
    const client = await this.prepareClient(clientModule);
    const handler = await opts.createRouteHandler(client, instance, opts);
    const errorHandler = await opts.createErrorHandler(client, instance, opts);

    // Set reply.html() function with production version of index.html
    instance.decorateReply(
      "html",
      await opts.createHtmlFunction(opts.indexHtml, instance, opts)
    );

    // Set reply.render() function with the client module production bundle
    instance.decorateReply(
      "render",
      await opts.createRenderFunction(client, instance, opts)
    );

    if (
      client?.routes &&
      typeof client?.routes[Symbol.iterator] === "function"
    ) {
      for (const route of client?.routes) {
        opts.createRoute(
          { client, handler, errorHandler, route },
          instance,
          opts
        );
      }
    }
  }
}

class DevelopmentRenderer extends BaseRenderer {
  devServer: any;

  async loadClient(opts: RendererOptions): Promise<any> {
    const entryModule = await this.devServer.ssrLoadModule(opts.clientModule);
    return entryModule.default || entryModule;
  }

  async decorate(
    instance: FastifyInstance,
    opts: RendererOptions
  ): Promise<any> {
    await instance.register(middie);

    this.devServer = await createServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: instance.server,
        },
      },
      appType: "custom",
    });

    instance.use(this.devServer.middlewares);
    instance.decorateReply("render", null);
    instance.decorateReply("html", null);

    // Load routes from client module (server entry point)
    const clientModule = await this.loadClient(opts);
    const client = await this.prepareClient(clientModule);

    // Create route handler and route error handler functions
    const handler = await opts.createRouteHandler(client, instance, opts);
    const errorHandler = await opts.createErrorHandler(client, instance, opts);

    // Load fresh index.html template and client module before every request
    instance.addHook("onRequest", async (req, reply) => {
      const indexHtmlPath = path.join(opts.outDir, "index.html");
      const indexHtml = fs.readFileSync(indexHtmlPath, "utf8");

      const transformedHtml = await this.devServer.transformIndexHtml(
        req.url,
        indexHtml
      );

      const clientModule = await this.loadClient(opts);
      const client = await this.prepareClient(clientModule);

      reply.html = await opts.createHtmlFunction(
        transformedHtml,
        instance,
        opts
      );
      reply.render = await opts.createRenderFunction(client, instance, opts);
    });

    if (
      client?.routes &&
      typeof client?.routes[Symbol.iterator] === "function"
    ) {
      for (const route of client?.routes) {
        opts.createRoute(
          { client, handler, errorHandler, route },
          instance,
          opts
        );
      }
    }
  }
}
