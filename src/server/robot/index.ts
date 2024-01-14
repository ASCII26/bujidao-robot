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
import { BUJIDAO_NAME } from '../utils/constant';

class Robot {
  private bot: WechatyInterface;
  private bujidaoRoom?: Room;
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

  private async logout() {
    await this.bot.logout()
    this.logger.info('Bot logout')
  }

  private async listen() {
    this.bot.on('scan', this.onScan.bind(this));
    this.bot.on('login', this.onLogin.bind(this));
    this.bot.on('logout', this.onLogout.bind(this));
    this.bot.on('message', this.onMessage.bind(this));
    this.bot.on('room-join', this.onRoomIn.bind(this));
    this.bot.on('friendship', this.onFriendship.bind(this));

    this.bot.start()
      .then(async () => {
        this.logger.info('Bot start success.')
        this.bujidaoRoom = await this.bot.Room.find({ topic: BUJIDAO_NAME });
      })
      .catch((e: unknown) => this.logger.error(e))
  }

  private async onFriendship(friendship: Friendship) {
    if (friendship.type() === FriendshipType.Receive) {
      await friendship.accept();
      await new Promise(r => setTimeout(r, 1000))
      const helloMsg = friendship.hello();
      const user = friendship.contact();
      if (helloMsg) {
        keyWordsHandle({
          text: helloMsg,
          room: this.bujidaoRoom,
          user,
          logger: this.logger,
        })
      } else {
        await new Promise(r => setTimeout(r, 1000))
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
    const members = await room.memberAll();

    if (typeof helloMsg === 'function') {
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
      qrcodeTerminal.generate(qrcode, { small: true })  // show qrcode on console
  
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

    if (room) {
      this.roomMessageHandler({ msg, room, text, talker })
      return;
    }

    this.privateMessageHandler(msg, text, talker)
  }

  // 群聊消息处理
  private async roomMessageHandler({
    msg, room, text, talker
  }: {
    msg: Message,
    room: Room,
    text: string,
    talker: Contact,
  }) {
    if (!msg.mentionSelf()) {
      return;
    }
    const topic = await room.topic();

    this.logger.info({
      label: '收到群聊消息',
      message: text,
      userName: talker.name(),
      topic,
    });

    keyWordsHandle({
      msg,
      text,
      room: this.bujidaoRoom,
      user: talker,
      logger: this.logger,
      botId: this.bot.currentUser.id,
    });
  }

  // 个人消息处理
  private async privateMessageHandler(msg: Message, text: string, talker: Contact) {
    const userName = talker.name();
    this.logger.info({
      label: '收到个人消息',
      message: text,
      userName,
    });

    keyWordsHandle({
      msg,
      text,
      room: this.bujidaoRoom,
      user: talker,
      logger: this.logger,
    });
  }
}

export default Robot;