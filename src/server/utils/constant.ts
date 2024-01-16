// 管理员ID列表
export const ADMINS = ['7881299792907647'];

export enum ROOM_NAMES {
  BUJIDAO,
  ROBOT,
}
export const roomKeywordsMap: Record<string, string[]> = {
  [ROOM_NAMES.BUJIDAO]: ['布吉岛', '技术群'],
  [ROOM_NAMES.ROBOT]: ['小岛管家', '机器人'],
};

export const roomNamesMap: Record<string, string> = {
  [ROOM_NAMES.BUJIDAO]: '沐洒布吉岛',
  [ROOM_NAMES.ROBOT]: '小岛管家项目交流群',
}

export const roomInviteWords = Object.values(roomKeywordsMap).flatMap(w => w);