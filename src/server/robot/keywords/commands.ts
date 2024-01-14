export enum commandsType {
  weather = 'weather',
  exchangeRate = 'exchangeRate',
  room = 'room',
}
export const commandsMapping: Record<string, string[]> = {
  [commandsType.weather]: [
    '天气',
    '天气预报',
  ],
  [commandsType.exchangeRate]: [
    '汇率',
  ],
  [commandsType.room]: [
    '踢人',
    '公告',
  ],
}
export const commands = Object.values(commandsMapping).reduce((acc, cur) => acc.concat(cur), []);