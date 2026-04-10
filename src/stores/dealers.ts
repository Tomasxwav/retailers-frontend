import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { apiFetch } from '@/services/api'
import { normalizeStatus } from './clients'
import type { StatusFilter } from './clients'

export interface Dealer {
  id?: string
  _id?: string
  name?: string
  firstName?: string
  lastName?: string
  businessName?: string
  email?: string
  phone?: string
  status?: string
  address?: string
  location?: string
  city?: string
  createdAt?: string
  updatedAt?: string
  [key: string]: unknown
}

export function getDealerName(d: Dealer): string {
  if (d.businessName) return d.businessName
  if (d.name) return d.name
  if (d.firstName) return `${d.firstName} ${d.lastName ?? ''}`.trim()
  return d.email ?? String(d.id ?? d._id ?? '—')
}

export const useDealersStore = defineStore('dealers', () => {
  const dealers = ref<Dealer[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const activeFilter = ref<StatusFilter>('all')
  const currentPage = ref(1)
  const pageSize = 10

  const enriched = computed(() =>
    dealers.value.map((d) => ({ ...d, _status: normalizeStatus(d.status) })),
  )

  const filteredDealers = computed(() => {
    if (activeFilter.value === 'all') return enriched.value
    return enriched.value.filter((d) => d._status === activeFilter.value)
  })

  const totalPages = computed(() => Math.max(1, Math.ceil(filteredDealers.value.length / pageSize)))

  const paginatedDealers = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    return filteredDealers.value.slice(start, start + pageSize)
  })

  const counts = computed(() => ({
    all: enriched.value.length,
    approved: enriched.value.filter((d) => d._status === 'approved').length,
    pending: enriched.value.filter((d) => d._status === 'pending').length,
    rejected: enriched.value.filter((d) => d._status === 'rejected').length,
  }))

  function setFilter(filter: StatusFilter) {
    activeFilter.value = filter
    currentPage.value = 1
  }

  function setPage(page: number) {
    currentPage.value = page
  }

  async function fetchDealers() {
    isLoading.value = true
    error.value = null
    try {
      const data = await apiFetch<{ dealers: Dealer[] }>('/dealers')
      dealers.value = data.dealers ?? []
    } catch {
      error.value = 'No se pudieron cargar los dealers'
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    activeFilter,
    currentPage,
    pageSize,
    filteredDealers,
    paginatedDealers,
    totalPages,
    counts,
    setFilter,
    setPage,
    fetchDealers,
  }
})
