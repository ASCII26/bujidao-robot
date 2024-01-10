import { ILiveWeatherResp, IForecastResp, IGeoCodesResp } from "@/model/weather";

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

  public async getCity(address: string) {
    return await this.getCityCodes(address as string);
  }

  public async get(address: string, extension: TWeatherExtension = "all") {
    const { count, geocodes } = await this.getCityCodes(address as string);
    if (count > 1) {
      return {
        data: null,
        message: `「${address}」有${count}个同名地址，请使用更具体的描述，比如加上城市名：「北京市海淀区」`,
      };
    }

    if (!geocodes || geocodes.length === 0) {
      return {
        data: null,
        message: '地点有误，当前只支持国内城市',
      };
    }

    const params = new URLSearchParams();
    params.append('city', geocodes[0].adcode);
    params.append('key', this.key);
    params.append('extensions', extension);

    const resp = await fetch(`${URLs.weather}?${params}`, {
      method: 'GET',
    });
    const data = await resp.json();
    return {
      data: getWeatherByExtension(data, extension),
      message: 'success',
    };
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

export const weather = new Weather(process.env.AMAP_KEY!);