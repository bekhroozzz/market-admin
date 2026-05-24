<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  tabs: Tab[]
  activeTab?: Tab
}
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:activeTab', tab: Tab): void
}>()


interface Tab {
label: string;
val: string
}

const activeTab = ref(props.activeTab || props.tabs[0])

function setActiveTab(tab: Tab) {
  activeTab.value = tab
  emit('update:activeTab', tab)
}
</script>

<template>
  <div role="tablist" class="tabs tabs-border">
    <a
        v-for="tab in tabs"
        :key="tab.val"
        role="tab"
        class="tab transition duration-300 hover:text-primary"
        :class="{ 'text-primary tab-active': tab.val === activeTab.val }"
        :aria-selected="tab.val === activeTab.val"
        @click="setActiveTab(tab)"
    >
      {{ tab.label }}
    </a>
  </div>
</template>
