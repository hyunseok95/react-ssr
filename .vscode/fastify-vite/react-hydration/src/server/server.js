"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fastify_1 = require("fastify");
var server_1 = require("react-dom/server");
var devalue_1 = require("devalue");
var events_1 = require("events");
// import * as fs from "fs";
var path = require("path");
// import { ResolvedConfig, resolveConfig as viteResolveConfig } from "vite";
var HOST = "0.0.0.0";
var PORT = 3000;
var isProd = process.env.NODE_ENV === "production";
var executor = new events_1.EventEmitter();
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
function start() {
    return __awaiter(this, void 0, void 0, function () {
        var app, plugin, opts, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    app = (0, fastify_1.default)();
                    plugin = newPlugin();
                    opts = newOption();
                    return [4 /*yield*/, app.register(plugin, opts)];
                case 1:
                    _a.sent();
                    // console.log(app.renderer);
                    return [4 /*yield*/, app.ready()];
                case 2:
                    // console.log(app.renderer);
                    _a.sent();
                    app.listen({
                        host: HOST,
                        port: PORT,
                    });
                    console.log("\uD83D\uDE80 My Application is listening on http://".concat(HOST, ":").concat(PORT));
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    executor.emit("error", e_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function error(err) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                executor.off("start", start);
                executor.off("error", error);
                throw err;
            }
            catch (e) {
                console.log(e);
                process.exit(1);
            }
            return [2 /*return*/];
        });
    });
}
function createRenderFunction(_a) {
    var createApp = _a.createApp;
    // createApp is exported by client/index.js
    return function (server, req, reply) {
        // Server data that we want to be used for SSR
        // and made available on the client for hydration
        var data = {
            todoList: ["Do laundry", "Respond to emails", "Write report"],
        };
        // Creates main React component with all the SSR context it needs
        var app = createApp({ data: data, server: server, req: req, reply: reply }, req.url);
        // Perform SSR, i.e., turn app.instance into an HTML fragment
        var element = (0, server_1.renderToString)(app);
        return {
            // Server-side rendered HTML fragment
            element: element,
            // The SSR context data is also passed to the template, inlined for hydration
            hydration: "<script>window.hydration = ".concat((0, devalue_1.uneval)({ data: data }), "</script>"),
        };
    };
}
// Promise.resolve().then(async function () {
//   const server = await main();
//   await server.listen({ port: 3000 });
// })
function newPlugin() {
    var plugin = function (instance, opts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                instance.decorate("renderer", new Renderer(instance, opts));
                instance.get("/test", requestHandler(defaultReqHandler));
                return [2 /*return*/];
            });
        });
    };
    return plugin;
}
function newOption() {
    var options = {
        // Specify your options hee
        // For example:
        prefix: "/api",
    };
    return options;
}
var util_1 = require("util");
function errorHandler(e) {
    if (e instanceof Error) {
        throw new Error((0, util_1.format)("error!: %s", e.message));
    }
    else {
        throw new Error("error!: unknown error");
    }
}
function requestHandler(handler) {
    return function (req, res) {
        try {
            handler(req, res);
        }
        catch (e) {
            errorHandler(e);
        }
    };
}
function apiRouter(fastify, opts, done) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            fastify.all("/", requestHandler(defaultReqHandler));
            fastify.all("/user", requestHandler(userReqHandler));
            fastify.all("/auth", requestHandler(authReqHandler));
            done();
            return [2 /*return*/];
        });
    });
}
exports.default = apiRouter;
function defaultReqHandler(req, res) {
    res.send("hi");
}
function userReqHandler(req, res) { }
function authReqHandler(req, res) { }
var kSetup = Symbol("kSetup");
var kOptions = Symbol("kOptions");
var Renderer = /** @class */ (function () {
    function Renderer(instance, opts) {
        // [kOptions]: FastifyPluginOptions
        this.defaultConfig = {
            dev: process.argv.includes("--dev"),
            root: null,
            vite: null,
        };
        this.instance = instance;
        this.createServer = opts.createServer;
        this[kOptions] = opts;
        this.configure();
    }
    Renderer.prototype.ready = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.configure(this[kOptions])];
                    case 1:
                        _a.config = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Renderer.prototype.configure = function (opts) {
        if (opts === void 0) { opts = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var options, _i, _a, _b, key, value, viteConfigFileName, viteConfig, userConfig;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        options = {};
                        for (_i = 0, _a = Object.entries(this.defaultConfig); _i < _a.length; _i++) {
                            _b = _a[_i], key = _b[0], value = _b[1];
                            if (key in opts) {
                                options[key] = opts[key];
                            }
                            else {
                                options[key] = value;
                            }
                        }
                        // const filepath = url.fileURLToPath(new url.URL(import.meta.url));
                        // options.root = path.resolve(path.dirname(filepath), "client");
                        options.root = path.resolve(__dirname, "..", "..");
                        viteConfigFileName = options.viteConfigFileName || "vite.config.js";
                        viteConfig = path.join(options.root, viteConfigFileName);
                        return [4 /*yield*/, Promise.resolve("".concat(viteConfig)).then(function (s) { return require(s); })];
                    case 1:
                        userConfig = _c.sent();
                        console.log(userConfig);
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
                        // const resolveBundle = options.spa
                        //   ? this.resolveSPABundle
                        //   : this.resolveSSRBundle;
                        return [2 /*return*/, { test: "test" }];
                }
            });
        });
    };
    return Renderer;
}());
// const asyncStat = promisify(fs.stat);
