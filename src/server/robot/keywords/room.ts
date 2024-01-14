import { IWordsContext } from ".";
import { ADMINS } from "@/server/utils/constant";

export const roomWordsHandle = async (ctx: IWordsContext) => {
  // 踢人关键字
  if (/踢人/.test(ctx.text)) {
    // 非群主
    if (!ADMINS.includes(ctx.user.id)) {
      await ctx.msg?.say('管理员才有权限执行这个操作')
    } else {
      await kickHandler(ctx);
    }
    return;
  }

  // 打印群公告
  if (/公告/.test(ctx.text)) {
    await ctx.room?.say(await ctx.room.announce());
    return;
  }
}

const kickHandler = async (ctx: IWordsContext)  => {
  // 执行踢人操作
  const mentionList = await ctx.msg?.mentionList() ?? [];
  const kickList = mentionList.filter(c => ![...ADMINS, ctx.botId].includes(c.id));

  if (kickList.length === 0) {
    await ctx.msg?.say('你要踢谁？请先@我，再使用 “踢人 @+群成员” 的格式告诉我');
    return;
  }
  await ctx.room?.remove(kickList)
  await ctx.msg?.say(`已将${kickList.map(c => c.name()).join('，')}踢出`);
}