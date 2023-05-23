<!-- eslint-disable vue/multi-word-component-names -->

<script lang="ts">
import { UserOutlined, MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue'
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  createGroup,
  sendMsg,
  joinGroup,
  quitGroup,
  getJoinGroupList,
  getGroupMemberList
} from './api/index'

export default defineComponent({
  components: {
    UserOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined
  },
  setup() {
    const $router = useRouter()
    const logout = () => {
      $router.push('/login')
    }

    const handleCreateGroup = async () => {
      console.log('create')
      const params = {
        groupName: 'test1',
        groupType: '4',
        joinGroupMode: '2',
        groupMember: '',
        groupAnnouncement: '创建一个AVChatRoom'
      }
      const res = await createGroup(params)
      const curGroupId = res.create_group_result_groupid
      console.log('curGroupId', curGroupId, res)

      // 发送消息，创建一个群会话
      // await sendMsg({
      //   convId: curGroupId,
      //   convType: 2,
      //   messageElementArray: [
      //     {
      //       elem_type: 3,
      //       custom_elem_data: JSON.stringify({
      //         businessID: 'group_create',
      //         content: '创建群组',
      //         opUser: 'admin1',
      //         version: 4
      //       })
      //     }
      //   ],
      //   userId: 'admin1'
      // })
    }

    const handleJoinGroup = async () => {
      const res = await joinGroup({
        groupId: '@TGS#aCP7SNWMA'
      })

      console.log('handleJoinGroup', res)
    }

    const handleQuitGroup = async () => {
      const res = await quitGroup('@TGS#aCP7SNWMA')
      console.log('handleQuitGroup', res)
    }

    const handleGetJoinGroupList = async () => {
      const res = await getJoinGroupList()

      console.log('handleGetJoinGroupList', res)
    }

    const handleGetGroupMemberList = async () => {
      const res = await getGroupMemberList({
        groupId: '@TGS#aCP7SNWMA',
        nextSeq: 0
      })
      console.log('handleGetGroupMemberList', res)
    }

    const handleSendGroupMsg = async () => {
      const res = await sendMsg({
        convId: '@TGS#aCP7SNWMA',
        convType: 2,
        messageElementArray: [{ elem_type: 0, text_elem_content: 'AVChatRoom msg' }],
        userId: 'admin1',
        callback: () => {}
      })
      console.log('handleSendGroupMsg', res)
    }

    return {
      selectedKeys: ref(['1']),
      collapsed: ref(false),
      logout,
      handleCreateGroup,
      handleJoinGroup,
      handleGetJoinGroupList,
      handleGetGroupMemberList,
      handleSendGroupMsg,
      handleQuitGroup
    }
  }
})
</script>

<template>
  <a-layout id="components-layout-demo-custom-trigger" class="wrap-box">
    <a-layout-sider v-model:collapsed="collapsed" :trigger="null" collapsible>
      <div class="logo" />
      <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
        <a-menu-item key="1">
          <user-outlined />
          <span>用户1</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0">
        <menu-unfold-outlined
          v-if="collapsed"
          class="trigger"
          @click="() => (collapsed = !collapsed)"
        />
        <menu-fold-outlined v-else class="trigger" @click="() => (collapsed = !collapsed)" />

        <div class="logout">
          <a-button @click="logout">logout</a-button>
        </div>

        <div class="logout" style="margin-right: 20px">
          <a-button @click="handleCreateGroup">createGroup</a-button>
        </div>
        <div class="logout" style="margin-right: 20px">
          <a-button @click="handleJoinGroup">joinGroup</a-button>
        </div>
        <div class="logout" style="margin-right: 20px">
          <a-button @click="handleGetJoinGroupList">getJoinGroupList</a-button>
        </div>
        <div class="logout" style="margin-right: 20px">
          <a-button @click="handleGetGroupMemberList">getGroupMemberList</a-button>
        </div>
        <div class="logout" style="margin-right: 20px">
          <a-button @click="handleSendGroupMsg">sendGroupMsg</a-button>
        </div>
        <div class="logout" style="margin-right: 20px">
          <a-button @click="handleQuitGroup">quitGroup</a-button>
        </div>
      </a-layout-header>
      <a-layout-content
        :style="{ margin: '24px 16px', padding: '24px', background: '#fff', minHeight: '280px' }"
      >
        <router-view></router-view>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<style scoped lang="scss">
#components-layout-demo-custom-trigger .trigger {
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}

#components-layout-demo-custom-trigger .trigger:hover {
  color: #1890ff;
}

#components-layout-demo-custom-trigger .logo {
  height: 32px;
  background: rgba(255, 255, 255, 0.3);
  margin: 16px;
}

.site-layout .site-layout-background {
  background: #fff;
}

.wrap-box {
  height: 100vh;
  width: 100vw;
}

.logout {
  float: right;
}
</style>
