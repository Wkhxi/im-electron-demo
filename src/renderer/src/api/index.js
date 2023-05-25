import timRenderInstance from '../utils/timRenderInstance'

const HISTORY_MESSAGE_COUNT = 50

const getIds = (conversionList) =>
  conversionList.reduce(
    (acc, cur) => {
      if (cur.conv_type === 2) {
        // 群会话
        return {
          ...acc,
          groupIds: [...acc.groupIds, cur.conv_id]
        }
      } else if (cur.conv_type === 1) {
        // 个人会话
        return {
          ...acc,
          userIds: [...acc.userIds, cur.conv_id]
        }
      }
      return acc
    },
    { userIds: [], groupIds: [] }
  )

/**
 * @brief 获取任何人的个人资料
 */
export const getUserInfoList = async (userIdList) => {
  const { code, json_param } = await timRenderInstance.TIMProfileGetUserProfileList({
    json_get_user_profile_list_param: {
      friendship_getprofilelist_param_identifier_array: userIdList,
      friendship_getprofilelist_param_force_update: false // 是否强制更新
    },
    user_data: ''
  })
  console.log(code)
  return json_param
}

/**
 * @brief 获取多个群的群资料
 */
export const getGroupInfoList = async (groupIdList) => {
  const { code, json_param } = await timRenderInstance.TIMGroupGetGroupInfoList({
    groupIds: groupIdList
  })
  if (code !== 0) {
    return []
  }
  const groupInfoList = json_param
  console.log('groupInfoList', groupInfoList)

  return groupInfoList.map((item) => item.get_groups_info_result_info) // GroupInfo 群详细信息
}

export const addProfileForConversation = async (conversationList) => {
  // 个人会话id 和 群组会话id
  const { userIds, groupIds } = getIds(conversationList)
  const userInfoList = userIds.length ? await getUserInfoList(userIds) : []
  const groupInfoList = groupIds.length ? await getGroupInfoList(groupIds) : groupIds

  return conversationList.map((item) => {
    const { conv_type, conv_id } = item
    let profile
    if (conv_type === 2) {
      profile = groupInfoList.find((group) => {
        const { group_detial_info_group_id } = group
        return group_detial_info_group_id === conv_id
      })
    } else if (conv_type === 1) {
      profile = userInfoList.find((user) => user.user_profile_identifier === conv_id)
    }
    return {
      ...item,
      conv_profile: profile || {}
    }
  })
}
/**
 * @brief 获取最近联系人的会话列表
 * @returns
 */
export const getConversionList = async () => {
  /**
   * 返回
   * conv_id
   * conv_type
   * conv_unread_num
   * conv_active_time
   * conv_is_has_lastmsg
   * conv_last_msg
   * ...
   */
  const { json_param } = await timRenderInstance.TIMConvGetConvList({})

  // 过滤掉 无效会话
  const hasLastMessageList = json_param.filter((item) => item.conv_type != 0)
  const conversationListProfile = addProfileForConversation(hasLastMessageList)

  return conversationListProfile
}

/**
 * 	从 msg_getmsglist_param_last_msg 指定的消息开始获取本地消息列表，msg_getmsglist_param_count 为要获取的消息数目。msg_getmsglist_param_last_msg 可以不指定，不指定时表示以会话最新的消息为 LastMsg 。
 若指定 msg_getmsglist_param_is_remble 为true 则本地消息获取不够指定数目时，会去获取云端漫游消息。

 客户端获取的消息都在本地，云端消息有漫游时间，默认存七天。
 sdk有一个本地db，客户端拉取过的消息会存在本地db中，不受漫游时间限制
 云端消息存在漫游时间限制

 */
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
