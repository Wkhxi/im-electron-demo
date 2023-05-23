<!-- eslint-disable vue/multi-word-component-names -->

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
const $router = useRouter()

import timRenderInstance from './utils/timRenderInstance'

const formData = reactive({
  username: '',
  password: ''
})

const idToSig = {
  admin1:
    'eJwtzFELgjAUhuH-sltDzlmbDKGrrCuFKInsztqMk07GGhFF-z1TL7-ng-fDyvwQP41nKeMxsMW4SZs*UEMj19pSj-Pz0G3tHGmWogBQCLjE6TEvR94MLqXkADBpIPu3RAkUCZd8rtBtCPuG*siKU7Yu965SUJgLRFvbFe9d66ruuLnnKmTkz3Bdse8PR34xrA__',
  admin2:
    'eJwtzMEKgkAUheF3mXXIvTpjg9CmxbiwIkhcuNPuJJdJEzURonfP1OX5DvwfkZ5u3mg7EQnfA7FbNpNtBn7wwgXV3Pjb05Mr2pZJRCgBNAIGuD52armzsyulfABYdeD6b6GWGqUK9Vbhag6bc5a-ZG*yO2H*Nq5MjsWegtihu1ynOExqepbS6nSsDuL7A0aSMZI_'
}

async function onFinish(val) {
  console.log('onFinish', val)
  const { username: userID } = val

  const params = {
    userID,
    userSig: idToSig[userID]
  }
  const { code } = await timRenderInstance.TIMLogin(params)
  console.log('TIMLogin code', code)

  $router.push('/layout')
}
</script>

<template>
  <div class="wrap-box">
    <a-card title="登录" style="width: 300px">
      <a-form
        :model="formData"
        name="basic"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
        @finish="onFinish"
      >
        <a-form-item
          label="Username"
          name="username"
          :rules="[{ required: true, message: 'Please input your username!' }]"
        >
          <a-input v-model:value="formData.username" />
        </a-form-item>

        <a-form-item
          label="Password"
          name="password"
          :rules="[{ required: true, message: 'Please input your password!' }]"
        >
          <a-input-password v-model:value="formData.password" />
        </a-form-item>

        <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
          <a-button type="primary" html-type="submit">Submit</a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<style scoped>
.wrap-box {
  height: 100vh;
  width: 100vw;
  background-color: #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
