import Koa from 'koa';
import 'dotenv/config.js';
import { format, createLogger, transports} from 'winston';
import router from './router';
const { combine, timestamp } = format;

const app = new Koa();
const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    format.json(),
  ),
  // defaultMeta: { service: 'user-service' },
  transports: [
    new transports.File({ dirname: './logs', filename: 'error.log', level: 'error' }),
    new transports.File({ dirname: './logs', filename: 'combined.log' }),
    new transports.Console(),
  ],
});
app.use(async (ctx, next) => {
  if (!ctx.logger) {
    ctx.logger = logger;
  }
  await next();
});

app.use(router.routes());

app.listen(process.env.PORT);