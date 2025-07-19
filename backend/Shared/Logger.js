'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o)
            if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
exports.httpLogger = void 0;
exports.addApiBreadcrumbs = addApiBreadcrumbs;
const crypto_1 = require('crypto');
const pino_1 = require('pino');
const pino_http_1 = require('pino-http');
const Sentry = __importStar(require('@sentry/node'));
const log = (0, pino_1.pino)({
  level: 'debug',
  redact: ['req.headers.authorization'],
});
const httpLogger = (0, pino_http_1.pinoHttp)({
  genReqId: () => (0, crypto_1.randomUUID)(),
});
exports.httpLogger = httpLogger;
exports.default = log;
function addApiBreadcrumbs(req, res, next) {
  Sentry.addBreadcrumb({
    category: 'http',
    message: `${req.method} ${req.path}`,
    level: 'info',
  });
  next();
}
