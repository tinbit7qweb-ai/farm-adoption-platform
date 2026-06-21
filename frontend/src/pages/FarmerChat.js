import React, { useState, useEffect } from 'react';
import request from '../utils/request'
import '../styles/farmer.css';

function FarmerChat({ user }) {
  // 用户列表、当前选中用户、聊天记录、输入框内容
  const [userList, setUserList] = useState([]);
  const [selectUser, setSelectUser] = useState(null);
  const [msgList, setMsgList] = useState([]);
  const [msgText, setMsgText] = useState('');
  const [loading, setLoading] = useState(false);

  // 页面初始化：加载所有认养用户
  const loadUserList = async () => {
    try {
      const res = await request.get('/chat/userList')
      if (res.code === 200) {
        setUserList(res.data)
        // 默认选中第一个用户
        if (res.data.length > 0) {
          setSelectUser(res.data[0])
          loadMsg(res.data[0].userId)
        }
      }
    } catch (err) {
      alert('加载用户失败：' + err.message)
    }
  }

  // 根据用户id加载聊天记录
  const loadMsg = async (userId) => {
    setLoading(true)
    try {
      const res = await request.get(`/chat/msgList?userId=${userId}`)
      if (res.code === 200) {
        setMsgList(res.data)
      }
    } catch (err) {
      alert('加载聊天记录失败：' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // 切换左侧用户
  const changeUser = (item) => {
    setSelectUser(item)
    loadMsg(item.userId)
  }

  // 发送消息
  const sendMsg = async () => {
    if (!msgText.trim() || !selectUser) return
    try {
      const res = await request.post('/chat/send', {
        userId: selectUser.userId,
        userName: selectUser.userName,
        plotNum: selectUser.plotNum,
        msg: msgText.trim()
      })
      if (res.code === 200) {
        setMsgList([...msgList, res.data])
        setMsgText('')
      }
    } catch (err) {
      alert('发送失败：' + err.message)
    }
  }

  // 页面挂载加载用户
  useEffect(() => {
    loadUserList()
  }, [])

  return (
    <div className="farmer-chat-page" style={{ display: 'flex', gap: '20px', height: '70vh' }}>
      {/* 左侧用户列表 */}
      <div style={{ width: '280px', border: '1px solid #ddd', borderRadius: '8px', padding: '10px' }}>
        <h3>认养用户列表</h3>
        {userList.map(item => (
          <div
            key={item.userId}
            onClick={() => changeUser(item)}
            style={{
              padding: '10px',
              margin: '8px 0',
              borderRadius: '6px',
              cursor: 'pointer',
              background: selectUser?.userId === item.userId ? '#e8e4ff' : '#f8f8f8',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <p style={{ margin: 0 }}>{item.userName}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>地块：{item.plotNum}</p>
            </div>
            {item.unRead > 0 && (
              <span style={{
                background: '#f54242',
                color: '#fff',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                fontSize: '12px'
              }}>
                {item.unRead}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* 右侧聊天窗口 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid #ddd', borderRadius: '8px' }}>
        <div style={{ padding: '15px', borderBottom: '1px solid #ddd' }}>
          {selectUser ? `当前对话：${selectUser.userName}` : '请选择左侧用户开始聊天'}
        </div>
        <div style={{ flex: 1, padding: '15px', overflowY: 'auto', background: '#fcfcfc' }}>
          {loading ? (
            <p>加载聊天记录中...</p>
          ) : msgList.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center' }}>暂无聊天记录</p>
          ) : (
            msgList.map(item => (
              <div key={item.chatId} style={{ marginBottom: '12px', textAlign: item.sendType === 'farmer' ? 'right' : 'left' }}>
                <div style={{
                  maxWidth: '60%',
                  background: item.sendType === 'farmer' ? '#d1ffd1' : '#e8e4ff',
                  padding: '8px 12px',
                  borderRadius: item.sendType === 'farmer' ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
                  width: 'fit-content',
                  marginLeft: item.sendType === 'farmer' ? 'auto' : '0'
                }}>
                  {item.msg}
                </div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>{item.time}</div>
              </div>
            ))
          )}
        </div>
        <div style={{ display: 'flex', padding: '10px', borderTop: '1px solid #ddd' }}>
          <input
            type="text"
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
            placeholder="输入消息..."
            style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}
            onKeyDown={(e) => e.key === 'Enter' && sendMsg()}
          />
          <button
            onClick={sendMsg}
            style={{ marginLeft: '10px', padding: '0 20px', background: '#7b61ff', color: '#fff', border: 'none', borderRadius: '6px' }}
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}

export default FarmerChat;