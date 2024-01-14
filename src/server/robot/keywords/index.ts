import { Contact, Message, Room } from "@juzi/wechaty";
import { commands, commandsMapping, commandsType } from "./commands";
import winston from "winston";
import { weatherWordsHandle } from "./weather";
import { roomWordsHandle } from "./room";

export interface IWordsContext {
  msg?: Message,
  text: string;
  user: Contact;
  logger: winston.Logger;
  botId?: string;
  room?: Room;
}

interface IWordsContextWithRoom extends IWordsContext {
  room: Room;
}
export const keyWordsHandle = (ctx: IWordsContext) => {
  const words = ctx.text.split(' ');
  if (words.length > 1 && commands.includes(words[0])) {
    commandMatchHandle(words, ctx);
  } else {
    fullMatchHandle(ctx);
  }
}

// 指令匹配逻辑
const commandMatchHandle = (words: string[], ctx: IWordsContext) => {
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
      roomWordsHandle(ctx);
      break;
    default:
      break;
  }
}

// 全匹配逻辑
const fullMatchHandle = (ctx: IWordsContext) => {
  // 进群邀请
  if (/群/.test(ctx.text) && ctx.room) {
    inviteToRoom(ctx as IWordsContextWithRoom);
    return;
  }

  ctx.user.say(`请问有什么事吗？你刚刚对我说：(${ctx.text})`);
}

const inviteToRoom = async ({
  room,
  user,
  logger,
}: IWordsContextWithRoom) => {
  const userName = user.name();
  if (await room.has(user)) {
    await user.say('你已经在群了')
  } else {
    await user.say('稍等，我拉你进去');
    room.add(user)
      .then(() => logger.info({ label: '邀请入群成功', userName }))
      .catch((error) => logger.error({ label: '邀请入群失败', error, userName }))
  }
}