import Router from 'koa-router';
import Weather from './api/weather';
const router = new Router();

if (process.env.AMAP_KEY) {
  const weather = new Weather(process.env.AMAP_KEY);
  router.get('/weather/city', weather.getCity.bind(weather));
  router.get('/weather', weather.get.bind(weather));
}

router.get('/', (ctx) => ctx.body = 'Hello World!');

export default router;