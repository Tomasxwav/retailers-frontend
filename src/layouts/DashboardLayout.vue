<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const sidebarOpen = ref(false)

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  clients: 'Clientes',
  dealers: 'Dealers',
}

function getTitle() {
  return pageTitles[String(route.name ?? '')] ?? 'Panel'
}
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-slate-50">
    <!-- ── Sidebar – desktop ── -->
    <aside class="hidden lg:flex lg:w-64 lg:flex-shrink-0 lg:flex-col" style="background: #0b1120">
      <AppSidebar />
    </aside>

    <!-- ── Mobile overlay ── -->
    <Transition name="overlay">
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        @click="sidebarOpen = false"
      />
    </Transition>

    <!-- ── Sidebar – mobile slide-over ── -->
    <Transition name="sidebar">
      <aside
        v-if="sidebarOpen"
        class="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
        style="background: #0b1120"
      >
        <div class="absolute right-3 top-3 z-10">
          <button
            class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            @click="sidebarOpen = false"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>
        <AppSidebar />
      </aside>
    </Transition>

    <!-- ── Main content ── -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Top bar (mobile + page title) -->
      <header class="flex h-14 flex-shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-4 lg:px-6">
        <!-- Mobile hamburger -->
        <button
          class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors lg:hidden"
          @click="sidebarOpen = true"
        >
          <Bars3Icon class="h-5 w-5" />
        </button>

        <!-- Page title -->
        <h1
          class="text-base font-bold text-slate-800 tracking-tight"
          style="font-family: 'Syne', sans-serif"
        >
          {{ getTitle() }}
        </h1>

        <!-- Right spacer -->
        <div class="ml-auto" />
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" :key="route.name" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Overlay transition */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.25s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* Sidebar slide-in */
.sidebar-enter-active,
.sidebar-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.sidebar-enter-from,
.sidebar-leave-to {
  transform: translateX(-100%);
}

/* Page transition */
.page-enter-active {
  transition: opacity 0.2s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.page-leave-active {
  transition: opacity 0.15s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
}
</style>
