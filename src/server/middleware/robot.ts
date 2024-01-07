import { Context } from 'koa';
import Robot from '../robot';

let robot: Robot;
export default async (
  ctx: Context,
  next: () => void,
) => {
  if (!robot && process.env.WECHATY_TOKEN) {
    robot = new Robot(process.env.WECHATY_TOKEN, ctx);
  }

  await next();
};
