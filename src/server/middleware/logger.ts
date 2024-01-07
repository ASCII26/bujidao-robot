import { Context } from 'koa';
import winston from 'winston';

export default async (
  ctx: Context,
  next: () => void,
) => {
  if (!ctx.logger) {
    ctx.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      defaultMeta: { service: 'user-service' },
      transports: [
        //
        // - Write all logs with importance level of `error` or less to `error.log`
        // - Write all logs with importance level of `info` or less to `combined.log`
        //
        new winston.transports.File({ dirname: '../logs', filename: 'error.log', level: 'error' }),
        new winston.transports.File({ dirname: '../logs', filename: 'combined.log' }),
      ],
    });
    console.log('=====ctx.logger', ctx.logger);
  }

  await next();
};
