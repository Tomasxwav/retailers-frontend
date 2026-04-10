<script setup lang="ts">
import { onMounted, onBeforeUnmount, computed, nextTick, ref, watch } from 'vue'
import { useClientsStore, getClientName } from '@/stores/clients'
import type { StatusFilter } from '@/stores/clients'
import {
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'

const store = useClientsStore()

const pageRoot = ref<HTMLElement | null>(null)
const headerSection = ref<HTMLElement | null>(null)
const cardsSection = ref<HTMLElement | null>(null)
const tableCardHeight = ref(420)

const BASE_ROW_HEIGHT = 57
const TABLE_HEAD_AND_FOOT = 104
const MIN_TABLE_HEIGHT = 260

function updateViewportFit() {
  if (!pageRoot.value) return

  const rootHeight = pageRoot.value.clientHeight
  const usedHeight =
    (headerSection.value?.offsetHeight ?? 0) + (cardsSection.value?.offsetHeight ?? 0) + 20
  const nextCardHeight = Math.max(MIN_TABLE_HEIGHT, rootHeight - usedHeight)

  tableCardHeight.value = nextCardHeight

  const rowsArea = nextCardHeight - TABLE_HEAD_AND_FOOT
  const computedRows = Math.max(4, Math.floor(rowsArea / BASE_ROW_HEIGHT))
  store.setPageSize(computedRows)
}

onMounted(async () => {
  await store.fetchClients()
  await nextTick()
  updateViewportFit()
  window.addEventListener('resize', updateViewportFit)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateViewportFit)
})

watch(
  () => [store.activeFilter, store.filteredClients.length],
  async () => {
    await nextTick()
    updateViewportFit()
  },
)

const statusCards = computed(() => [
  {
    key: 'all' as StatusFilter,
    label: 'Todos',
    count: store.counts.all,
    icon: UsersIcon,
    activeStyle: 'border-slate-800 bg-slate-800 text-white',
    inactiveStyle: 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
    dot: '',
  },
  {
    key: 'approved' as StatusFilter,
    label: 'Aprobados',
    count: store.counts.approved,
    icon: CheckCircleIcon,
    activeStyle: 'border-emerald-600 bg-emerald-600 text-white',
    inactiveStyle: 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300',
    dot: 'bg-emerald-500',
  },
  {
    key: 'pending' as StatusFilter,
    label: 'Pendientes',
    count: store.counts.pending,
    icon: ClockIcon,
    activeStyle: 'border-amber-500 bg-amber-500 text-white',
    inactiveStyle: 'border-slate-200 bg-white text-slate-700 hover:border-amber-300',
    dot: 'bg-amber-400',
  },
  {
    key: 'rejected' as StatusFilter,
    label: 'Rechazados',
    count: store.counts.rejected,
    icon: XCircleIcon,
    activeStyle: 'border-red-600 bg-red-600 text-white',
    inactiveStyle: 'border-slate-200 bg-white text-slate-700 hover:border-red-300',
    dot: 'bg-red-500',
  },
])

const statusBadge: Record<string, string> = {
  approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
}

const statusLabel: Record<string, string> = {
  approved: 'Aprobado',
  pending: 'Pendiente',
  rejected: 'Rechazado',
}

function formatDate(val?: string): string {
  if (!val) return '—'
  const d = new Date(val)
  if (isNaN(d.getTime())) return val
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

const pageNumbers = computed(() => {
  const total = store.totalPages
  const current = store.currentPage
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '…')[] = [1]
  if (current > 3) pages.push('…')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
  if (current < total - 2) pages.push('…')
  pages.push(total)
  return pages
})
</script>

<template>
  <div
    ref="pageRoot"
    class="flex h-full min-h-0 flex-col gap-4 overflow-hidden px-4 py-4 lg:px-6 lg:py-6"
  >
    <!-- ── Header ── -->
    <div ref="headerSection" class="flex items-center justify-between animate-fade-in-up">
      <div>
        <h2 class="text-xl font-bold text-slate-900" style="font-family: 'Syne', sans-serif">
          Solicitudes de Clientes
        </h2>
        <p class="mt-0.5 text-sm text-slate-500">{{ store.counts.all }} registros en total</p>
      </div>
      <div class="flex items-center gap-2 text-xs text-slate-400">
        <FunnelIcon class="h-4 w-4" />
        <span
          >Filtrado por:
          <strong class="text-slate-600">{{
            statusLabel[store.activeFilter] ?? 'Todos'
          }}</strong></span
        >
      </div>
    </div>

    <!-- ── Status cards ── -->
    <div
      ref="cardsSection"
      class="grid grid-cols-2 gap-3 sm:grid-cols-4 animate-fade-in-up delay-100"
    >
      <button
        v-for="card in statusCards"
        :key="card.key"
        class="group relative flex flex-col gap-2 rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
        :class="store.activeFilter === card.key ? card.activeStyle : card.inactiveStyle"
        @click="store.setFilter(card.key)"
      >
        <!-- Count -->
        <span
          class="text-2xl font-bold leading-none tracking-tight"
          style="font-family: 'Syne', sans-serif"
          :class="store.activeFilter === card.key ? 'text-inherit' : 'text-slate-900'"
        >
          {{ card.count }}
        </span>

        <!-- Label row -->
        <div class="flex items-center gap-1.5">
          <span
            v-if="card.dot"
            class="h-2 w-2 shrink-0 rounded-full"
            :class="store.activeFilter === card.key ? 'bg-white/60' : card.dot"
          />
          <span
            class="text-sm font-medium leading-none"
            :class="store.activeFilter === card.key ? 'text-white/90' : 'text-slate-600'"
          >
            {{ card.label }}
          </span>
        </div>

        <!-- Active indicator dot -->
        <span
          v-if="store.activeFilter === card.key"
          class="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-white/60"
        />
      </button>
    </div>

    <!-- ── Table card ── -->
    <div
      class="animate-fade-in-up delay-200 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      :style="{ height: `${tableCardHeight}px` }"
    >
      <!-- Loading state -->
      <div v-if="store.isLoading" class="flex-1 p-6">
        <div class="space-y-3">
          <div v-for="i in 6" :key="i" class="flex gap-4">
            <div class="skeleton h-4 w-48" />
            <div class="skeleton h-4 w-36" />
            <div class="skeleton h-4 w-28" />
            <div class="skeleton h-4 w-20" />
            <div class="skeleton h-4 w-24" />
          </div>
        </div>
      </div>

      <!-- Error state -->
      <div
        v-else-if="store.error"
        class="flex flex-1 flex-col items-center justify-center gap-3 p-16 text-center"
      >
        <ExclamationTriangleIcon class="h-10 w-10 text-red-400" />
        <p class="font-medium text-slate-700">{{ store.error }}</p>
        <button
          class="mt-1 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          @click="store.fetchClients()"
        >
          Reintentar
        </button>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="store.filteredClients.length === 0"
        class="flex flex-1 flex-col items-center justify-center gap-3 p-16 text-center"
      >
        <UsersIcon class="h-10 w-10 text-slate-300" />
        <p class="font-medium text-slate-500">No hay clientes con este estado</p>
        <button
          class="mt-1 text-sm text-red-600 hover:text-red-700 underline underline-offset-2 transition-colors"
          @click="store.setFilter('all')"
        >
          Ver todos
        </button>
      </div>

      <!-- Table -->
      <div v-else class="table-scroll min-h-0 flex-1 overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr style="border-bottom: 1px solid #f1f5f9; background: #f8fafc">
              <th
                class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
              >
                Nombre
              </th>
              <th
                class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
              >
                Email
              </th>
              <th
                class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
              >
                Teléfono
              </th>
              <th
                class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
              >
                VIN
              </th>
              <th
                class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
              >
                Estado
              </th>
              <th
                class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
              >
                Fecha
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(client, i) in store.paginatedClients"
              :key="String(client.id ?? client._id ?? i)"
              class="border-b border-slate-50 transition-colors duration-100 hover:bg-slate-50/80"
            >
              <!-- Name -->
              <td class="px-5 py-4">
                <div class="flex items-center gap-2.5">
                  <div
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style="background: linear-gradient(135deg, #334155, #475569)"
                  >
                    {{ getClientName(client).slice(0, 2).toUpperCase() }}
                  </div>
                  <span class="font-medium text-slate-800">{{ getClientName(client) }}</span>
                </div>
              </td>
              <!-- Email -->
              <td class="px-5 py-4 text-slate-600">
                {{ client.email ?? '—' }}
              </td>
              <!-- Phone -->
              <td class="px-5 py-4 text-slate-600">
                {{ client.phone ?? '—' }}
              </td>
              <!-- VIN -->
              <td class="px-5 py-4">
                <span
                  v-if="client.vin"
                  class="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600"
                >
                  {{ client.vin }}
                </span>
                <span v-else class="text-slate-400">—</span>
              </td>
              <!-- Status badge -->
              <td class="px-5 py-4">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="statusBadge[client._status as string] ?? 'bg-slate-100 text-slate-600'"
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full"
                    :class="{
                      'bg-emerald-500': client._status === 'approved',
                      'bg-amber-400': client._status === 'pending',
                      'bg-red-500': client._status === 'rejected',
                    }"
                  />
                  {{ statusLabel[client._status as string] ?? client.status ?? '—' }}
                </span>
              </td>
              <!-- Date -->
              <td class="px-5 py-4 text-slate-500">
                {{ formatDate(String(client.createdAt ?? client.requestDate ?? '')) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ── Pagination ── -->
      <div class="flex items-center justify-between border-t border-slate-100 px-5 py-3.5">
        <p class="text-xs text-slate-400">
          Mostrando {{ (store.currentPage - 1) * store.pageSize + 1 }}–{{
            Math.min(store.currentPage * store.pageSize, store.filteredClients.length)
          }}
          de {{ store.filteredClients.length }}
        </p>
        <div class="flex items-center gap-1">
          <!-- Prev -->
          <button
            :disabled="store.currentPage === 1"
            class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-all hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
            @click="store.setPage(store.currentPage - 1)"
          >
            <ChevronLeftIcon class="h-4 w-4" />
          </button>

          <!-- Page numbers -->
          <template v-for="(p, i) in pageNumbers" :key="i">
            <span
              v-if="p === '…'"
              class="flex h-8 w-8 items-center justify-center text-xs text-slate-400"
            >
              …
            </span>
            <button
              v-else
              class="flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-medium transition-all"
              :class="
                p === store.currentPage
                  ? 'border-red-600 bg-red-600 text-white'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              "
              @click="store.setPage(Number(p))"
            >
              {{ p }}
            </button>
          </template>

          <!-- Next -->
          <button
            :disabled="store.currentPage === store.totalPages"
            class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-all hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
            @click="store.setPage(store.currentPage + 1)"
          >
            <ChevronRightIcon class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
