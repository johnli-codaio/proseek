import morgan from 'morgan';
import helmet from 'helmet';
import express, { Request, Response, NextFunction, Express } from 'express';
import {logger} from '@src/logger';

import 'express-async-errors';

import {apiRouter} from '@src/routes';

import HttpStatusCodes from '@src/common/status_codes';
import { RouteError } from '@src/common/route_errors';
import { NodeEnvs } from '@src/common/constants';
import config from './config';
import path from 'path';

interface LocalServices {}

export function startServer(services: LocalServices): Express {
  const app = express();

  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({extended: true}));

  // Serving React CSS and JS
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  
  // Show routes called in console during development
  if (config.env === NodeEnvs.Dev) {
    app.use(morgan('dev'));
  }

  // Security
  if (config.env === NodeEnvs.Production) {
    // eslint-disable-next-line n/no-process-env
    if (!process.env.DISABLE_HELMET) {
      app.use(helmet());
    }
  }

  // Router for '/' established here.
  app.use('/', apiRouter(services));

  // TODO(johnli): Load API routes.

  // Add error handler
  app.use((err: Error, _: Request, res: Response, next: NextFunction) => {
    if (config.env !== NodeEnvs.Test) {
      logger.error(err);
    }
    let status = HttpStatusCodes.BAD_REQUEST;
    if (err instanceof RouteError) {
      status = err.status;
      res.status(status).json({ error: err.message });
    }
    return next(err);
  });

  return app;
}
