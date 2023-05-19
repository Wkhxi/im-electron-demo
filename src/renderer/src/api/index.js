import timRenderInstance from '../utils/timRenderInstance'

const HISTORY_MESSAGE_COUNT = 50

export const getMsgList = async (
  convId,
  convType,
  lastMsg = null,
  isForward = false,
  count = HISTORY_MESSAGE_COUNT
) => {
  // Array<Json_value_msg>
  const { json_params } = await timRenderInstance.TIMMsgGetMsgList({
    conv_id: convId, // 会话
    conv_type: convType, // 会话类型 TIMConvType
    params: {
      msg_getmsglist_param_last_msg: lastMsg, // 指定的消息
      msg_getmsglist_param_count: count, // 从指定消息往后的消息数
      msg_getmsglist_param_is_remble: true, // 是否漫游消息
      msg_getmsglist_param_is_forward: isForward // 是否向前排序
    }
  })

  return json_params
}

export const sendMsg = async ({ convId, convType, messageElementArray, userId, callback }) => {
  console.log('28', convId, convType, messageElementArray, userId)
  const res = await timRenderInstance.TIMMsgSendMessageV2({
    conv_id: convId, // 发送给谁
    conv_type: convType,
    params: {
      message_elem_array: messageElementArray, // 消息内容
      message_sender: userId // 发送方
    },
    callback,
    user_data: ''
  })
  console.log('39 === ', res)
  // res --> message_msg_id
  return { data: { code: 0, desc: '', json_params: res, user_data: '' } }
}

/**
 * 创建群组
 * groupType --> TIMGroupType枚举: 直播群 kTIMGroup_AVChatRoom 4
 */
export const createGroup = async (params) => {
  const { groupName, groupMember, groupAnnouncement, groupType, joinGroupMode, groupId } = params
  const createParams = {
    create_group_param_add_option: Number(joinGroupMode),
    create_group_param_group_member_array: [
      {
        group_member_info_member_role: 1,
        group_member_info_identifier: groupMember
      }
    ],
    create_group_param_group_name: groupName,
    create_group_param_group_type: Number(groupType),
    create_group_param_notification: groupAnnouncement,
    create_group_param_group_id: groupId
  }

  const data = await timRenderInstance.TIMGroupCreate({
    params: createParams
  })

  const { code, desc, json_param } = data
  if (code === 0) {
    const result = json_param
    return result
  }
  throw new Error(desc)
}
