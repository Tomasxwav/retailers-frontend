<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useModelsStore, type ModelItem, type ModelPayload } from '@/stores/models'
import ModelsTable from '@/components/ModelsTable.vue'
import ModelsCards from '@/components/ModelsCards.vue'
import ModelFormModal from '@/components/ModelFormModal.vue'
import {
  Squares2X2Icon,
  TableCellsIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  CubeIcon,
} from '@heroicons/vue/24/outline'

const store = useModelsStore()

const viewMode = ref<'table' | 'cards'>('table')
const isModalOpen = ref(false)
const isEdit = ref(false)
const selectedModel = ref<ModelItem | null>(null)
const modalError = ref<string | null>(null)

const titleDescription = computed(() => {
  return `${store.models.length} modelos disponibles`
})

onMounted(async () => {
  await store.fetchModels()
})

function openCreateModal() {
  isEdit.value = false
  selectedModel.value = null
  modalError.value = null
  isModalOpen.value = true
}

function openEditModal(model: ModelItem) {
  isEdit.value = true
  selectedModel.value = model
  modalError.value = null
  isModalOpen.value = true
}

function closeModal() {
  if (store.isSaving) return
  isModalOpen.value = false
  selectedModel.value = null
  modalError.value = null
}

async function handleSubmit(payload: { id?: number | string; data: ModelPayload }) {
  modalError.value = null
  try {
    if (isEdit.value) {
      if (payload.id === undefined || payload.id === null || payload.id === '') {
        modalError.value = 'El modelo no tiene un id válido para editar'
        return
      }
      await store.updateModel(payload.id, payload.data)
    } else {
      await store.createModel(payload.data)
    }

    await store.fetchModels()
    closeModal()
  } catch (error) {
    modalError.value = error instanceof Error ? error.message : 'No se pudo guardar el modelo'
  }
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-4 overflow-hidden px-4 py-4 lg:px-6 lg:py-6">
    <div class="flex flex-wrap items-start justify-between gap-3 animate-fade-in-up">
      <div>
        <h2 class="text-xl font-bold text-slate-900" style="font-family: 'Syne', sans-serif">
          Catálogo de Modelos
        </h2>
        <p class="mt-0.5 text-sm text-slate-500">{{ titleDescription }}</p>
      </div>

      <div class="flex items-center gap-2">
        <div class="flex items-center rounded-xl border border-slate-200 bg-white p-1">
          <button
            class="inline-flex h-9 items-center gap-1 rounded-lg px-3 text-xs font-semibold transition"
            :class="
              viewMode === 'table' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
            "
            @click="viewMode = 'table'"
          >
            <TableCellsIcon class="h-4 w-4" />
            Tabla
          </button>
          <button
            class="inline-flex h-9 items-center gap-1 rounded-lg px-3 text-xs font-semibold transition"
            :class="
              viewMode === 'cards' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
            "
            @click="viewMode = 'cards'"
          >
            <Squares2X2Icon class="h-4 w-4" />
            Cards
          </button>
        </div>

        <button
          class="inline-flex h-10 items-center gap-1 rounded-xl bg-red-600 px-3.5 text-sm font-semibold text-white transition hover:bg-red-700"
          @click="openCreateModal"
        >
          <PlusIcon class="h-4 w-4" />
          Añadir
        </button>
      </div>
    </div>

    <div
      class="animate-fade-in-up delay-100 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div v-if="store.isLoading" class="space-y-3 p-4">
        <div v-for="i in 6" :key="i" class="flex gap-4">
          <div class="skeleton h-4 w-48" />
          <div class="skeleton h-4 w-36" />
          <div class="skeleton h-4 w-28" />
          <div class="skeleton h-4 w-20" />
        </div>
      </div>

      <div
        v-else-if="store.error"
        class="flex flex-1 flex-col items-center justify-center gap-3 p-12 text-center"
      >
        <ExclamationTriangleIcon class="h-10 w-10 text-red-400" />
        <p class="font-medium text-slate-700">{{ store.error }}</p>
        <button
          class="mt-1 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50"
          @click="store.fetchModels()"
        >
          Reintentar
        </button>
      </div>

      <div
        v-else-if="store.models.length === 0"
        class="flex flex-1 flex-col items-center justify-center gap-3 p-12 text-center"
      >
        <CubeIcon class="h-10 w-10 text-slate-300" />
        <p class="font-medium text-slate-500">No hay modelos registrados</p>
        <button
          class="text-sm text-red-600 underline underline-offset-2 transition-colors hover:text-red-700"
          @click="openCreateModal"
        >
          Crear el primer modelo
        </button>
      </div>

      <ModelsTable v-else-if="viewMode === 'table'" :models="store.models" @edit="openEditModal" />
      <ModelsCards v-else :models="store.models" @edit="openEditModal" />
    </div>

    <ModelFormModal
      v-model="isModalOpen"
      :is-edit="isEdit"
      :model="selectedModel"
      :loading="store.isSaving"
      :error="modalError"
      @close="closeModal"
      @submit="handleSubmit"
    />
  </div>
</template>
