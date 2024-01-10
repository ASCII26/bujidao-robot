import 'dotenv/config.js';
import { format, createLogger, transports} from 'winston';
import Robot from './server/robot';

const { combine, timestamp } = format;
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

if (process.env.WECHATY_TOKEN) {
  new Robot(process.env.WECHATY_TOKEN, logger);
}

