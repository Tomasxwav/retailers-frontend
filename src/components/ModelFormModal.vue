<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { ModelItem, ModelPayload } from '@/stores/models'
import { modelFormSchema } from '@/schemas/model'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  modelValue: boolean
  isEdit: boolean
  model: ModelItem | null
  loading: boolean
  error: string | null
}>()

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'submit', payload: { id?: number | string; data: ModelPayload }): void
}>()

const form = reactive<ModelPayload>({
  name: '',
  description: '',
  image: '',
  pdf: '',
})

type ModelField = keyof ModelPayload
type ModelFormErrors = Partial<Record<ModelField, string>>

const fieldErrors = reactive<ModelFormErrors>({})

function clearAllFieldErrors() {
  for (const key of Object.keys(fieldErrors) as ModelField[]) {
    delete fieldErrors[key]
  }
}

function clearFieldError(field: ModelField) {
  delete fieldErrors[field]
}

function validateForm(): ModelPayload | null {
  clearAllFieldErrors()

  const payload: ModelPayload = {
    name: form.name.trim(),
    description: form.description.trim(),
    image: form.image.trim(),
    pdf: form.pdf.trim(),
  }

  const parsed = modelFormSchema.safeParse(payload)
  if (parsed.success) return parsed.data

  for (const issue of parsed.error.issues) {
    const field = issue.path[0] as ModelField | undefined
    if (!field || fieldErrors[field]) continue
    fieldErrors[field] = issue.message
  }

  return null
}

function resetForm(model: ModelItem | null) {
  form.name = String(model?.name ?? '')
  form.description = String(model?.description ?? '')
  form.image = String(model?.image ?? '')
  form.pdf = String(model?.pdf ?? '')
}

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      resetForm(props.model)
      clearAllFieldErrors()
    }
  },
)

watch(
  () => props.model,
  (model) => {
    if (props.modelValue) resetForm(model)
  },
)

function submit() {
  const validData = validateForm()
  if (!validData) return

  emit('submit', {
    id: props.model?.id,
    data: validData,
  })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
        <button
          class="absolute inset-0 bg-slate-950/60"
          aria-label="Cerrar modal"
          @click="emit('close')"
        />

        <section
          class="relative z-10 flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
        >
          <header class="flex items-start justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Modelos
              </p>
              <h3 class="mt-2 text-2xl font-bold text-slate-900">
                {{ isEdit ? 'Editar modelo' : 'Añadir modelo' }}
              </h3>
              <p class="mt-1 text-sm text-slate-500">
                {{
                  isEdit
                    ? 'Actualiza la información del modelo seleccionado.'
                    : 'Completa los datos para registrar un nuevo modelo.'
                }}
              </p>
            </div>

            <button
              class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
              @click="emit('close')"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </header>

          <form class="grid gap-4 p-6 md:grid-cols-2" @submit.prevent="submit">
            <label class="flex flex-col gap-1.5 md:col-span-2">
              <span class="text-xs font-medium uppercase tracking-wide text-slate-500">Nombre</span>
              <input
                v-model="form.name"
                class="h-11 rounded-xl border bg-white px-3 text-sm text-slate-700 outline-none transition focus:ring-2"
                :class="
                  fieldErrors.name
                    ? 'border-red-300 focus:border-red-300 focus:ring-red-100'
                    : 'border-slate-200 focus:border-red-300 focus:ring-red-100'
                "
                type="text"
                placeholder="Ej: RTR 200 4V"
                @input="clearFieldError('name')"
              />
              <span v-if="fieldErrors.name" class="text-xs text-red-600">{{
                fieldErrors.name
              }}</span>
            </label>

            <label class="flex flex-col gap-1.5 md:col-span-2">
              <span class="text-xs font-medium uppercase tracking-wide text-slate-500">
                Descripción
              </span>
              <input
                v-model="form.description"
                class="h-11 rounded-xl border bg-white px-3 text-sm text-slate-700 outline-none transition focus:ring-2"
                :class="
                  fieldErrors.description
                    ? 'border-red-300 focus:border-red-300 focus:ring-red-100'
                    : 'border-slate-200 focus:border-red-300 focus:ring-red-100'
                "
                type="text"
                placeholder="Ej: 500 KM o 30 días"
                @input="clearFieldError('description')"
              />
              <span v-if="fieldErrors.description" class="text-xs text-red-600">{{
                fieldErrors.description
              }}</span>
            </label>

            <label class="flex flex-col gap-1.5 md:col-span-2">
              <span class="text-xs font-medium uppercase tracking-wide text-slate-500">
                URL de imagen
              </span>
              <input
                v-model="form.image"
                class="h-11 rounded-xl border bg-white px-3 text-sm text-slate-700 outline-none transition focus:ring-2"
                :class="
                  fieldErrors.image
                    ? 'border-red-300 focus:border-red-300 focus:ring-red-100'
                    : 'border-slate-200 focus:border-red-300 focus:ring-red-100'
                "
                type="url"
                placeholder="https://..."
                @input="clearFieldError('image')"
              />
              <span v-if="fieldErrors.image" class="text-xs text-red-600">{{
                fieldErrors.image
              }}</span>
            </label>

            <label class="flex flex-col gap-1.5 md:col-span-2">
              <span class="text-xs font-medium uppercase tracking-wide text-slate-500"
                >URL PDF</span
              >
              <input
                v-model="form.pdf"
                class="h-11 rounded-xl border bg-white px-3 text-sm text-slate-700 outline-none transition focus:ring-2"
                :class="
                  fieldErrors.pdf
                    ? 'border-red-300 focus:border-red-300 focus:ring-red-100'
                    : 'border-slate-200 focus:border-red-300 focus:ring-red-100'
                "
                type="url"
                placeholder="https://..."
                @input="clearFieldError('pdf')"
              />
              <span v-if="fieldErrors.pdf" class="text-xs text-red-600">{{ fieldErrors.pdf }}</span>
            </label>

            <div
              v-if="error"
              class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 md:col-span-2"
            >
              {{ error }}
            </div>

            <footer class="flex justify-end gap-2 md:col-span-2">
              <button
                type="button"
                class="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="loading"
                @click="emit('close')"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="h-11 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="loading"
              >
                {{ loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear modelo' }}
              </button>
            </footer>
          </form>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
