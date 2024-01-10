export enum commandsType {
  weather = 'weather',
  exchangeRate = 'exchangeRate',
}
export const commandsMapping: Record<string, string[]> = {
  [commandsType.weather]: [
    '天气',
    '天气预报',
  ],
  [commandsType.exchangeRate]: [
    '汇率',
  ]
}
export const commands = Object.values(commandsMapping).reduce((acc, cur) => acc.concat(cur), []);