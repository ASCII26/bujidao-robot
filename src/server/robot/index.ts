import {
  Contact,
  Message,
  Room,
  ScanStatus,
  WechatyBuilder,
  Friendship,
} from '@juzi/wechaty';
import { Friendship as FriendshipType } from '@juzi/wechaty-puppet/types' 
import type { WechatyInterface } from '@juzi/wechaty/impls';
import qrcodeTerminal from 'qrcode-terminal'
import winston from 'winston';
import { keyWordsHandle } from './keywords';
import { HELLO, ROOM_IN_MESSAGE } from '../utils/template-msg';

class Robot {
  private bot: WechatyInterface;
  constructor(token: string, private logger: winston.Logger) {
    this.bot = WechatyBuilder.build({
      name: 'bujidao-bot',
      puppet: '@juzi/wechaty-puppet-service',
      // puppet: 'wechaty-puppet-wechat4u',
      puppetOptions: {
        token,
      }
    });
    this.listen();
  }

  private async listen() {
    this.bot.on('scan', this.onScan.bind(this));
    this.bot.on('login', this.onLogin.bind(this));
    this.bot.on('logout', this.onLogout.bind(this));
    this.bot.on('message', this.onMessage.bind(this));
    this.bot.on('room-join', this.onRoomIn.bind(this));
    this.bot.on('friendship', this.onFriendship.bind(this));

    this.bot.start()
      .then(() => this.logger.info('Bot start success.'))
      .catch((e: unknown) => this.logger.error(e))
  }

  private async onFriendship(friendship: Friendship) {
    if (friendship.type() === FriendshipType.Receive) {
      await friendship.accept();
      // 需要等待一会儿，等待系统处理好友请求
      await new Promise(r => setTimeout(r, 1000))
      const helloMsg = friendship.hello();
      const user = friendship.contact();
      if (helloMsg) {
        keyWordsHandle({
          text: helloMsg,
          user,
          logger: this.logger,
          bot: this.bot,
          isPrivate: true,
        })
      } else {
        user.say(HELLO);
      }
    }
  }

  private async onRoomIn(room: Room, inviteeList: Contact[], inviter: Contact) {
    const topic = await room.topic();
    const helloMsg = ROOM_IN_MESSAGE[topic];
    const nameList = inviteeList.map(c => c.name()).join(',');
    this.logger.info({
      room: room.topic(),
      invitee: nameList,
      inviter: inviter.name(),
    })
    
    if (!helloMsg) {
      return;
    }
    
    if (typeof helloMsg === 'function') {
      const members = await room.memberAll();
      room.say(helloMsg({ nameList, members }));
    } else {
      room.say(helloMsg);
    }
  }

  private onScan(qrcode: string, status: ScanStatus) {
    if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
      const qrcodeImageUrl = [
        'https://wechaty.js.org/qrcode/',
        encodeURIComponent(qrcode),
      ].join('')
      this.logger.info(`onScan: ${ScanStatus[status]}(${status}) - ${qrcodeImageUrl}`)
      qrcodeTerminal.generate(qrcode, { small: true })
    } else {
      this.logger.info(`onScan: ${ScanStatus[status]}(${status})`)
    }
  }

  private onLogin (user: Contact) {
    this.logger.info(`${user} login`)
  }
  
  private onLogout (user: Contact) {
    this.logger.info(`${user} logout`)
  }

  private async onMessage (msg: Message) {
    if (msg.self()) {
      return
    }

    const text = msg.text();
    const talker = msg.talker();
    const room = msg.room();
    const userName = talker.name();

    // 群聊消息处理
    if (room) {
      if (!msg.mentionSelf()) {
        return;
      }
      const topic = await room.topic();
      this.logger.info({ label: '收到群聊消息', message: text, userName, topic });
    } else {
      this.logger.info({ label: '收到个人消息', message: text, userName });
    }

    keyWordsHandle({
      ...(room ? { room } : {}),
      msg,
      user: talker,
      logger: this.logger,
      bot: this.bot,
      isPrivate: !room,
    });
  }
}

export default Robot;