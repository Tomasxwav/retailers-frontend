<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  Squares2X2Icon,
  UsersIcon,
  BuildingStorefrontIcon,
  CubeIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const navItems = [
  { name: 'Dashboard', icon: Squares2X2Icon, to: '/', routeName: 'dashboard' },
  { name: 'Clientes', icon: UsersIcon, to: '/clientes', routeName: 'clients' },
  { name: 'Dealers', icon: BuildingStorefrontIcon, to: '/dealers', routeName: 'dealers' },
  { name: 'Modelos', icon: CubeIcon, to: '/modelos', routeName: 'models' },
]

function isActive(item: (typeof navItems)[number]) {
  return route.name === item.routeName
}

const roleLabel = computed(() => {
  const role = auth.user?.role ?? 'user'
  const map: Record<string, string> = {
    admin: 'Administrador',
    user: 'Usuario',
    manager: 'Gerente',
    dealer: 'Dealer',
  }
  return map[role.toLowerCase()] ?? role
})

async function handleLogout() {
  auth.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <aside class="flex h-full w-full flex-col overflow-hidden" style="background: #0b1120">
    <!-- Top accent line -->
    <div
      class="h-0.5 w-full shrink-0"
      style="background: linear-gradient(90deg, #dc2626, #ef4444 50%, transparent)"
    />

    <!-- Logo / Brand -->
    <div class="flex shrink-0 items-center gap-3 px-6 py-5">
      <div
        class="flex h-9 w-9 items-center justify-center rounded-lg font-bold text-white text-sm shrink-0"
        style="background: #dc2626; font-family: 'Syne', sans-serif; letter-spacing: 0.05em"
      >
        M
      </div>
      <div>
        <p
          class="text-white font-bold leading-none tracking-wide"
          style="font-family: 'Syne', sans-serif; font-size: 15px"
        >
          MOTOMEX
        </p>
        <p class="text-xs mt-0.5" style="color: #64748b; letter-spacing: 0.08em; font-size: 10px">
          RETAILERS
        </p>
      </div>
    </div>

    <!-- Divider -->
    <div class="mx-4 shrink-0" style="height: 1px; background: #1e293b" />

    <!-- User card -->
    <div class="mx-4 mt-4 shrink-0 rounded-xl p-3" style="background: #0f1a2e">
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
          style="
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            font-family: 'Syne', sans-serif;
          "
        >
          {{ auth.userInitials }}
        </div>
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-white leading-tight">
            {{ auth.displayName }}
          </p>
          <p class="mt-0.5 text-xs" style="color: #94a3b8">{{ roleLabel }}</p>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-scroll mt-6 flex-1 overflow-y-auto px-3">
      <p
        class="mb-2 px-3 text-xs font-semibold uppercase tracking-widest"
        style="color: #334155; font-size: 10px"
      >
        Menú
      </p>
      <ul class="space-y-1">
        <li v-for="item in navItems" :key="item.routeName">
          <RouterLink
            :to="item.to"
            class="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200"
            :class="
              isActive(item) ? 'text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            "
          >
            <!-- Active background -->
            <span
              v-if="isActive(item)"
              class="absolute inset-0 rounded-xl"
              style="
                background: linear-gradient(
                  135deg,
                  rgba(220, 38, 38, 0.2),
                  rgba(220, 38, 38, 0.08)
                );
              "
            />
            <!-- Active left border -->
            <span
              v-if="isActive(item)"
              class="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full"
              style="background: #dc2626"
            />

            <component
              :is="item.icon"
              class="relative h-5 w-5 shrink-0 transition-colors duration-200"
              :class="isActive(item) ? 'text-red-500' : 'text-slate-500 group-hover:text-slate-300'"
            />
            <span class="relative">{{ item.name }}</span>
          </RouterLink>
        </li>
      </ul>
    </nav>

    <!-- Logout -->
    <div class="shrink-0 p-4">
      <div class="mb-4 mx-1" style="height: 1px; background: #1e293b" />
      <button
        class="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
        @click="handleLogout"
      >
        <ArrowRightStartOnRectangleIcon class="h-5 w-5 shrink-0" />
        Cerrar sesión
      </button>
    </div>
  </aside>
</template>
