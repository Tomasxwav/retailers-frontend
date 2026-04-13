<script setup lang="ts">
import type { ModelItem } from '@/stores/models'
import { PencilSquareIcon, PhotoIcon, ArrowTopRightOnSquareIcon } from '@heroicons/vue/24/outline'

defineProps<{
  models: ModelItem[]
}>()

const emit = defineEmits<{
  (event: 'edit', model: ModelItem): void
}>()
</script>

<template>
  <div class="table-scroll min-h-0 flex-1 overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr style="border-bottom: 1px solid #f1f5f9; background: #f8fafc">
          <th
            class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
          >
            Modelo
          </th>
          <th
            class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
          >
            Descripción
          </th>
          <th
            class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
          >
            Imagen
          </th>
          <th
            class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
          >
            PDF
          </th>
          <th
            class="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-400"
          >
            Acciones
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="model in models"
          :key="String(model.id ?? model.name)"
          class="border-b border-slate-50 transition-colors duration-100 hover:bg-slate-50/80"
        >
          <td class="px-5 py-3.5">
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
                style="background: linear-gradient(135deg, #dc2626, #b91c1c)"
              >
                {{ model.name.slice(0, 2).toUpperCase() }}
              </div>
              <div>
                <p class="font-semibold text-slate-800">{{ model.name || 'Sin nombre' }}</p>
                <p class="text-xs text-slate-500">#{{ model.id ?? '—' }}</p>
              </div>
            </div>
          </td>

          <td class="px-5 py-3.5 text-slate-600">
            <p class="max-w-md truncate" :title="model.description">
              {{ model.description || '—' }}
            </p>
          </td>

          <td class="px-5 py-3.5">
            <a
              v-if="model.image"
              :href="model.image"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <PhotoIcon class="h-4 w-4" />
              Ver imagen
            </a>
            <span v-else class="text-slate-400">—</span>
          </td>

          <td class="px-5 py-3.5">
            <a
              v-if="model.pdf"
              :href="model.pdf"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
            >
              <ArrowTopRightOnSquareIcon class="h-3.5 w-3.5" />
              Abrir PDF
            </a>
            <span v-else class="text-slate-400">—</span>
          </td>

          <td class="px-5 py-3.5 text-right">
            <button
              class="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              @click="emit('edit', model)"
            >
              <PencilSquareIcon class="h-4 w-4" />
              Editar
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
