import timRenderInstance from './timRenderInstance'
import initListener from './imListener'

import { state, mutations } from '../pages/store'
import { toRefs } from 'vue'
const { updateMessagesList } = mutations
const { userInfo } = toRefs(state)

import { addProfileForConversation } from '../api/index'

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

      console.log(`====== IM 监听回调消息 ${cbType} ======`, data)

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
    // if (i === 'admin2') {
    //   const arr = obj[i].map((_e) => ({
    //     txt: _e.message_elem_array[0]['text_elem_content'],
    //     sender: _e.message_sender === 'admin1',
    //     id: String(_e.message_msg_id)
    //   }))
    //   console.log('arr', arr, state.messagesList)
    //   updateMessagesList([...state.messagesList, ...arr])
    // }

    const arr = obj[i].map((_e) => ({
      txt: _e.message_elem_array[0]['text_elem_content'],
      sender: _e.message_sender === userInfo.value.userID,
      id: String(_e.message_msg_id)
    }))
    console.log('arr', arr, state.messagesList)
    // updateMessagesList([...state.messagesList, ...arr])
    updateMessagesList({
      convId: i,
      list: arr
    })
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
  const { type, data } = conversations
  switch (type) {
    /**
     * 新增会话
     * 收到一条新消息,产生一个新的会话是事件触发
     */
    case 0:
      console.log('新增会话')
      _updateConversation(data)
      break
    /**
     * 删除会话
     * 删除某会话时会触发
     */
    case 1:
      console.log('删除会话')
      break
    /**
     * 会话更新
     */
    case 2:
      console.log('会话更新')
      _updateConversation(data)
      break
    /**
     * 会话开始
     */
    case 3:
      console.log('开始同步会话')
      break
    /**
     * 会话结束
     */
    case 4:
      console.log('同步会话完成')
      break
  }
}

async function _updateConversation(conversationList) {
  console.log('conversationList', conversationList)
  if (conversationList.length) {
    const formatConv = conversationList.filter((item) => !item.conv_id.includes('meeting-group'))
    const convList = await addProfileForConversation(formatConv)
    console.log('convList', convList)

    // 根据 数组中每项的 conv_id 是否在原conversationList中 来确定操作是 更新会话 或 添加会话
    // dispatch(updateConversationList(convList))
    // 更新失败消息上屏
    try {
      _handleMessageSendFailed(convList)
    } catch (err) {
      console.error(err)
    }

    /**
     * TIMElemType
     * 0  文本元素
     * 1  图片元素
     * 2  声音元素
     * 3  自定义元素
     * 8  群组系统通知元素
     */
    const elemType = formatConv[0]?.conv_last_msg?.message_elem_array?.[0]?.elem_type
    if (elemType === 3) {
      // dispatch(
      //   updateMessages({
      //     convId: formatConv[0].conv_id,
      //     message: formatConv[0].conv_last_msg
      //   })
      // )
    }
  }
}

function _handleMessageSendFailed(convList) {
  const failedList = convList.reduce((acc, cur) => {
    /**
     * message_status -- TIMMsgStatus
     * 2 	消息发送成功
     * 3  消息发送失败
     */
    if (cur.conv_last_msg && cur?.conv_last_msg.message_status === 3) {
      const key = cur.conv_id
      const value = acc[key] ? acc[key].push(cur.conv_last_msg) : [cur.conv_last_msg]
      return {
        ...acc,
        [key]: value
      }
    }
  }, {})

  if (!failedList) return
  for (const i in failedList) {
    // 这里不太理解
    // 对于发送失败的消息，为什么不再次待用im api sendMsg，而是 直接改本地的 messagesList
    // dispatch(
    //   updateMessages({
    //     convId: i,
    //     message: failedList[i][0]
    //   })
    // )
  }
}

function _handleUnreadChange(unreadCount) {
  console.log('unreadCount', unreadCount)
}
