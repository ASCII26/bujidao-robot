export const HELLO = `您好，我是沐洒布吉岛大管家。回复以下关键词，可体验对应功能：
【技术群】拉您进前端技术交流群
【小岛管家】拉您进小岛管家项目交流群
【天气 + 地点】实时天气查询，例如：天气 深圳
【天气预报 + 地点】天气预报查询，例如：天气预报 深圳\n
其它功能正在持续研发中，敬请期待`;

export const ROOM_IN_MESSAGE: Record<string, string | ((params: any) => string)> = {
  '小岛管家项目交流群': '欢迎加入小岛管家项目交流群！',
  '沐洒布吉岛': ({ nameList, members}: {
    nameList: string, members: string[]
  }) => `欢迎 ${nameList}！！！\n欢迎成为沐洒布吉岛第${members.length}位岛民！\n可以先看下公告，了解下群规哈～`,
};