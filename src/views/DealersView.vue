<script setup lang="ts">
import { onMounted, onBeforeUnmount, computed, nextTick, ref, watch } from 'vue'
import { useDealersStore, getDealerConcessionaire } from '@/stores/dealers'
import {
  BuildingStorefrontIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
} from '@heroicons/vue/24/outline'

const store = useDealersStore()

const pageRoot = ref<HTMLElement | null>(null)
const headerSection = ref<HTMLElement | null>(null)
const filtersSection = ref<HTMLElement | null>(null)
const tableCardHeight = ref(420)

const BASE_ROW_HEIGHT = 57
const TABLE_HEAD_AND_FOOT = 104
const MIN_TABLE_HEIGHT = 260

function updateViewportFit() {
  if (!pageRoot.value) return

  const rootHeight = pageRoot.value.clientHeight
  const usedHeight =
    (headerSection.value?.offsetHeight ?? 0) + (filtersSection.value?.offsetHeight ?? 0) + 20
  const nextCardHeight = Math.max(MIN_TABLE_HEIGHT, rootHeight - usedHeight)

  tableCardHeight.value = nextCardHeight

  const rowsArea = nextCardHeight - TABLE_HEAD_AND_FOOT
  const computedRows = Math.max(4, Math.floor(rowsArea / BASE_ROW_HEIGHT))
  store.setPageSize(computedRows)
}

onMounted(async () => {
  await store.fetchDealers()
  await nextTick()
  updateViewportFit()
  window.addEventListener('resize', updateViewportFit)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateViewportFit)
})

watch(
  () => [store.selectedState, store.selectedCity, store.searchQuery, store.filteredDealers.length],
  async () => {
    await nextTick()
    updateViewportFit()
  },
)

function formatDate(val?: string): string {
  if (!val) return '—'
  const d = new Date(val)
  if (isNaN(d.getTime())) return val
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

function onStateChange(event: Event) {
  store.setStateFilter((event.target as HTMLSelectElement).value)
}

function onCityChange(event: Event) {
  store.setCityFilter((event.target as HTMLSelectElement).value)
}

function onSearchInput(event: Event) {
  store.setSearch((event.target as HTMLInputElement).value)
}

function clearFilters() {
  store.setStateFilter('all')
  store.setCityFilter('all')
  store.setSearch('')
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
          Red de Dealers
        </h2>
        <p class="mt-0.5 text-sm text-slate-500">
          {{ store.counts.all }} distribuidores registrados
        </p>
      </div>
      <div class="text-xs text-slate-400">
        Mostrando <strong class="text-slate-600">{{ store.counts.filtered }}</strong> resultados
      </div>
    </div>

    <!-- ── Filters ── -->
    <div
      ref="filtersSection"
      class="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-3 animate-fade-in-up delay-100 md:grid-cols-3"
    >
      <label class="flex flex-col gap-1">
        <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Estado</span>
        <select
          class="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
          :value="store.selectedState"
          @change="onStateChange"
        >
          <option value="all">Todos</option>
          <option v-for="state in store.states" :key="state" :value="state">{{ state }}</option>
        </select>
      </label>

      <label class="flex flex-col gap-1">
        <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Ciudad</span>
        <select
          class="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
          :value="store.selectedCity"
          @change="onCityChange"
        >
          <option value="all">Todas</option>
          <option v-for="city in store.cities" :key="city" :value="city">{{ city }}</option>
        </select>
      </label>

      <label class="flex flex-col gap-1">
        <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Búsqueda</span>
        <div class="relative">
          <MagnifyingGlassIcon
            class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            placeholder="Concesionario, ciudad, estado..."
            class="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:ring-2 focus:ring-red-100"
            :value="store.searchQuery"
            @input="onSearchInput"
          />
        </div>
      </label>
    </div>

    <!-- ── Table card ── -->
    <div
      class="animate-fade-in-up delay-200 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      :style="{ height: `${tableCardHeight}px` }"
    >
      <!-- Loading -->
      <div v-if="store.isLoading" class="flex-1 p-6">
        <div class="space-y-3">
          <div v-for="i in 6" :key="i" class="flex gap-4">
            <div class="skeleton h-4 w-48" />
            <div class="skeleton h-4 w-36" />
            <div class="skeleton h-4 w-28" />
            <div class="skeleton h-4 w-24" />
            <div class="skeleton h-4 w-20" />
          </div>
        </div>
      </div>

      <!-- Error -->
      <div
        v-else-if="store.error"
        class="flex flex-1 flex-col items-center justify-center gap-3 p-16 text-center"
      >
        <ExclamationTriangleIcon class="h-10 w-10 text-red-400" />
        <p class="font-medium text-slate-700">{{ store.error }}</p>
        <button
          class="mt-1 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          @click="store.fetchDealers()"
        >
          Reintentar
        </button>
      </div>

      <!-- Empty -->
      <div
        v-else-if="store.filteredDealers.length === 0"
        class="flex flex-1 flex-col items-center justify-center gap-3 p-16 text-center"
      >
        <BuildingStorefrontIcon class="h-10 w-10 text-slate-300" />
        <p class="font-medium text-slate-500">No hay dealers para los filtros seleccionados</p>
        <button
          class="mt-1 text-sm text-red-600 hover:text-red-700 underline underline-offset-2 transition-colors"
          @click="clearFilters"
        >
          Limpiar filtros
        </button>
      </div>

      <!-- Table -->
      <div v-else class="table-scroll min-h-0 flex-1 overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr style="border-bottom: 1px solid #f1f5f9; background: #f8fafc">
              <th
                class="p-2 xl:px-5 xl:py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
              >
                Concesionario
              </th>
              <th
                class="p-2 xl:px-5 xl:py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
              >
                Estado
              </th>
              <th
                class="p-2 xl:px-5 xl:py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
              >
                Ciudad
              </th>
              <th
                class="p-2 xl:px-5 xl:py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
              >
                Dirección
              </th>
              <th
                class="p-2 xl:px-5 xl:py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
              >
                Dealer ID
              </th>
              <th
                class="p-2 xl:px-5 xl:py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
              >
                Fecha
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(dealer, i) in store.paginatedDealers"
              :key="String(dealer.id ?? dealer.dealer_id ?? i)"
              class="border-b border-slate-50 transition-colors duration-100 hover:bg-slate-50/80"
            >
              <!-- Name -->
              <td class="px-2 py-2 xl:px-5 xl:py-3.5">
                <div class="flex items-center gap-2.5">
                  <div
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
                    style="background: linear-gradient(135deg, #dc2626, #b91c1c)"
                  >
                    {{ getDealerConcessionaire(dealer).slice(0, 2).toUpperCase() }}
                  </div>
                  <span class="font-medium text-slate-800">{{
                    getDealerConcessionaire(dealer)
                  }}</span>
                </div>
              </td>
              <!-- State -->
              <td class="px-2 py-2 xl:px-5 xl:py-3.5 text-slate-600">
                {{ dealer.state ?? '—' }}
              </td>
              <!-- City -->
              <td class="px-2 py-2 xl:px-5 xl:py-3.5 text-slate-600">
                {{ dealer.city ?? '—' }}
              </td>
              <!-- Address -->
              <td class="px-2 py-2 xl:px-5 xl:py-3.5">
                <div v-if="dealer.address" class="flex items-center gap-1 text-slate-600">
                  <MapPinIcon class="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span>{{ dealer.address }}</span>
                </div>
                <span v-else class="text-slate-400">—</span>
              </td>
              <!-- Dealer ID -->
              <td class="px-2 py-2 xl:px-5 xl:py-3.5 text-slate-600">
                <span class="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                  {{ dealer.dealer_id ?? dealer.id ?? '—' }}
                </span>
              </td>
              <!-- Date -->
              <td class="px-2 py-2 xl:px-5 xl:py-3.5 text-slate-500">
                {{ formatDate(String(dealer.created_at ?? dealer.updated_at ?? '')) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ── Pagination ── -->
      <div class="flex items-center justify-between border-t border-slate-100 px-5 py-3.5">
        <p class="text-xs text-slate-400">
          Mostrando {{ (store.currentPage - 1) * store.pageSize + 1 }}–{{
            Math.min(store.currentPage * store.pageSize, store.filteredDealers.length)
          }}
          de {{ store.filteredDealers.length }}
        </p>
        <div class="flex items-center gap-1">
          <button
            :disabled="store.currentPage === 1"
            class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-all hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
            @click="store.setPage(store.currentPage - 1)"
          >
            <ChevronLeftIcon class="h-4 w-4" />
          </button>

          <template v-for="(p, i) in pageNumbers" :key="i">
            <span
              v-if="p === '…'"
              class="flex h-8 w-8 items-center justify-center text-xs text-slate-400"
              >…</span
            >
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
