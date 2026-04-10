import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { apiFetch } from '@/services/api'

export interface User {
  id: string
  username: string
  email: string
  role?: string
  name?: string
  firstName?: string
  lastName?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  const displayName = computed(() => {
    if (!user.value) return 'Usuario'
    if (user.value.name) return user.value.name
    if (user.value.firstName) {
      return `${user.value.firstName} ${user.value.lastName ?? ''}`.trim()
    }
    return user.value.username || user.value.email || 'Usuario'
  })

  const userInitials = computed(() => {
    const name = displayName.value
    return name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  })

  function init() {
    if (!token.value) return
    const saved = localStorage.getItem('auth_user')
    if (saved) {
      try {
        user.value = JSON.parse(saved) as User
      } catch {
        logout()
      }
    }
  }

  async function login(username: string, password: string): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      const data = await apiFetch<{ token: string; user?: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })

      token.value = data.token
      localStorage.setItem('auth_token', data.token)

      const userData: User = data.user ?? {
        id: '',
        username,
        email: username,
        role: 'user',
      }
      user.value = userData
      localStorage.setItem('auth_user', JSON.stringify(userData))

      return true
    } catch {
      error.value = 'Credenciales incorrectas. Verifica tu usuario y contraseña.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    displayName,
    userInitials,
    init,
    login,
    logout,
  }
})
