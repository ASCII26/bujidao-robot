import {
  Contact,
  Message,
  ScanStatus,
  WechatyBuilder,
} from 'wechaty';
import Koa from 'koa';
import type { WechatyInterface } from 'wechaty/impls';
import qrcodeTerminal from 'qrcode-terminal'

class Robot {
  private bot: WechatyInterface;
  constructor(token: string, private ctx: Koa.Context) {
    console.log('=====create robot:', token, ctx.logger);
    this.bot = WechatyBuilder.build({
      name: 'bujidao-bot',
      puppet: 'wechaty-puppet-service',
      puppetOptions: {
        token,
      }
    });
    this.listen();
  }

  private listen() {
    this.bot.on('scan', this.onScan)
    this.bot.on('login', this.onLogin)
    this.bot.on('logout', this.onLogout)
    this.bot.on('message', this.onMessage)

    this.bot.start()
      .then(() => this.ctx.logger.info('StarterBot', 'Starter Bot Started.'))
      .catch((e: unknown) => this.ctx.logger.error('StarterBot', e))
  }

  private onScan(qrcode: string, status: ScanStatus) {
    if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
      const qrcodeImageUrl = [
        'https://wechaty.js.org/qrcode/',
        encodeURIComponent(qrcode),
      ].join('')
      this.ctx.logger.info('StarterBot', 'onScan: %s(%s) - %s', ScanStatus[status], status, qrcodeImageUrl)
  
      qrcodeTerminal.generate(qrcode, { small: true })  // show qrcode on console
  
    } else {
      this.ctx.logger.info('StarterBot', 'onScan: %s(%s)', ScanStatus[status], status)
    }
  }

  private onLogin (user: Contact) {
    this.ctx.logger.info('StarterBot', '%s login', user)
  }
  
  private onLogout (user: Contact) {
    this.ctx.logger.info('StarterBot', '%s logout', user)
  }

  private async onMessage (msg: Message) {
    if (msg.self()) {
      return
    }
  
    this.ctx.logger.info('StarterBot', msg.toString())
  
    if (msg.text() === 'ding') {
      await msg.say('dong')
    }
  
    const room = msg.room()
    if (room) {
      const topic = await room.topic()
      console.log(`room topic is : ${topic}`)
    }
  
    if (await msg.mentionSelf()) {
      const text = msg.text()
      console.log(`被人@了，文本为：${text}`)
      await msg.say(`请问有什么事吗？你刚刚对我说：(${text})`);
    }
  }
}

export default Robot;