<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { Client, ClientCardPayload, ClientUpdatePayload } from '@/stores/clients'
import { XMarkIcon } from '@heroicons/vue/24/outline'

type ActionType = 'update' | 'approve' | null

type FieldDefinition = {
  key: keyof ClientUpdatePayload
  label: string
  span?: 1 | 2
  disabled?: boolean
  type?: 'text' | 'select'
  options?: Array<{ label: string; value: string }>
}

type SectionDefinition = {
  title: string
  description: string
  fields: FieldDefinition[]
}

const props = defineProps<{
  modelValue: boolean
  client: Client | null
  clientVin: string
  loadingAction: ActionType
  error: string | null
}>()

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'update', payload: { vin: string; data: ClientUpdatePayload }): void
  (
    event: 'approve',
    payload: { vin: string; data: ClientUpdatePayload; card: ClientCardPayload },
  ): void
}>()

const form = reactive<ClientUpdatePayload>({
  vin: '',
  invoice: '',
  full_name: '',
  email: '',
  phone_number: '',
  birthday: '',
  street: '',
  exterior_number: '',
  interior_number: '',
  neighborhood: '',
  city: '',
  state: '',
  zip: '',
  status: '',
  year: '',
  model: '',
  retailer: '',
})

function resetForm(client: Client | null) {
  form.vin = String(client?.vin ?? client?.vcNIV ?? props.clientVin ?? '')
  form.invoice = String(client?.invoice ?? client?.folio ?? '')
  form.full_name = String(
    client?.full_name ?? client?.name ?? client?.nombre ?? client?.firstName ?? '',
  )
  form.email = String(client?.email ?? client?.correo ?? '')
  form.phone_number = String(client?.phone_number ?? client?.telefono ?? client?.phone ?? '')
  form.birthday = String(client?.birthday ?? client?.birthdate ?? '')
  form.street = String(client?.street ?? client?.address ?? '')
  form.exterior_number = String(client?.exterior_number ?? '')
  form.interior_number = String(client?.interior_number ?? '')
  form.neighborhood = String(client?.neighborhood ?? '')
  form.city = String(client?.city ?? '')
  form.state = String(client?.state ?? '')
  form.zip = String(client?.zip ?? '')
  form.status = String(client?.status ?? '')
  form.year = String(client?.year ?? '')
  form.model = String(client?.model ?? '')
  form.retailer = String(client?.retailer ?? client?.concessionaire ?? '')
}

watch(
  () => props.client,
  (client) => {
    if (props.modelValue) resetForm(client)
  },
  { immediate: true },
)

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) resetForm(props.client)
  },
)

function buildPayload(): ClientUpdatePayload {
  return {
    vin: form.vin,
    invoice: form.invoice,
    full_name: form.full_name,
    email: form.email,
    phone_number: form.phone_number,
    birthday: form.birthday,
    street: form.street,
    exterior_number: form.exterior_number,
    interior_number: form.interior_number,
    neighborhood: form.neighborhood,
    city: form.city,
    state: form.state,
    zip: form.zip,
    status: form.status,
    year: form.year,
    model: form.model,
    retailer: form.retailer,
  }
}

function buildCardPayload(payload: ClientUpdatePayload): ClientCardPayload {
  return {
    vcNIV: payload.vin,
    phone_number: payload.phone_number,
    telefono: payload.phone_number,
    nombre: payload.full_name,
    correo: payload.email,
  }
}

function emitUpdate() {
  const payload = buildPayload()
  emit('update', {
    vin: props.clientVin,
    data: payload,
  })
}

function emitApprove() {
  const payload = buildPayload()
  emit('approve', {
    vin: props.clientVin,
    data: payload,
    card: buildCardPayload(payload),
  })
}

const sections: SectionDefinition[] = [
  {
    title: 'Identificación',
    description: 'Datos base para localizar y actualizar el registro.',
    fields: [
      { key: 'vin', label: 'VIN', disabled: true },
      { key: 'invoice', label: 'Factura' },
      { key: 'full_name', label: 'Nombre completo', span: 2 },
      {
        key: 'status',
        label: 'Estado',
        type: 'select',
        options: [
          { label: 'Aprobado', value: 'approved' },
          { label: 'Pendiente', value: 'pending' },
          { label: 'Rechazado', value: 'rejected' },
        ],
      },
    ],
  },
  {
    title: 'Contacto y domicilio',
    description: 'Información de contacto y dirección del cliente.',
    fields: [
      { key: 'email', label: 'Email', span: 2 },
      { key: 'phone_number', label: 'Teléfono' },
      { key: 'birthday', label: 'Cumpleaños' },
      { key: 'street', label: 'Calle', span: 2 },
      { key: 'exterior_number', label: 'Número exterior' },
      { key: 'interior_number', label: 'Número interior' },
      { key: 'neighborhood', label: 'Colonia' },
      { key: 'city', label: 'Ciudad' },
      { key: 'state', label: 'Estado' },
      { key: 'zip', label: 'C.P.' },
    ],
  },
  {
    title: 'Vehículo y distribuidor',
    description: 'Campos que describen el vehículo y la plaza asociada.',
    fields: [
      { key: 'year', label: 'Año' },
      { key: 'model', label: 'Modelo', span: 2 },
      { key: 'retailer', label: 'Retailer', span: 2 },
    ],
  },
] as const
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
        <button
          class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm cursor-pointer"
          aria-label="Cerrar modal"
          @click="emit('close')"
        />

        <section
          class="relative z-10 flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl"
        >
          <header class="flex items-start justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Información del cliente
              </p>
              <h3 class="mt-2 text-2xl font-bold text-slate-900">
                {{ form.full_name || 'Cliente' }}
              </h3>
              <p class="mt-1 text-sm text-slate-500">
                Edita los datos y guarda con una actualización o aprobando la tarjeta.
              </p>
            </div>

            <button
              class="flex h-9 w-9 items-center cursor-pointer justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
              @click="emit('close')"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </header>

          <div class="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <div class="grid gap-4 lg:grid-cols-3">
              <section
                v-for="section in sections"
                :key="section.title"
                class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
              >
                <div class="mb-4">
                  <h4 class="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {{ section.title }}
                  </h4>
                  <p class="mt-1 text-xs leading-5 text-slate-400">
                    {{ section.description }}
                  </p>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <label
                    v-for="field in section.fields"
                    :key="field.key"
                    class="flex flex-col gap-1.5"
                    :class="field.span === 2 ? 'col-span-2' : 'col-span-1'"
                  >
                    <span class="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {{ field.label }}
                    </span>
                    <input
                      v-if="field.type !== 'select'"
                      v-model="form[field.key]"
                      :disabled="field.disabled === true"
                      :class="[
                        'h-11 rounded-xl border px-3 text-sm outline-none transition focus:ring-2 focus:ring-red-100 cursor-pointer',
                        field.disabled
                          ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500'
                          : 'border-slate-200 bg-white text-slate-700 focus:border-red-300',
                      ]"
                      type="text"
                    />
                    <select
                      v-else-if="field.type === 'select'"
                      v-model="form[field.key]"
                      :disabled="field.disabled === true"
                      :class="[
                        'h-11 rounded-xl border px-3 text-sm outline-none transition focus:ring-2 focus:ring-red-100 cursor-pointer',
                        field.disabled
                          ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500'
                          : 'border-slate-200 bg-white text-slate-700 focus:border-red-300',
                      ]"
                    >
                      <option value="">Seleccionar...</option>
                      <option v-for="opt in field.options" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </option>
                    </select>
                  </label>
                </div>
              </section>
            </div>

            <div
              v-if="error"
              class="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {{ error }}
            </div>
          </div>

          <footer
            class="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="text-xs text-slate-400">
              VIN de actualización:
              <strong class="text-slate-600">{{ clientVin || '—' }}</strong>
            </div>

            <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                class="h-11 rounded-xl border cursor-pointer border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="loadingAction !== null"
                @click="emit('close')"
              >
                Cancelar
              </button>

              <button
                class="h-11 rounded-xl border cursor-pointer border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="loadingAction !== null || !clientVin"
                @click="emitUpdate"
              >
                {{ loadingAction === 'update' ? 'Actualizando...' : 'Actualizar' }}
              </button>

              <button
                class="h-11 rounded-xl bg-slate-900 cursor-pointer px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="loadingAction !== null || !clientVin"
                @click="emitApprove"
              >
                {{ loadingAction === 'approve' ? 'Guardando...' : 'Aprobar y guardar tarjeta' }}
              </button>
            </div>
          </footer>
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
