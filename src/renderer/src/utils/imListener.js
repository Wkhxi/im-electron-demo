import timRenderInstance from './timRenderInstance'

/**
 * 初始化监听回调
 */
export default function initListener(callback) {
  /**
   * 注销消息监听事件
   */
  timRenderInstance.TIMRemoveRecvNewMsgCallback()

  console.log('initListener')

  /**
   * 用户登录状态,接收到ImSDK收到新消息
   *
   * 拉取 本地曾经没有过的消息
   */
  timRenderInstance.TIMAddRecvNewMsgCallback({
    // json_msg_array 消息数组
    // user_data
    callback: (...args) => {
      console.log('TIMAddRecvNewMsgCallback args', args)
      callback({
        cbType: 'TIMAddRecvNewMsgCallback',
        data: JSON.parse(args[0][0])
      })
    },
    user_data: 'TIMAddRecvNewMsgCallback'
  })

  /**
   * 会话
   * 新增 更新 删除 开始 结束
   */
  timRenderInstance.TIMSetConvEventCallback({
    // conv_event 会话事件类型
    // json_conv_array 会话信息列表
    // user_data
    callback: (...args) => {
      // args [Array(3)]
      console.log('TIMSetConvEventCallback args', args)
      callback({
        cbType: 'TIMSetConvEventCallback',
        data: {
          type: args[0][0],
          data: args[0][1] !== '' ? JSON.parse(args[0][1]) : []
        }
      })
    },
    user_data: 'TIMSetConvEventCallback'
  })

  /**
   * 设置会话未读消息总数变更的回调
   * 接收到 未读的消息总数
   */
  timRenderInstance.TIMSetConvTotalUnreadMessageCountChangedCallback({
    callback: (...args) => {
      console.log('TIMSetConvTotalUnreadMessageCountChangedCallback args', args)
      callback({
        cbType: 'TIMSetConvTotalUnreadMessageCountChangedCallback',
        data: args[0][0]
      })
    },
    user_data: 'TIMSetConvTotalUnreadMessageCountChangedCallback'
  })
}
