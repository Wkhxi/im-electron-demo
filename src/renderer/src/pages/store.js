import { reactive, readonly } from 'vue'

const initState = reactive({
  messagesList: new Map(), // convId -- list  会话id和会话历史消息
  userInfo: {
    userID: null,
    userSig: null
  },
  list: [],
  avChatRoomList: [
    {
      convId: '@TGS#aAG7MUWMV',
      name: '直播群测试',
      convType: 2
    }
  ]
})

export const state = readonly(initState)

export const mutations = {
  updateMessagesList(payload) {
    const history = initState.messagesList.get(payload.convId) || []
    initState.messagesList.set(payload.convId, [...history, ...payload.list])
  },
  updateUserInfo(payload) {
    initState.userInfo = payload
  },
  setList(payload) {
    initState.list = payload
  },
  updateList(payload) {
    const listClone = [...initState.list]
    for (let i = 0; i < payload.length; i++) {
      const { conv_id, conv_profile, conv_type } = payload[i]
      const item = {
        name: conv_profile.user_profile_nick_name || conv_id,
        convId: conv_id,
        convType: conv_type
      }
      const convIndex = listClone.findIndex((_e) => _e.conv_id === conv_id)
      if (convIndex > -1) {
        // 更新会话
        listClone[convIndex] = item
      } else {
        // 新增会话
        listClone.unshift(item)
      }
    }

    initState.list = listClone
  },
  avChatRoomList() {}
}
