// 只保留部分参数，完整参数参考API官网 https://lbs.amap.com/api/webservice/guide/api/georegeo
export interface IGeoCode {
  formatted_address: string;
  country: string;
  province: string;
  // adcode
  adcode: string;
  // 城市编码
  citycode: string;
}
export interface IGeoCodesResp {
  geocodes: IGeoCode[];
  count: number;
}

export interface ICast {
  date: string;
  week: string;
  dayweather: string;
  nightweather: string;
  daytemp: string;
  nighttemp: string;
}

export interface IForecast {
  city: string;
  adcode: string;
  province: string;
  reporttime: string;
  casts: ICast[];
}

export interface IForecastResp {
  forecasts: IForecast[];
}

export interface ILiveWeather {
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

export interface ILiveWeatherResp {
  lives: ILiveWeather[];
}