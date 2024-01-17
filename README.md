# 小岛管家（ChatBot）

基于[Wechaty](https://wechaty.gitbook.io/wechaty/v/zh/quick-start)开发的Chatbot，支持两种方式的消息回复机制：
1. 关键词
2. AI


## 关键词（持续迭代中）
tips: 关键词之间用空格隔开
#### 天气
- **天气 + 地点**：提供某地的实时天气查询能力
- **天气预报 + 地点**：提供某地的天气预报能力
#### 群聊
- **技术群** 或 **布吉岛**：拉你进沐洒前端技术交流群
- **机器人** 或 **小岛管家**：拉你进“小岛管家”项目开发交流群（也就是本项目）
- **踢人**（白名单）：把人踢出群聊，只有白名单内管理员才有资格
- **公告**： 打印当前群聊公告
#### 汇率（开发中）

其它需要什么好玩的能力，欢迎群里交流或者提issue给我，逐渐丰富。

## AI
项目接入了原生OPENAI，可以随意调用不同的模型（默认GPT3.5），但因为成本较高（我自己的token），并且有一定的封杀风险，目前只对**白名单**用户开放。

### 白名单
暂时只有我自己哈哈哈


## TODO
- [ ] AI能力开放
- [ ] 汇率查询功能
- [ ] CI/CD
- [ ] 接入DB
- [ ] Robot管理页面
- [ ] 其它

---

欢迎扫码体验：

![image](https://github.com/ASCII26/bujidao-robot/assets/5102623/cab6d1db-9391-44c7-b754-fc44cd303bd0)
