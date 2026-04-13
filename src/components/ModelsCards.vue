<script setup lang="ts">
import type { ModelItem } from '@/stores/models'
import { PencilSquareIcon, ArrowTopRightOnSquareIcon } from '@heroicons/vue/24/outline'

defineProps<{
  models: ModelItem[]
}>()

const emit = defineEmits<{
  (event: 'edit', model: ModelItem): void
}>()
</script>

<template>
  <div class="grid grid-cols-1 gap-4 overflow-y-auto p-1 md:grid-cols-2 xl:grid-cols-3">
    <article
      v-for="model in models"
      :key="String(model.id ?? model.name)"
      class="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div class="relative h-44 overflow-hidden bg-slate-100">
        <img
          v-if="model.image && model.image.trim() !== ''"
          :src="model.image"
          :alt="model.name"
          class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div
          v-else
          class="flex h-full items-center justify-center text-sm font-medium text-slate-400"
        >
          Sin imagen
        </div>
      </div>

      <div class="flex flex-1 flex-col p-4">
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">
          ID {{ model.id ?? '—' }}
        </p>
        <h3 class="mt-1 text-lg font-bold text-slate-900" style="font-family: 'Syne', sans-serif">
          {{ model.name || 'Sin nombre' }}
        </h3>
        <p class="mt-2 line-clamp-2 text-sm text-slate-600">{{ model.description || '—' }}</p>

        <div class="mt-4 flex items-center gap-2">
          <a
            v-if="model.pdf"
            :href="model.pdf"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex h-9 items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 transition hover:bg-red-100"
          >
            <ArrowTopRightOnSquareIcon class="h-3.5 w-3.5" />
            PDF
          </a>

          <button
            class="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            @click="emit('edit', model)"
          >
            <PencilSquareIcon class="h-4 w-4" />
            Editar
          </button>
        </div>
      </div>
    </article>
  </div>
</template>
