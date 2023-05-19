import { reactive, readonly } from 'vue'

const initState = reactive({
  messagesList: []
})

export const state = readonly(initState)

export const mutations = {
  updateMessagesList(payload) {
    initState.messagesList = payload
  }
}
