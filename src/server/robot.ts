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

const BUJIDAO_NAME = '沐洒布吉岛Robot测试群';
const ADMINS = ['7881299792907647'];

class Robot {
  private bot: WechatyInterface;
  private bujidaoRoom?: Room;
  constructor(token: string, private logger: winston.Logger) {
    this.bot = WechatyBuilder.build({
      name: 'bujidao-bot',
      puppet: '@juzi/wechaty-puppet-service',
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
      .then(async () => {
        this.logger.info('Bot start success.')
        this.bujidaoRoom = await this.bot.Room.find({ topic: BUJIDAO_NAME });
      })
      .catch((e: unknown) => this.logger.error(e))
  }

  private async onFriendship(friendship: Friendship) {
    if (friendship.type() === FriendshipType.Receive) {
      await friendship.accept();
      if (/群/.test(friendship.hello()) && this.bujidaoRoom) {
        // if want to send msg , you need to delay sometimes
        await new Promise(r => setTimeout(r, 1000))
        
        const user = friendship.contact();
        this.inviteToRoom(this.bujidaoRoom, user);
      }
      this.logger.info(`Friendship accept success.`);
      friendship
    }
  }

  private async onRoomIn(room: Room, inviteeList: Contact[], inviter: Contact) {
    const nameList = inviteeList.map(c => c.name()).join(',');
    const members = await room.memberAll();
    room.say(`欢迎 ${nameList}！！！\n欢迎成为沐洒布吉岛第${members.length}位岛民！\n可以先看下公告，了解下群规哈～`);
    this.logger.info({
      room: room.topic(),
      invitee: nameList,
      inviter: inviter.name(),
    })
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

    await msg.say(`请问有什么事吗？你刚刚对我说：(${text})`);
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

    // 进群邀请
    if (/群/.test(text) && this.bujidaoRoom) {
      this.inviteToRoom(this.bujidaoRoom, talker);
    }
  }

  private async inviteToRoom(room: Room, user: Contact) {
    const userName = user.name();
    if (await room.has(user)) {
      await user.say('你已经在群了')
    } else {
      await user.say('稍等，我拉你进去');
      room.add(user)
        .then(() => this.logger.info({ label: '邀请入群成功', userName }))
        .catch((error) => this.logger.error({ label: '邀请入群失败', error, userName }))
    }
  }
}

export default Robot;