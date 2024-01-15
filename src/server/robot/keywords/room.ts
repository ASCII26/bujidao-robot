import { IWordsContextOnFriendship, IWordsContextOnPrivate, IWordsContextWithRoom } from ".";
import { ADMINS, roomKeywordsMap, roomNamesMap } from "@/server/utils/constant";

export const roomWordsHandle = async (ctx: IWordsContextWithRoom, text: string) => {
  // 踢人关键字
  if (/踢人/.test(text)) {
    // 非群主
    if (!ADMINS.includes(ctx.user.id)) {
      await ctx.room?.say('管理员才有权限执行这个操作')
    } else {
      await kickHandler(ctx);
    }
    return;
  }

  // 打印群公告
  if (/公告/.test(text)) {
    await ctx.room?.say(await ctx.room.announce());
    return;
  }
}

const kickHandler = async (ctx: IWordsContextWithRoom)  => {
  // 执行踢人操作
  const mentionList = await ctx.msg?.mentionList() ?? [];
  const kickList = mentionList.filter(c => ![...ADMINS, ctx.bot.currentUser.id].includes(c.id));

  if (kickList.length === 0) {
    await ctx.msg?.say('你要踢谁？请先@我，再使用 “踢人 @+群成员” 的格式告诉我');
    return;
  }
  await ctx.room.remove(kickList)
  await ctx.msg?.say(`已将${kickList.map(c => c.name()).join('，')}踢出`);
}

export const inviteToRoom = async ({
  user,
  logger,
  isPrivate,
  command,
  bot,
}: (IWordsContextOnFriendship | IWordsContextOnPrivate) & { command: string }) => {
  // 群聊消息里不处理邀请入群命令
  if (!isPrivate) {
    return;
  }

  const userName = user.name();
  const roomKeyword = Object.keys(roomKeywordsMap).find(k => roomKeywordsMap[k].includes(command));
  const roomName: string | undefined = roomKeyword ? roomNamesMap[roomKeyword] : undefined;
  const room = roomName
    ? await bot.Room.find(roomName)
    : undefined;

  if (!room) {
    return;
  }
  
  if (await room.has(user)) {
    await user.say('你已经在群了')
  } else {
    await user.say('稍等，我拉你进去');
    room.add(user)
      .then(() => logger.info({ label: '邀请入群成功', userName }))
      .catch((error) => logger.error({ label: '邀请入群失败', error, userName }))
  }
}