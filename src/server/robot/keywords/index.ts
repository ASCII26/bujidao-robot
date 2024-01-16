import { Contact, Message, Room } from "@juzi/wechaty";
import { commands, commandsMapping, commandsType } from "./commands";
import winston from "winston";
import { weatherWordsHandle } from "./weather";
import { inviteToRoom, roomWordsHandle } from "./room";
import { WechatyInterface } from "@juzi/wechaty/impls";

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
  const text = getText(ctx);
  const words = text.split(' ');
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
const fullMatchHandle = (ctx: IWordsContext, text: string) => {
  /**
   * TODO: 匹配不到命令关键词的逻辑
   */
  const say = 'msg' in ctx ? ctx.msg.say : ctx.user.say;
  say(`请问有什么事吗？你刚刚对我说：(${text})`);
}
