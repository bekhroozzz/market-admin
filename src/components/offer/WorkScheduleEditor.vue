<script setup lang="ts">
import { ref, watch } from 'vue'
import type { WorkScheduleDay } from '@/types/offer.ts'

const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const props = defineProps<{ modelValue: WorkScheduleDay[] }>()
const emit = defineEmits<{ (e: 'update:modelValue', val: WorkScheduleDay[]): void }>()

function buildDefault(): WorkScheduleDay[] {
  return DAY_NAMES.map((_, day) => ({
    day,
    openTime: '09:00',
    closeTime: '21:00',
    isClosed: day >= 5,
  }))
}

const schedule = ref<WorkScheduleDay[]>(
  props.modelValue.length === 7
    ? [...props.modelValue]
    : buildDefault(),
)

watch(() => props.modelValue, (val) => {
  if (val.length === 7) schedule.value = [...val]
})

function update() {
  emit('update:modelValue', schedule.value)
}
</script>

<template>
  <div class="space-y-2">
    <div
      v-for="entry in schedule"
      :key="entry.day"
      class="flex items-center gap-3 flex-wrap"
    >
      <span class="w-8 text-sm font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">
        {{ DAY_NAMES[entry.day] }}
      </span>

      <label class="flex items-center gap-1 cursor-pointer flex-shrink-0">
        <input
          type="checkbox"
          class="checkbox checkbox-sm checkbox-error"
          :checked="entry.isClosed"
          @change="entry.isClosed = ($event.target as HTMLInputElement).checked; update()"
        />
        <span class="text-xs text-gray-500">Выходной</span>
      </label>

      <template v-if="!entry.isClosed">
        <input
          type="time"
          class="input input-sm input-bordered w-28"
          :value="entry.openTime ?? ''"
          @change="entry.openTime = ($event.target as HTMLInputElement).value; update()"
        />
        <span class="text-xs text-gray-400">–</span>
        <input
          type="time"
          class="input input-sm input-bordered w-28"
          :value="entry.closeTime ?? ''"
          @change="entry.closeTime = ($event.target as HTMLInputElement).value; update()"
        />
      </template>
    </div>
  </div>
</template>
