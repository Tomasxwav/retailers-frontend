<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import {
  UsersIcon,
  BuildingStorefrontIcon,
  ClipboardDocumentListIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/vue/24/outline'

const auth = useAuthStore()

const quickCards = [
  {
    label: 'Total Clientes',
    icon: UsersIcon,
    color: 'bg-blue-50 text-blue-600',
    iconBg: 'bg-blue-100',
    hint: 'Solicitudes de clientes',
  },
  {
    label: 'Total Dealers',
    icon: BuildingStorefrontIcon,
    color: 'bg-emerald-50 text-emerald-600',
    iconBg: 'bg-emerald-100',
    hint: 'Red de distribuidores',
  },
  {
    label: 'Pendientes',
    icon: ClipboardDocumentListIcon,
    color: 'bg-amber-50 text-amber-600',
    iconBg: 'bg-amber-100',
    hint: 'Solicitudes por revisar',
  },
  {
    label: 'Actividad',
    icon: ArrowTrendingUpIcon,
    color: 'bg-red-50 text-red-600',
    iconBg: 'bg-red-100',
    hint: 'Métricas del sistema',
  },
]
</script>

<template>
  <div class="p-6 lg:p-8">
    <!-- Welcome section -->
    <div class="mb-8 animate-fade-in-up">
      <h2 class="text-2xl font-bold text-slate-900" style="font-family: 'Syne', sans-serif">
        Bienvenido, {{ auth.displayName.split(' ')[0] }} 👋
      </h2>
      <p class="mt-1 text-sm text-slate-500">
        Aquí tienes un resumen de la plataforma Motomex Retailers.
      </p>
    </div>

    <!-- Quick access cards -->
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <RouterLink
        v-for="(card, i) in quickCards"
        :key="card.label"
        :to="
          card.label === 'Total Clientes'
            ? '/clientes'
            : card.label === 'Total Dealers'
              ? '/dealers'
              : '#'
        "
        class="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md animate-fade-in-up"
        :class="`delay-${(i + 1) * 100}`"
      >
        <div
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
          :class="card.iconBg"
        >
          <component :is="card.icon" class="h-6 w-6" :class="card.color.split(' ')[1]" />
        </div>
        <div>
          <p
            class="font-semibold text-slate-800"
            style="font-family: 'Syne', sans-serif; font-size: 15px"
          >
            {{ card.label }}
          </p>
          <p class="mt-0.5 text-xs text-slate-400">{{ card.hint }}</p>
        </div>
      </RouterLink>
    </div>

    <!-- Quick nav section -->
    <div class="mt-8 animate-fade-in-up delay-500">
      <h3
        class="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400"
        style="font-size: 11px"
      >
        Acceso rápido
      </h3>
      <div class="grid gap-4 sm:grid-cols-2">
        <RouterLink
          to="/clientes"
          class="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-red-100"
        >
          <div
            class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50 transition-transform duration-200 group-hover:scale-105"
          >
            <UsersIcon class="h-7 w-7 text-red-500" />
          </div>
          <div>
            <p class="font-bold text-slate-800" style="font-family: 'Syne', sans-serif">
              Gestionar Clientes
            </p>
            <p class="mt-1 text-sm text-slate-400">
              Ver solicitudes, filtrar por estado y gestionar registros
            </p>
          </div>
        </RouterLink>

        <RouterLink
          to="/dealers"
          class="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-red-100"
        >
          <div
            class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 transition-transform duration-200 group-hover:scale-105"
          >
            <BuildingStorefrontIcon class="h-7 w-7 text-slate-600" />
          </div>
          <div>
            <p class="font-bold text-slate-800" style="font-family: 'Syne', sans-serif">
              Gestionar Dealers
            </p>
            <p class="mt-1 text-sm text-slate-400">
              Administra la red de distribuidores y sus estados
            </p>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
