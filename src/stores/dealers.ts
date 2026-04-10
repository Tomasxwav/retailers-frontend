import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { apiFetch } from '@/services/api'

export interface Dealer {
  id?: string
  dealer_id?: string
  state?: string
  city?: string
  name?: string
  concessionaire?: string
  address?: string
  longitude?: string
  latitude?: string
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

export function getDealerConcessionaire(d: Dealer): string {
  if (d.concessionaire) return d.concessionaire
  if (d.name) return d.name
  return d.city ?? d.state ?? String(d.id ?? d.dealer_id ?? '—')
}

export const useDealersStore = defineStore('dealers', () => {
  const dealers = ref<Dealer[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const selectedState = ref('all')
  const selectedCity = ref('all')
  const searchQuery = ref('')
  const currentPage = ref(1)
  const pageSize = ref(10)

  const normalizedSearch = computed(() => searchQuery.value.trim().toLowerCase())

  const states = computed(() => {
    const unique = new Set(
      dealers.value
        .map((dealer) => dealer.state?.trim())
        .filter((state): state is string => Boolean(state)),
    )
    return Array.from(unique).sort((a, b) => a.localeCompare(b, 'es'))
  })

  const cities = computed(() => {
    const byState =
      selectedState.value === 'all'
        ? dealers.value
        : dealers.value.filter((dealer) => dealer.state === selectedState.value)

    const unique = new Set(
      byState.map((dealer) => dealer.city?.trim()).filter((city): city is string => Boolean(city)),
    )
    return Array.from(unique).sort((a, b) => a.localeCompare(b, 'es'))
  })

  const filteredDealers = computed(() => {
    return dealers.value.filter((dealer) => {
      const matchesState = selectedState.value === 'all' || dealer.state === selectedState.value
      const matchesCity = selectedCity.value === 'all' || dealer.city === selectedCity.value

      if (!matchesState || !matchesCity) return false
      if (!normalizedSearch.value) return true

      const searchable = [
        dealer.concessionaire,
        dealer.name,
        dealer.city,
        dealer.state,
        dealer.address,
        dealer.dealer_id,
      ]
        .filter((value): value is string => Boolean(value))
        .join(' ')
        .toLowerCase()

      return searchable.includes(normalizedSearch.value)
    })
  })

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredDealers.value.length / pageSize.value)),
  )

  const paginatedDealers = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredDealers.value.slice(start, start + pageSize.value)
  })

  const counts = computed(() => ({
    all: dealers.value.length,
    filtered: filteredDealers.value.length,
  }))

  function setStateFilter(state: string) {
    selectedState.value = state
    if (
      state !== 'all' &&
      selectedCity.value !== 'all' &&
      !cities.value.includes(selectedCity.value)
    ) {
      selectedCity.value = 'all'
    }
    currentPage.value = 1
  }

  function setCityFilter(city: string) {
    selectedCity.value = city
    currentPage.value = 1
  }

  function setSearch(query: string) {
    searchQuery.value = query
    currentPage.value = 1
  }

  function setPage(page: number) {
    currentPage.value = Math.min(Math.max(1, page), totalPages.value)
  }

  function setPageSize(size: number) {
    pageSize.value = Math.max(1, size)
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }
  }

  watch(filteredDealers, () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }
  })

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
    selectedState,
    selectedCity,
    searchQuery,
    currentPage,
    pageSize,
    states,
    cities,
    filteredDealers,
    paginatedDealers,
    totalPages,
    counts,
    setStateFilter,
    setCityFilter,
    setSearch,
    setPage,
    setPageSize,
    fetchDealers,
  }
})
