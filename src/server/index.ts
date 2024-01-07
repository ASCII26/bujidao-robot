import Koa from 'koa';
import 'dotenv/config.js';
import loggerMiddleware from './middleware/logger';
import robotMiddleware from './middleware/robot';

const app = new Koa();
app.use(loggerMiddleware);
app.use(robotMiddleware);
app.use(ctx => {
  ctx.body = 'Hello Koa';
});

app.listen(3000);