<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref, onMounted, watch, nextTick, toRefs } from 'vue'
import { getMsgList } from '../api/index'
// import { addTimeDivider } from '../utils/index'

import { state, mutations } from './store'

const { messagesList } = toRefs(state)
const { updateMessagesList } = mutations

import { sendMsg } from '../api/index'

// const JSONbig = require('json-bigint')

const list = ref([
  {
    name: '好友admin2',
    userId: 'admin2'
  },
  {
    name: '好友admin3',
    userId: 'admin3'
  }
])

let selectedItem = ref({
  userId: null,
  name: null
})

function chooseItem(item) {
  selectedItem.value = item
  getMessagesList()
}

const textValue = ref()

// const messagesList = ref([])
const messageViewRef = ref()

onMounted(() => {
  chooseItem(list.value[0])
  getMessagesList()
})

async function getMessagesList() {
  const res = await getMsgList(selectedItem.value.userId, 1)
  // const addTimeDividerRes = addTimeDivider(res.reverse())
  console.log('res', res)

  const result = res.reverse().map((_e) => ({
    txt: _e.message_elem_array[0]['text_elem_content'],
    sender: _e.message_sender === 'admin1', // 区分发送方是 自己还是好友
    id: String(_e.message_msg_id)
  }))
  updateMessagesList(result)
}

async function sendMessage() {
  const {
    data: { json_params: messageId }
  } = await sendMsg({
    convId: selectedItem.value.userId,
    convType: 1,
    messageElementArray: [{ elem_type: 0, text_elem_content: String(textValue.value) }],
    userId: 'admin1',
    callback: sendMsgSuccessCallback
  })
  console.log('messageId', messageId)

  // 消息内容为 textValue
  // 消息id为 messageId
  // 添加最新消息 到 末尾
  // @ts-ignore
  if (!messagesList.value.some((_e) => _e.id === messageId)) {
    // @ts-ignore
    updateMessagesList([
      ...messagesList.value,
      {
        txt: textValue.value,
        sender: true,
        id: String(messageId)
      }
    ])
    textValue.value = ''
  }
}

function sendMsgSuccessCallback([res, userData]) {
  console.log('95', res, userData)
  const { code, json_params, desc } = res
  console.log('78', code, json_params, desc)
  // var jsonParam = JSONbig.parse(json_params)
  // jsonParam['message_unique_id'] = jsonParam['message_unique_id'].toString()
  // if (code === 0) {
  //   console.log('jsonParam', jsonParam)
  // }
}

/**
 * 新消息移动到可视区域
 */
// @ts-ignore
watch(
  () => messagesList.value.length,
  async () => {
    await nextTick()
    if (messageViewRef.value) {
      messageViewRef.value.scrollTop = messageViewRef?.value?.scrollHeight || 0
    }
  },
  {
    immediate: true
  }
)
</script>

<template>
  <div class="wrap-content">
    <div class="list">
      <div
        v-for="item in list"
        :key="item.userId"
        class="list-item"
        :class="{ 'selected-item': selectedItem.userId === item.userId }"
        @click="chooseItem(item)"
      >
        {{ item.name }}
      </div>
    </div>
    <div class="message">
      <div ref="messageViewRef" class="message-content">
        <div
          v-for="item in messagesList"
          :key="item['id']"
          class="message-content-item"
          :class="{ 'right-msg': item['sender'] }"
        >
          <div class="message-content-item-msg">{{ item['txt'] }}</div>
        </div>
      </div>
      <div class="message-textarea">
        <a-textarea
          v-model:value="textValue"
          class="text-area"
          placeholder="回车发送消息"
          auto-size
          @press-enter="sendMessage"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.wrap-content {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  > .list {
    width: 20%;
    height: 100%;
    border: 1px solid #ccc;

    > .list-item {
      height: 60px;
      width: 100%;
      text-align: center;
      line-height: 60px;
      border: 1px solid #ccc;
      border-top: none;
      cursor: pointer;
    }

    .selected-item {
      font-weight: bold;
      font-size: 16px;
      background-color: #cdcdcd;
    }
  }

  .message {
    width: 80%;
    height: 100%;

    border: 1px solid #ccc;
    border-left: none;

    &-content {
      height: 70%;
      width: 100%;
      overflow: scroll;
      overflow-y: scroll;

      &-item {
        padding: 10px;
        margin: 20px 0;
        display: flex;
        justify-content: flex-start;

        &-msg {
          height: 50px;
          line-height: 50px;
          width: 100px;
          background-color: skyblue;
        }
      }
    }

    &-textarea {
      height: 30%;
      width: 100%;
      border-top: 1px solid #ccc;
      display: flex;
      justify-content: center;
      align-items: center;

      > :deep(.text-area) {
        height: 90% !important;
        width: 90%;
      }
    }
  }
}

.right-msg {
  justify-content: flex-end !important;
}
</style>
