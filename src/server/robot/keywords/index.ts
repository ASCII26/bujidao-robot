import { Contact, Message, Room } from "@juzi/wechaty";
import { commands, commandsMapping, commandsType } from "./commands";
import winston from "winston";
import { weatherWordsHandle } from "./weather";
import { inviteToRoom, roomWordsHandle } from "./room";
import { WechatyInterface } from "@juzi/wechaty/impls";
import { replaceSpace, say } from "@/server/utils/function";
import { AI_WHITE_LIST } from "@/server/utils/constant";
import { AI } from "@/server/openai";

export interface IWordsContextBase {
  user: Contact;
  logger: winston.Logger;
  bot: WechatyInterface;
  isPrivate: boolean;
}

export interface IWordsContextOnPrivate extends IWordsContextBase {
  msg: Message,
}
export interface IWordsContextWithRoom extends IWordsContextBase {
  msg: Message,
  room: Room;
}
export interface IWordsContextOnFriendship extends IWordsContextBase {
  text: string;
}

export type IWordsContext = IWordsContextOnPrivate | IWordsContextOnFriendship | IWordsContextWithRoom;

export function keyWordsHandle(ctx: IWordsContextOnPrivate): void;
export function keyWordsHandle(ctx: IWordsContextOnFriendship): void;
export function keyWordsHandle(ctx: IWordsContextWithRoom): void;
export function keyWordsHandle (ctx: IWordsContext) {
  const text = replaceSpace(getText(ctx));
  let words: string[] = [];
  if ('room' in ctx) {
    // 群聊需要过滤掉@用户名，保留住command和extra
    const match = text.match(/@(.+?)\s+(.+?)\s+(.+)/)
    if (match) {
      words = match.slice(2);
    }
  } else {
    words = text.split(' ');
  }

  if (words.length > 0 && commands.includes(words[0])) {
    commandMatchHandle(words, text, ctx);
  } else {
    fullMatchHandle(ctx, text);
  }
}

export const getText = (ctx: IWordsContext): string => {
  if ('text' in ctx) {
    return ctx.text
  }
  if ('msg' in ctx) {
    return ctx.msg.text()
  }
  return '';
}


// 指令匹配逻辑
const commandMatchHandle = (words: string[], text: string, ctx: IWordsContext) => {
  const [command, extra] = words;
  const type = Object.keys(commandsMapping).find(key => commandsMapping[key].includes(command));
  switch (type) {
    case commandsType.weather:
      weatherWordsHandle({
        ...ctx,
        command,
        city: extra,
        text,
      });
      break;
    case commandsType.exchangeRate:
      break;
    case commandsType.room:
      // 群聊消息处理
      roomWordsHandle(ctx as IWordsContextWithRoom, text);
      break;
    case commandsType.invite:
      inviteToRoom({ ...ctx, command });
      break;
    default:
      break;
  }
}

// 全匹配逻辑
const fullMatchHandle = async (ctx: IWordsContext, text: string) => {
  /**
   * TODO: 匹配不到命令关键词的逻辑
   */
  if (AI_WHITE_LIST.includes(ctx.user.id)) {
    await say(ctx, 'AI分析中，请稍后（具体时间取决于问题复杂程度）...');
    // 等待一会儿
    await new Promise(r => setTimeout(r, 1000))
    const resp = await AI.chat(text);
    await say(ctx, resp || '（AI响应异常）');
  } else {
    await say(ctx, `你不在AI白名单内，无法使用AI回复，尝试进行关键词回复：\n「${text}」匹配不到关键词，你可以试试对我说“天气 深圳”`);
  }
}
