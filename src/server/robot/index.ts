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
// import { weather } from '@/server/api/weather';
// import { getPrettyMsgOfWeather } from '../utils/function';
import { keyWordsHandle } from './keywords';
import { HELLO, ROOM_IN_MESSAGE } from '../utils/template-msg';

const BUJIDAO_NAME = '沐洒布吉岛Robot测试群';
const ADMINS = ['7881299792907647'];

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

    this.privateMessageHandler(text, talker)
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
    const owner = room.owner();

    this.logger.info({
      label: '收到群聊消息',
      message: text,
      userName: talker.name(),
      topic,
    });

    console.log('=====owner, currentUser, talker', owner?.id, this.bot.currentUser.id, talker.id);

    // 踢人关键字
    if (/踢人/.test(text)) {
      // 非群主
      if (!ADMINS.includes(talker.id)) {
        await msg.say('管理员才有权限执行这个操作')
      } else {
        await this.kickHandler(msg, room);
      }
      return;
    }

    // 打印群公告
    if (/公告/.test(text)) {
      await msg.say(await room.announce());
      return;
    }

    keyWordsHandle({
      text,
      room: this.bujidaoRoom,
      user: talker,
      logger: this.logger,
    });
  }

  private async kickHandler(msg: Message, room: Room) {
    // 执行踢人操作
    const mentionList = await msg.mentionList();
    const kickList = mentionList.filter(c => ![...ADMINS, this.bot.currentUser.id].includes(c.id));

    if (kickList.length === 0) {
      await msg.say('你要踢谁？请先@我，再使用 “踢人 @+群成员” 的格式告诉我');
      return;
    }
    await room.remove(kickList)
    await msg.say(`已将${kickList.map(c => c.name()).join('，')}踢出`);
  }

  // 个人消息处理
  private async privateMessageHandler(text: string, talker: Contact) {
    const userName = talker.name();
    this.logger.info({
      label: '收到个人消息',
      message: text,
      userName,
    });

    keyWordsHandle({
      text,
      room: this.bujidaoRoom,
      user: talker,
      logger: this.logger,
    });
    
//     if (/天气/.test(text)) {
//       const splitWords = text.split(' ');
//       const city = splitWords[1];
//       if (!city) {
//         await talker.say(`你想问哪里的天气呢？
// 回复“天气 某地”，查询实时天气状况
// 回复“天气预报 某地”，查询本周天气预报
// 关键词和地点之间用【空格】隔开`);
//         return;
//       }
//       const isForcast = /预报/.test(text);
//       const extension = isForcast ? 'all' : 'base';
//       const resp = await weather.get(city, extension);
//       if (resp.data) {
//         await talker.say(getPrettyMsgOfWeather(resp.data, isForcast));
//       } else {
//         await talker.say(resp.message);
//       }
//     }
  }

  // private async inviteToRoom(room: Room, user: Contact) {
  //   const userName = user.name();
  //   if (await room.has(user)) {
  //     await user.say('你已经在群了')
  //   } else {
  //     await user.say('稍等，我拉你进去');
  //     room.add(user)
  //       .then(() => this.logger.info({ label: '邀请入群成功', userName }))
  //       .catch((error) => this.logger.error({ label: '邀请入群失败', error, userName }))
  //   }
  // }
}

export default Robot;