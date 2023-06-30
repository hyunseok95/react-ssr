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

import { ViteDevServer, defineConfig, mergeConfig } from "vite";
import { createServer } from "vite";

const HOST = "0.0.0.0";
const PORT = 3000;
const isProd = process.env.NODE_ENV === "production";
const executor = new EventEmitter();
executor.on("start", start);
executor.on("error", error);
executor.emit("start");

// export async function main(dev = null) {
//   const server = Fastify();
//   // await server.register(FastifyVite, {
//   //   root: "/Users/admin/Desktop/react-hydration",
//   //   dev: dev || process.argv.includes("--dev"),
//   //   createRenderFunction
//   // });

//   await server.ready();

//   return server;
// }
declare module "fastify" {
  export interface FastifyInstance {
    renderer: Renderer;
  }
  export interface FastifyReply {
    html: any;
    render: any;
  }
}

async function start(): Promise<void> {
  try {
    const app = Fastify();
    // await app.register(FastifyCors, {
    //   preflightContinue: true,
    // });
    // await app.register(apiRouter, {
    //   prefix: "/api",
    // });

    // if (isProd) {
    //   await serveProdution(app);
    // } else {
    //   await serveDevelopment(app);
    // }

    const plugin = newPlugin();
    const opts = newOption();
    await app.register(plugin, opts);

    await app.renderer.ready();
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

// function createRenderFunction({ createApp }) {
//   // createApp is exported by client/index.js
//   return function (server, req, reply) {
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
// }

// Promise.resolve().then(async function () {
//   const server = await main();
//   await server.listen({ port: 3000 });
// })

import fp from "fastify-plugin";
function newPlugin(): FastifyPluginAsync<
  FastifyPluginOptions,
  RawServerDefault,
  FastifyTypeProvider,
  FastifyBaseLogger
> {
  const plugin = async function (
    instance: FastifyInstance<
      RawServerDefault,
      RawRequestDefaultExpression<RawServerDefault>,
      RawReplyDefaultExpression<RawServerDefault>,
      FastifyBaseLogger,
      FastifyTypeProvider
    >,
    opts: FastifyPluginOptions
  ) {
    instance.decorate("renderer", new Renderer(instance, opts));
    // instance.get("/test", requestHandler(defaultReqHandler));
  };

  // fp(plugin, {});

  return fp(plugin, {});
}

function newOption<
  Options extends FastifyPluginOptions
>(): FastifyRegisterOptions<FastifyPluginOptions> {
  const options: RegisterOptions & FastifyPluginOptions = {
    // Specify your options hee

    // For example:
    prefix: "/api",
  };

  return options;
}

function errorHandler(e: Error | unknown): Error {
  if (e instanceof Error) {
    throw new Error(format("error!: %s", e.message));
  } else {
    throw new Error("error!: unknown error");
  }
}

function requestHandler(
  handler: (req: FastifyRequest, res: FastifyReply) => void
) {
  return function (req: FastifyRequest, res: FastifyReply): void {
    try {
      handler(req, res);
    } catch (e: Error | unknown) {
      errorHandler(e);
    }
  };
}

export default async function apiRouter<
  Options extends FastifyPluginOptions = Record<never, never>
>(fastify: FastifyInstance, opts: Options, done: (err?: Error) => void) {
  fastify.all("/", requestHandler(defaultReqHandler));
  fastify.all("/user", requestHandler(userReqHandler));
  fastify.all("/auth", requestHandler(authReqHandler));
  done();
}

function defaultReqHandler(req: FastifyRequest, res: FastifyReply): void {
  res.send("hi");
}
function userReqHandler(req: FastifyRequest, res: FastifyReply): void {}
function authReqHandler(req: FastifyRequest, res: FastifyReply): void {}

const kSetup = Symbol("kSetup");
const kOptions = Symbol("kOptions");

function serialize(frag: any) {
  if (typeof frag === "object") {
    return `$\{${frag.param}}`;
  } else {
    return frag;
  }
}
class Renderer {
  instance: FastifyInstance<
    RawServerDefault,
    RawRequestDefaultExpression<RawServerDefault>,
    RawReplyDefaultExpression<RawServerDefault>,
    FastifyBaseLogger,
    FastifyTypeProvider
  >;
  createServer: CallableFunction;
  // opts: FastifyPluginOptions;
  [kOptions]: FastifyPluginOptions;
  [kSetup]: any;

  defaultConfig = {
    dev: process.argv.includes("--dev"),
    root: null,
    vite: null,
    spa: false,
    clientModule: "",
    createRenderFunction: function () {},
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

  config: FastifyPluginOptions;
  // devServer: ViteDevServer | undefined;
  devServer: any;

  constructor(
    instance: FastifyInstance<
      RawServerDefault,
      RawRequestDefaultExpression<RawServerDefault>,
      RawReplyDefaultExpression<RawServerDefault>,
      FastifyBaseLogger,
      FastifyTypeProvider
    >,
    opts: FastifyPluginOptions
  ) {
    this.instance = instance;
    this.createServer = opts.createServer;
    this[kOptions] = opts;
    this.config = {};
    // this.configure();
  }

  async ready() {
    this.config = await this.configure(this[kOptions]);
    this[kSetup] = this.config.dev
      ? // Boots Vite's development server and ensures hot reload
        this.developModule
      : // Assumes presence of and uses production bundled distribution
        this.productionModule;
    // Private reference to user-provided plugin options
    // Get handler function and routes based on the Vite server bundle
    const { client, routes, handler, errorHandler } = await this[kSetup](
      this.config,
      this.createServer
    );

    // Register individual Fastify routes for each the client-provided routes
    // console.log(typeof routes[Symbol.iterator]);
    if (routes && typeof routes[Symbol.iterator] === "function") {
      for (const route of routes) {
        this.config.createRoute(
          { client, handler, errorHandler, route },
          this.instance,
          this.config
        );
      }
    }
  }

  async configure(
    opts: FastifyPluginOptions = {}
  ): Promise<FastifyPluginOptions> {
    const options: FastifyPluginOptions = {};
    for (const [key, value] of Object.entries(this.defaultConfig)) {
      if (key in opts) {
        options[key] = opts[key];
      } else {
        options[key] = value;
      }
    }
    // const filepath = url.fileURLToPath(new url.URL(import.meta.url));
    // options.root = path.resolve(path.dirname(filepath), "client");
    options.root = path.resolve(__dirname, "..", "..");

    const viteConfigFileName = options.viteConfigFileName || "vite.config.js";
    const viteConfig = path.join(options.root, viteConfigFileName);

    // let userConfig = await import(viteConfig);
    // console.log(userConfig)
    // if (userConfig.default) {
    //   userConfig = userConfig.default;
    // }

    // const config: ResolvedConfig = await viteResolveConfig(
    //   {
    //     configFile: viteConfig,
    //   },
    //   "serve",
    //   options.dev ? "development" : "production"
    // );

    // const vite = Object.assign(userConfig, {
    //   build: {
    //     assetsDir: config.build.assetsDir,
    //     outDir: config.build.outDir,
    //   },
    // });

    options.spa = false;
    options.dev = process.env.NODE_ENV === "production" ? false : true;
    const resolveBundle = options.spa
      ? this.resolveSPABundle
      : this.resolveSSRBundle;

    const bundle = await resolveBundle({
      dev: options.dev,
      vite: {
        root: options.root,
        build: {
          outDir: "./dist",
        },
      },
    });

    const config = Object.assign(this.defaultConfig, {
      ...options,
      // vite,
      viteConfig,
      bundle,
    });

    // for (const setting of [
    //   "clientModule",
    //   "createErrorHandler",
    //   "createHtmlFunction",
    //   "createHtmlTemplateFunction",
    //   "createRenderFunction",
    //   "createRoute",
    //   "createRouteHandler",
    //   "prepareClient",
    // ]) {
    //   config[setting] = config.renderer[setting] || config[setting];
    // }

    if (config.spa) {
      config.createRenderFunction = () => {};
    } else {
      config.clientModule = path.join(
        options.root,
        "dist",
        "client",
        "index.js"
      );
    }

    return config;
  }

  async resolveSPABundle({ dev, vite }: any) {
    const bundle = {
      dir: "",
      indexHtml: "",
      manifest: [],
    };
    if (!dev) {
      bundle.dir = path.resolve(vite.root, vite.build.outDir);
      const indexHtmlPath = path.resolve(bundle.dir, "index.html");
      if (!fs.existsSync(indexHtmlPath)) {
        return;
      }
      bundle.indexHtml = fs.readFileSync(indexHtmlPath, "utf8");
    } else {
      bundle.manifest = [];
    }
    return bundle;
  }

  async resolveSSRBundle({ dev, vite }: any) {
    const bundle = {
      dir: "",
      indexHtml: "",
      manifest: [],
    };

    if (!dev) {
      // prod
      bundle.dir = path.resolve(vite.root, vite.build.outDir);
      const indexHtmlPath = path.resolve(bundle.dir, "client/index.html");
      if (!fs.existsSync(indexHtmlPath)) {
        return;
      }
      bundle.indexHtml = fs.readFileSync(indexHtmlPath, "utf8");
      // const manifestFilePath = path.resolve(
      //   bundle.dir,
      //   "client/ssr-manifest.json"
      // );
      // bundle.manifest = await import(manifestFilePath);
      bundle.manifest = [];
    } else {
      //dev
      bundle.manifest = [];
    }
    return bundle;
  }
  // develop module

  async developModule(config: FastifyPluginOptions) {
    // Middie seems to work well for running Vite's development server
    // Unsure if fastify-express is warranted here
    await this.instance.register(middie);

    // Create and enable Vite's Dev Server middleware
    const devServerOptions = mergeConfig(
      defineConfig({
        // configFile: false,
        server: {
          middlewareMode: true,
          hmr: {
            server: this.instance.server,
          },
        },
        appType: "custom",
      }),
      config.vite
    );

    // const vite = await import("vite");
    this.devServer = await createServer(devServerOptions);
    // this.devServer = await vite.createServer(config.vite);
    // this.devServer = await createServer(config.vite);

    if (this.devServer === undefined) {
      throw new Error("test");
    }

    this.instance.use(this.devServer.middlewares);

    this.devServer;
    // Loads the Vite application server entry point for the client
    const loadClient = async () => {
      if (config.spa) {
        return {};
      }
      config.vite = {};
      config.vite.root = path.join(__dirname, "..", "..", "dist", "client");
      config.clientModule = "index.js";
      const modulePath = path.resolve(
        config.vite.root,
        config.clientModule.replace(/^\/+/, "")
      );
      console.log(modulePath);
      const entryModule: Record<string, any> | undefined =
        await this.devServer?.ssrLoadModule(modulePath);
      if (entryModule === undefined) {
        throw new Error("test2");
      }
      return entryModule.default || entryModule;
    };

    // Initialize Reply prototype decorations
    this.instance.decorateReply("render", null);
    this.instance.decorateReply("html", null);

    // Load fresh index.html template and client module before every request
    this.instance.addHook("onRequest", async (req, reply) => {
      const indexHtmlPath = path.join(
        config.root,
        "dist",
        "client",
        "index.html"
      );
      const indexHtml = fs.readFileSync(indexHtmlPath, "utf8");
      console.log(indexHtml);
      const transformedHtml = await this.devServer?.transformIndexHtml(
        req.url,
        indexHtml
      );
      const clientModule = await loadClient();
      const client = await config.prepareClient(
        clientModule,
        this.instance,
        config
      );
      // Set reply.html() function with latest version of index.html
      reply.html = await config.createHtmlFunction(
        transformedHtml,
        this.instance,
        config
      );
      // Set reply.render() function with latest version of the client module
      reply.render = await config.createRenderFunction(
        client,
        this.instance,
        config
      );
    });

    // Load routes from client module (server entry point)
    const clientModule = await loadClient();
    const client = await config.prepareClient(
      clientModule,
      this.instance,
      config
    );

    // Create route handler and route error handler functions
    const handler = await config.createRouteHandler(
      client,
      this.instance,
      config
    );
    const errorHandler = await config.createErrorHandler(
      client,
      this.instance,
      config
    );

    return { client, routes: client?.routes, handler, errorHandler };
  }

  async productionModule(config: FastifyPluginOptions) {
    if (!config.bundle) {
      throw new Error("No distribution bundle found.");
    }
    // For production you get the distribution version of the render function
    config.vite = {};
    config.vite.root = path.join(__dirname, "..", "..");
    config.clientModule = "index.js";
    config.vite.build = {
      assetsDir: "assets",
    };
    const { assetsDir } = config.vite.build;

    config.bundle.dir = path.join(config.vite.root, "dist");

    const clientDist = config.spa
      ? path.resolve(config.bundle.dir)
      : path.resolve(config.bundle.dir, "client");

    if (!fs.existsSync(clientDist)) {
      throw new Error("No client distribution bundle found.");
    }

    // const serverDist = path.resolve(config.bundle.dir, "server");
    // if (!config.spa && !fs.existsSync(serverDist)) {
    //   throw new Error("No server distribution bundle found.");
    // }
    // We also register fastify-static to serve all static files
    // in production (dev server takes of this)
    await this.instance.register(async function (scope) {
      await scope.register(FastifyStatic, {
        root: path.resolve(clientDist, assetsDir),
        prefix: `/${assetsDir}`,
      });
    });
    // Note: this is just to ensure it works, for a real world
    // production deployment, you'll want to capture those paths in
    // Nginx or just serve them from a CDN instead

    // Load routes from client module (server entry point)
    const clientModule = await loadClient();
    const client = await config.prepareClient(clientModule);

    // Create route handler and route error handler functions
    const handler = await config.createRouteHandler(
      client,
      this.instance,
      config
    );
    const errorHandler = await config.createErrorHandler(
      client,
      this.instance,
      config
    );

    // Set reply.html() function with production version of index.html
    this.instance.decorateReply(
      "html",

      await config.createHtmlFunction(
        config.bundle.indexHtml,
        this.instance,
        config
      )
    );

    // Set reply.render() function with the client module production bundle
    this.instance.decorateReply(
      "render",
      await config.createRenderFunction(client, this.instance, config)
    );

    return { client, routes: client.routes, handler, errorHandler };

    // Loads the Vite application server entry point for the client
    async function loadClient() {
      if (config.spa) {
        return {};
      }
      const serverBundlePath = path.resolve(
        config.bundle.dir,
        "client",
        config.clientModule
      );

      if (!fs.existsSync(serverBundlePath)) {
        throw new Error("no file");
      }

      const serverBundle = await import(serverBundlePath);
      return serverBundle.default || serverBundle;
    }
  }
}

// const asyncStat = promisify(fs.stat);
