import { ILiveWeather, IForecast } from "@/model/weather";
import { weatherEmoji, weatherWordsMap } from "./weather-words";
import { IWordsContext } from "../robot/keywords";

const getEmojiOfWeather = (weather: string) => {
  if (weatherEmoji[weather]) {
    return weatherEmoji[weather];
  }
  const key = Object.keys(weatherWordsMap).find(item => weatherWordsMap[item].includes(weather))
  if (!key || !weatherWordsMap[key]) {
    return "";
  }
  return weatherEmoji[key];
}
// 对实时天气的格式化
const getPrettyMsgOfLiveWeather = (data: ILiveWeather) => {
  const { weather, temperature, humidity, city, reporttime, windpower, winddirection } = data;
  const prettyMsg = `${city}实时天气:(${reporttime})
天气：${weather}${getEmojiOfWeather(weather)}
温度：${temperature}°C
湿度：${humidity}%
风力：${windpower}级(${winddirection})`;
  return prettyMsg;
}

// 对预报天气的格式化
const getPrettyMsgOfForecastWeather = (data: IForecast) => {
  const { city, reporttime, casts } = data;
  const castString = casts.map(({ date, week, dayweather, nighttemp, daytemp }) => `${date}(周${week}) ${dayweather}${getEmojiOfWeather(dayweather)} ${nighttemp}°C至${daytemp}°C`)
  const prettyMsg = `${city} 本周天气预报:(${reporttime})\n${castString.join('\n')}`;
  return prettyMsg;
}

export const getPrettyMsgOfWeather = (data: ILiveWeather | IForecast, isForcast: boolean) => {
  if (isForcast) {
    return getPrettyMsgOfForecastWeather(data as IForecast);
  }
  return getPrettyMsgOfLiveWeather(data as ILiveWeather);
}

export const say = async (ctx: IWordsContext, text: string) => {
  if ('msg' in ctx) {
    await ctx.msg.say(text);
  } else {
    await ctx.user.say(text);
  }
}

// 统一半角/全角空格
export const replaceSpace = (str: string) => str.replace(/\s/g, ' ');