<script setup>
import { onMounted } from 'vue'
import { initSdk } from './utils/imSdk'

onMounted(() => {
  initSdk()
})
</script>

<template>
  <router-view></router-view>
</template>

<style scoped></style>
