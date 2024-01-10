import { Context } from "koa";

// 只保留部分参数，完整参数参考API官网 https://lbs.amap.com/api/webservice/guide/api/georegeo
interface IGeoCode {
  formatted_address: string;
  country: string;
  province: string;
  // adcode
  adcode: string;
  // 城市编码
  citycode: string;
}
interface IGeoCodesResp {
  geocodes: IGeoCode[];
  count: number;
}

interface ICast {
  date: string;
  week: string;
  dayweather: string;
  nightweather: string;
  daytemp: string;
  nighttemp: string;
}

interface IForecast {
  city: string;
  adcode: string;
  province: string;
  reporttime: string;
  casts: ICast[];
}

interface IForecastResp {
  forecasts: IForecast[];
}

interface ILiveWeather {
  province: string;
  city: string;
  adcode: string;
  weather: string;
  temperature: string;
  winddirection: string;
  // 风力级别，单位：级
  windpower: string;
  // 空气湿度
  humidity: string;
  reporttime: string;
}

interface ILiveWeatherResp {
  lives: ILiveWeather[];
}

const getWeatherByExtension = (info: ILiveWeatherResp | IForecastResp, extension: TWeatherExtension) => {
  if (extension === "base") {
    return (info as ILiveWeatherResp).lives[0];
  }
  return (info as IForecastResp).forecasts[0];
}

type TWeatherExtension = "base" | "all";
const URLs = {
  geocode: "https://restapi.amap.com/v3/geocode/geo",
  weather: "https://restapi.amap.com/v3/weather/weatherInfo",
}

class Weather {
  private addressCache = new Map<string, IGeoCodesResp>();

  constructor(private key: string) {}

  public async getCity(ctx: Context) {
    const { address } = ctx.request.query;
    if (!address) {
      ctx.body = 'address is required';
      return;
    }

    const data = await this.getCityCodes(address as string);
    ctx.body = data;
  }

  public async get(ctx: Context) {
    const { address, extensions } = ctx.request.query;
    if (!address) {
      ctx.body = 'address is required';
      return;
    }
    const { count, geocodes } = await this.getCityCodes(address as string);
    if (count > 1) {
      ctx.body = `「${address}」有${count}个同名地址，请使用更具体的描述，比如加上城市名：「北京市海淀区」`;
      return;
    }

    const extension = extensions as TWeatherExtension ?? 'all' ;
    const params = new URLSearchParams();
    params.append('city', geocodes[0].adcode);
    params.append('key', this.key);
    params.append('extensions', extension);

    const resp = await fetch(`${URLs.weather}?${params}`, {
      method: 'GET',
    });
    const data = await resp.json();
    const weather = getWeatherByExtension(data, extension);
    ctx.body = weather;
  }

  private async getCityCodes(address: string) {
    if (this.addressCache.has(address)) {
      return this.addressCache.get(address)!;
    }

    const params = new URLSearchParams();
    params.append('address', address as string);
    params.append('key', this.key);

    const resp = await fetch(`${URLs.geocode}?${params}`, {
      method: 'GET',
    });
    const data = await resp.json() as IGeoCodesResp;
    this.addressCache.set(address, data);
    return data;
  }
}

export default Weather;