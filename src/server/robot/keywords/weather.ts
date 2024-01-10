import { weather } from "@/server/api/weather";
import { getPrettyMsgOfWeather } from "@/server/utils/function";
import { IWordsContext } from ".";

export const weatherWordsHandle = async ({
  command,
  city,
  user,
}: {
  command: string;
  city: string;
} & IWordsContext) => {
  if (!city) {
    await user.say(`你想问哪里的天气呢？
回复“天气 某地”，查询实时天气状况
回复“天气预报 某地”，查询本周天气预报
关键词和地点之间用【空格】隔开`);
    return;
  }
  const isForcast = /预报/.test(command);
  const extension = isForcast ? 'all' : 'base';
  const resp = await weather.get(city, extension);
  if (resp.data) {
    await user.say(getPrettyMsgOfWeather(resp.data, isForcast));
  } else {
    await user.say(resp.message);
  }
}