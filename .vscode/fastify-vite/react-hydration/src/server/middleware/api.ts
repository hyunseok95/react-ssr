import { format } from "util";

import type {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";

export default async function apiRouter<
  Options extends FastifyPluginOptions = Record<never, never>
>(fastify: FastifyInstance, opts: Options, done: (err?: Error) => void) {
  fastify.all("/", requestHandler(defaultReqHandler));
  fastify.all("/user", requestHandler(userReqHandler));
  fastify.all("/auth", requestHandler(authReqHandler));
  done();
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

function defaultReqHandler(req: FastifyRequest, res: FastifyReply): void {
  res.send();
}
function userReqHandler(req: FastifyRequest, res: FastifyReply): void {}
function authReqHandler(req: FastifyRequest, res: FastifyReply): void {}
