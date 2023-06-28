import Fastify from "fastify";
import FastifyVite from "@fastify/vite";
import { renderToString } from 'react-dom/server'
import { uneval } from 'devalue'

function createRenderFunction ({ createApp }) {
  // createApp is exported by client/index.js
  return function (server, req, reply) {
    // Server data that we want to be used for SSR
    // and made available on the client for hydration
    const data = {
      todoList: [
        'Do laundry',
        'Respond to emails',
        'Write report'
      ]
    }
    // Creates main React component with all the SSR context it needs
    const app = createApp({ data, server, req, reply }, req.url)
    // Perform SSR, i.e., turn app.instance into an HTML fragment
    const element = renderToString(app)
    return {
      // Server-side rendered HTML fragment
      element,
      // The SSR context data is also passed to the template, inlined for hydration
      hydration: `<script>window.hydration = ${uneval({ data })}</script>`
    }
  }
}

export async function main(dev) {
  const server = Fastify();
  await server.register(FastifyVite, {
    root: "/Users/admin/Desktop/react-hydration",
    dev: dev || process.argv.includes("--dev"),
    createRenderFunction 
  });

  await server.vite.ready();

  return server;
}

const server = await main();
await server.listen({ port: 3000 });