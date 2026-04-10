import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { apiFetch } from '@/services/api'

export interface Client {
  id?: string
  _id?: string
  name?: string
  nombre?: string
  firstName?: string
  lastName?: string
  email?: string
  correo?: string
  phone?: string
  phone_number?: string
  telefono?: string
  status?: string
  state?: string
  city?: string
  address?: string
  created_at?: string
  requestDate?: string
  updatedAt?: string
  vin?: string
  vcNIV?: string
  [key: string]: unknown
}

export interface ClientsRequest {
  requests: Client[]
  status_summary: { status: 'approved' | 'pending' | 'rejected'; total: number }[]
}

export type StatusFilter = 'all' | 'approved' | 'pending' | 'rejected'

export function normalizeStatus(status?: string): 'approved' | 'pending' | 'rejected' {
  if (!status) return 'pending'
  const s = status.toLowerCase()
  if (['approved', 'aprobado', 'active', 'activo', 'accept', 'accepted'].includes(s))
    return 'approved'
  if (['rejected', 'rechazado', 'denied', 'denegado', 'declined'].includes(s)) return 'rejected'
  return 'pending'
}

export function getClientName(c: Client): string {
  if (c.name) return c.name
  if (c.nombre) return c.nombre
  if (c.firstName) return `${c.firstName} ${c.lastName ?? ''}`.trim()
  return c.email ?? c.correo ?? c.vin ?? c.vcNIV ?? String(c.id ?? c._id ?? '—')
}

export function getClientVin(c: Client): string {
  return c.vin ?? c.vcNIV ?? ''
}

export interface ClientUpdatePayload {
  vin: string
  invoice: string
  full_name: string
  email: string
  phone_number: string
  birthday: string
  street: string
  exterior_number: string
  interior_number: string
  neighborhood: string
  city: string
  state: string
  zip: string
  status: string
  year: string
  model: string
  retailer: string
}

export interface ClientCardPayload {
  vcNIV: string
  phone_number: string
  telefono: string
  nombre: string
  correo: string
}

export const useClientsStore = defineStore('clients', () => {
  const clients = ref<Client[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const activeFilter = ref<StatusFilter>('all')
  const currentPage = ref(1)
  const pageSize = ref(10)

  const enriched = computed(() =>
    clients.value.map((c) => ({ ...c, _status: normalizeStatus(c.status) })),
  )

  const filteredClients = computed(() => {
    if (activeFilter.value === 'all') return enriched.value
    return enriched.value.filter((c) => c._status === activeFilter.value)
  })

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredClients.value.length / pageSize.value)),
  )

  const paginatedClients = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredClients.value.slice(start, start + pageSize.value)
  })

  const counts = computed(() => ({
    all: enriched.value.length,
    approved: enriched.value.filter((c) => c._status === 'approved').length,
    pending: enriched.value.filter((c) => c._status === 'pending').length,
    rejected: enriched.value.filter((c) => c._status === 'rejected').length,
  }))

  function setFilter(filter: StatusFilter) {
    activeFilter.value = filter
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

  watch(filteredClients, () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }
  })

  async function fetchClients() {
    isLoading.value = true
    error.value = null
    try {
      const data = await apiFetch<ClientsRequest>('/clients/requests')
      clients.value = data.requests ?? []
    } catch {
      error.value = 'No se pudieron cargar los clientes'
    } finally {
      isLoading.value = false
    }
  }

  async function updateClient(vin: string, payload: ClientUpdatePayload) {
    return apiFetch<Client>(`/clients/${vin}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  }

  async function approveClientAndSaveCard(
    vin: string,
    payload: ClientUpdatePayload,
    cardPayload: ClientCardPayload,
  ) {
    const approvedPayload = {
      ...payload,
    }

    await apiFetch<Client>(`/clients/${vin}`, {
      method: 'PUT',
      body: JSON.stringify(approvedPayload),
    })

    return apiFetch(`/card`, {
      method: 'POST',
      body: JSON.stringify(cardPayload),
    })
  }

  return {
    isLoading,
    error,
    activeFilter,
    currentPage,
    pageSize,
    filteredClients,
    paginatedClients,
    totalPages,
    counts,
    setFilter,
    setPage,
    setPageSize,
    fetchClients,
    updateClient,
    approveClientAndSaveCard,
  }
})
