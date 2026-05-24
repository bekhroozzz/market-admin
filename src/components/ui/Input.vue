<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import {useField} from 'vee-validate';
import { toRef } from 'vue'
import { formatPrice } from '@/utils'

interface Props {
  name: string
  placeholder?: string
  size?: 'xs' |'sm' | 'md' | 'lg' | 'xl'
  inputType?: 'email' | 'password' | 'tel' | 'text' | 'number' | 'price'
  type?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' |'link' | 'info' | 'neutral' | 'accent'
  leftIcon?: string
  rightIcon?: string
  iconSize?: string
}

const props = withDefaults(defineProps<Props>(),{
  inputType: 'text',
  size: 'md',
  type: 'primary'
})

const name = toRef(props, 'name')
const emit = defineEmits(['input', 'focus', 'blur', 'iconClick'])

const {
  value: inputValue,
  errorMessage,
  handleBlur,
  handleChange,
} = useField(name, undefined, {
  syncVModel: true,
})

function onBlur(event: Event) {
  handleBlur(event)
  emit('blur')
}

function onInput(event: Event) {
  handleChange(event)
  if (props.inputType === 'price')
   inputValue.value = formatPrice(inputValue.value as string)

  emit('input', event)
}
</script>

<template>
  <div class="flex w-full flex-col gap-1">
    <div class="flex items-center relative">
      <span v-if="leftIcon" @click="$emit('iconClick')" class="absolute z-30 text-gray-500 -translate-y-1/2 cursor-pointer right-4 top-1/2 dark:text-gray-400">
        <Icon :name="leftIcon" :size="iconSize"/>
      </span>
      <input
        v-model="inputValue"
        :type="inputType"
        :name="name"
        :placeholder="placeholder"
        class="input w-full focus:outline-none focus:bg-base-200"
        :class="[
            {'input-xs': size === 'xs'},
            {'input-sm': size === 'sm'},
            {'input-md': size === 'md'},
            {'input-lg': size === 'lg'},
            {'input-xl': size === 'xl'},
            {'input-primary': type === 'primary'},
            {'input-secondary': type === 'secondary'},
            {'input-success': type === 'success'},
            {'input-error': type === 'error'},
            {'input-info': type === 'info'},
            {'input-neutral': type === 'neutral'},
            {'input-accent': type === 'accent'},
            errorMessage &&  '!input-error'
        ]"
        @focus="$emit('focus')"
        @blur="onBlur"
        @input="onInput"
      />
      <span v-if="rightIcon" @click="$emit('iconClick')" class="absolute z-30 text-gray-500 -translate-y-1/2 cursor-pointer right-4 top-1/2 dark:text-gray-400">
        <Icon :name="rightIcon" :size="iconSize"/>
      </span>
    </div>
    <p v-if="errorMessage" class="text-m  text-error">
      {{ errorMessage }}
    </p>
  </div>
</template>

<style scoped>
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
