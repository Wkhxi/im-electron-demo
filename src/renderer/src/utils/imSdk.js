import timRenderInstance from './timRenderInstance'
import initListener from './imListener'

import { state, mutations } from '../pages/store'
const { updateMessagesList } = mutations

export const initSdk = async () => {
  console.log('initSdk')
  /**
   * 初始化 imSdk
   * @returns {number} TIMResult枚举
   */
  const code = await timRenderInstance.TIMInit()

  console.log('11 code', code)

  if (code === 0) {
    // 初始化监听
    initListener((callback) => {
      const { data, cbType } = callback

      console.log('====== IM 监听回调消息 ======', data, cbType)

      switch (cbType) {
        /**
         * 处理收到消息逻辑
         */
        case 'TIMAddRecvNewMsgCallback':
          _handleMessage(data)
          break
        /**
         * 会话改变
         */
        case 'TIMSetConvEventCallback':
          _handleConversation(data)
          break
        /**
         * 未读数改变
         */
        case 'TIMSetConvTotalUnreadMessageCountChangedCallback':
          _handleUnreadChange(data)
          break
        default:
          break
      }
    })
  }
}

/**
 * @brief 收到新消息时，如果正在聊天，更新历史消息记录，并设置已读
 */
function _handleMessage(messages) {
  // messages 是 新消息 组成的数组
  // 数组中每一项是 新消息
  // 每个新消息可能来自不同的会话
  // 所以根据 message_conv_id 来区分这些消息
  console.log('messages', messages)

  const obj = {}
  // message_conv_id 消息所属会话ID
  // 这里为什么要过滤掉 meeting-group ，还不清楚
  const formatMessages = messages.filter((msg) => !msg.message_conv_id.includes('meeting-group'))

  console.log('formatMessages', formatMessages)
  for (let i = 0; i < formatMessages.length; i++) {
    console.log('i', i)
    obj[formatMessages[i].message_conv_id]
      ? obj[formatMessages[i].message_conv_id].push(formatMessages[i])
      : (obj[formatMessages[i].message_conv_id] = [formatMessages[i]])
  }

  console.log('obj', obj)
  for (const i in obj) {
    // 更新 所有有变动的会话的消息
    // 一般message都是存在store中，dispatch就可以了

    // 真实场景中这里 要将 obj中每个属性值 派发到 相应的会话中
    // 但是 我这里就只有 admin2 这一个会话 所以就直接写了
    if (i === 'admin2') {
      const arr = obj[i].map((_e) => ({
        txt: _e.message_elem_array[0]['text_elem_content'],
        sender: _e.message_sender === 'admin1',
        id: String(_e.message_msg_id)
      }))
      console.log('arr', arr, state.messagesList)
      updateMessagesList([...state.messagesList, ...arr])
    }
  }

  // 消息处理
  // 点击系统消息提示可以跳转
  // try {
  //   handleNotify(formatMessages)
  // } catch (err) {
  //   console.log(err)
  // }
}

function _handleConversation(conversations) {
  console.log('conversations', conversations)
}

function _handleUnreadChange(unreadCount) {
  console.log('unreadCount', unreadCount)
}
