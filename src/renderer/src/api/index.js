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
 * joinGroupMode --> TIMGroupAddOption枚举： 加群选项 kTIMGroupAddOpt_Any 任何人都可以加群  2
 */
export const createGroup = async (params) => {
  const { groupName, groupMember, groupAnnouncement, groupType, joinGroupMode, groupId } = params
  const createParams = {
    create_group_param_add_option: Number(joinGroupMode),
    create_group_param_group_type: Number(groupType), // 群组类型
    create_group_param_group_member_array: [
      // 群组成员属性
      {
        group_member_info_member_role: 1, // 群组成员角色
        group_member_info_identifier: groupMember // 群组成员ID 将其拉进群聊并且设置为管理员
      }
    ],
    create_group_param_group_name: groupName, // 群组名称
    create_group_param_notification: groupAnnouncement, // 群组公告
    create_group_param_group_id: groupId // 选填，不填时会返回一个后台分配的群id
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

/**
 * 加群
 */
export const joinGroup = async (params) => {
  const data = await timRenderInstance.TIMGroupJoin({
    ...params,
    helloMsg: 'Hello',
    data: ''
  })
  return data
}

/**
 * 加群
 */
export const quitGroup = async (groupId, data) => {
  const res = await timRenderInstance.TIMGroupQuit({
    groupId,
    data: data || ''
  })
  return res
}

/**
 * 获取已加入群组列表
 */
export const getJoinGroupList = async () => {
  const { code, json_param } = await timRenderInstance.TIMGroupGetJoinedGroupList()

  const groupList = json_param

  return groupList
}

/**
 * 获取群成员列表
 */
export const getGroupMemberList = async (params) => {
  const { groupId, userIds, nextSeq } = params
  const queryParams = {
    group_get_members_info_list_param_group_id: groupId,
    group_get_members_info_list_param_next_seq: nextSeq
  }

  if (userIds && userIds?.length) {
    queryParams.group_get_members_info_list_param_identifier_array = userIds
  }
  const data = await timRenderInstance.TIMGroupGetMemberInfoList({
    params: queryParams
  })
  const { code, json_param } = data
  if (code === 0) {
    const result = json_param
    return result
  }
  return {}
}
