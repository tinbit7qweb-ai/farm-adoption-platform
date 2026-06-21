import Mock from 'mockjs'

// 模拟数据库存储消息
let chatMsgList = [
  { chatId: 1, userId: 1, userName: '张先生', plotNum: 'P001', msg: '你好，请问这块地适合种西红柿吗？', sendType: 'user', time: '2026-06-20 09:12' },
  { chatId: 2, userId: 1, userName: '张先生', plotNum: 'P001', msg: '适合的，我这边可以给你一份种植方案', sendType: 'farmer', time: '2026-06-20 09:13' }
]
// 认养用户列表
const userList = [
  { userId: 1, userName: '张先生', plotNum: 'P001', unRead: 2 },
  { userId: 2, userName: '李女士', plotNum: 'P003', unRead: 0 }
]

export default function () {
  // 获取全部认养用户列表
  Mock.get('/mock/api/chat/userList', () => {
    return { code: 200, msg: 'success', data: userList }
  })

  // 获取单个用户聊天记录
  Mock.get('/mock/api/chat/msgList', (req) => {
    const params = new URLSearchParams(req.url.split('?')[1])
    const userId = Number(params.get('userId'))
    const filterMsg = chatMsgList.filter(item => item.userId === userId)
    return { code: 200, msg: 'success', data: filterMsg }
  })

  // 农场主发送消息接口
  Mock.post('/mock/api/chat/send', (req) => {
    const body = JSON.parse(req.body)
    const newMsg = {
      chatId: Mock.Random.increment(),
      userId: body.userId,
      userName: body.userName,
      plotNum: body.plotNum,
      msg: body.msg,
      sendType: 'farmer',
      time: new Date().toLocaleString()
    }
    chatMsgList.push(newMsg)
    return { code: 200, msg: '发送成功', data: newMsg }
  })
}