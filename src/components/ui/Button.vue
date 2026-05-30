<script setup lang="ts">
import { computed, resolveComponent } from 'vue'
import { RouterLink } from 'vue-router'

interface Props {
  size?: 'xs' |'sm' | 'md' | 'lg' | 'xl'
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' |'link' | 'info' | 'neutral' | 'accent'
  isActive?: boolean
  isOutline?: boolean
  isLoading?: boolean
  iconName?: string
  iconSize?: string
  to?: string
}

const props = withDefaults(defineProps<Props>(),{
  variant: 'primary',
  size: 'md'
})

const isLink = computed(() => {
  if (props.to)
    return resolveComponent('RouterLink')
  else return 'button'
})
</script>

<template>
  <component
      :is="isLink"
      :to="to"
      class="btn flex items-center justify-center"
      :class="[
          {'btn-xs': size === 'xs'},
          {'btn-sm': size === 'sm'},
          {'btn-md': size === 'md'},
          {'btn-lg': size === 'lg'},
          {'btn-xl': size === 'xl'},
          {'btn-primary': variant === 'primary'},
          {'btn-secondary': variant === 'secondary'},
          {'btn-success': variant === 'success'},
          {'btn-warning': variant === 'warning'},
          {'btn-error': variant === 'error'},
          {'btn-link': variant === 'link'},
          {'btn-info': variant === 'info'},
          {'btn-neutral': variant === 'neutral'},
          {'btn-accent': variant === 'accent'},
          {'btn-active': isActive},
          {'btn-outline': isOutline}
         ]">
    <span
        class="absolute self-center"
        :class="[
          {'loading opacity-100 loading-spinner' : isLoading },
         {'opacity-0  pointer-events-none': !isLoading},
         `text-${variant}`
         ]"
    />
    <div class="flex items-center gap-1" :class="{'opacity-0': isLoading }">
      <Icon v-if="iconName" :name="iconName" :size="iconSize"/>
      <slot />
    </div>
  </component>
</template>
