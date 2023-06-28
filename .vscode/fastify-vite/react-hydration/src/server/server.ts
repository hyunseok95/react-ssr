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

function createRenderFunction({ createApp }) {
  // createApp is exported by client/index.js
  return function (server, req, reply) {
    // Server data that we want to be used for SSR
    // and made available on the client for hydration
    const data = {
      todoList: ["Do laundry", "Respond to emails", "Write report"],
    };
    // Creates main React component with all the SSR context it needs
    const app = createApp({ data, server, req, reply }, req.url);
    // Perform SSR, i.e., turn app.instance into an HTML fragment
    const element = renderToString(app);
    return {
      // Server-side rendered HTML fragment
      element,
      // The SSR context data is also passed to the template, inlined for hydration
      hydration: `<script>window.hydration = ${uneval({ data })}</script>`,
    };
  };
}

// Promise.resolve().then(async function () {
//   const server = await main();
//   await server.listen({ port: 3000 });
// })

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
    instance.get("/test", requestHandler(defaultReqHandler));
    return;
  };

  return plugin;
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
import { format } from "util";

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
