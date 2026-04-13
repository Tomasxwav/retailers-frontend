import { ref } from 'vue'
import { defineStore } from 'pinia'
import { apiFetch } from '@/services/api'

export interface ModelItem {
  id?: number | string
  name: string
  description: string
  image: string
  pdf: string
}

export interface ModelPayload {
  name: string
  description: string
  image: string
  pdf: string
}

function normalizeModel(input: Partial<ModelItem>): ModelItem {
  return {
    id: input.id,
    name: String(input.name ?? ''),
    description: String(input.description ?? ''),
    image: String(input.image ?? ''),
    pdf: String(input.pdf ?? ''),
  }
}

export const useModelsStore = defineStore('models', () => {
  const models = ref<ModelItem[]>([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)

  async function fetchModels() {
    isLoading.value = true
    error.value = null
    try {
      const response = await apiFetch<ModelItem[] | { models: ModelItem[] }>('/models')
      const collection = Array.isArray(response) ? response : (response.models ?? [])
      models.value = collection.map((model) => normalizeModel(model))
    } catch {
      error.value = 'No se pudieron cargar los modelos'
    } finally {
      isLoading.value = false
    }
  }

  async function createModel(payload: ModelPayload) {
    isSaving.value = true
    try {
      await apiFetch<ModelItem>('/models', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    } finally {
      isSaving.value = false
    }
  }

  async function updateModel(id: number | string, payload: ModelPayload) {
    isSaving.value = true
    try {
      await apiFetch<ModelItem>(`/models/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
    } finally {
      isSaving.value = false
    }
  }

  return {
    models,
    isLoading,
    isSaving,
    error,
    fetchModels,
    createModel,
    updateModel,
  }
})
