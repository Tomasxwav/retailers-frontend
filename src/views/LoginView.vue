<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const mounted = ref(false)

onMounted(() => {
  setTimeout(() => {
    mounted.value = true
  }, 50)
})

async function handleSubmit() {
  if (!username.value || !password.value) return
  const ok = await auth.login(username.value, password.value)
  if (ok) {
    await router.push({ name: 'dashboard' })
  }
}
</script>

<template>
  <div class="relative flex min-h-screen overflow-hidden" style="background: #080d18">
    <!-- ── Background geometric shapes ── -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <!-- Large blurred circle top-right -->
      <div
        class="absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-20"
        style="background: radial-gradient(circle, #dc2626, transparent 70%); filter: blur(60px)"
      />
      <!-- Medium circle bottom-left -->
      <div
        class="absolute -bottom-24 -left-24 h-72 w-72 rounded-full opacity-15"
        style="background: radial-gradient(circle, #dc2626, transparent 70%); filter: blur(50px)"
      />
      <!-- Grid overlay -->
      <div
        class="absolute inset-0 opacity-5"
        style="
          background-image:
            linear-gradient(#ffffff 1px, transparent 1px),
            linear-gradient(90deg, #ffffff 1px, transparent 1px);
          background-size: 48px 48px;
        "
      />
    </div>

    <!-- ── Left panel — brand ── -->
    <div class="relative hidden flex-col justify-between p-12 lg:flex lg:w-1/2">
      <!-- Logo -->
      <div
        class="flex items-center gap-3 animate-fade-in-up"
        :class="mounted ? 'animate-fade-in-up' : 'opacity-0'"
      >
        <div
          class="flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold text-base"
          style="background: #dc2626; font-family: 'Syne', sans-serif"
        >
          M
        </div>
        <div>
          <span
            class="text-white font-bold tracking-wider"
            style="font-family: 'Syne', sans-serif; font-size: 16px"
          >
            MOTOMEX
          </span>
          <span class="ml-2 text-xs" style="color: #475569; letter-spacing: 0.12em">RETAILERS</span>
        </div>
      </div>

      <!-- Center content -->
      <div>
        <!-- Big tagline -->
        <h2
          class="mb-6 leading-none text-white animate-fade-in-up delay-150"
          style="
            font-family: 'Syne', sans-serif;
            font-size: clamp(36px, 5vw, 56px);
            font-weight: 800;
          "
        >
          Panel de<br />
          <span style="color: #dc2626">Administración</span>
        </h2>
        <p
          class="max-w-sm text-base leading-relaxed animate-fade-in-up delay-250"
          style="color: #64748b"
        >
          Gestiona clientes, dealers y solicitudes desde un solo lugar con visibilidad en tiempo
          real.
        </p>

        <!-- Stats row -->
        <div class="mt-10 flex gap-8 animate-fade-in-up delay-400">
          <div
            v-for="stat in [
              { n: 'Clientes', v: '∞' },
              { n: 'Dealers', v: '∞' },
              { n: 'Solicitudes', v: '∞' },
            ]"
            :key="stat.n"
          >
            <p class="text-2xl font-bold text-white" style="font-family: 'Syne', sans-serif">
              {{ stat.v }}
            </p>
            <p class="text-xs mt-1" style="color: #475569">{{ stat.n }}</p>
          </div>
        </div>
      </div>

      <!-- Bottom decoration -->
      <div class="animate-fade-in delay-500">
        <div class="flex items-center gap-2">
          <div class="h-0.5 w-8 rounded-full" style="background: #dc2626" />
          <p class="text-xs" style="color: #334155">
            © 2025 Motomex. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>

    <!-- ── Right panel — form ── -->
    <div class="relative flex flex-1 items-center justify-center p-6 lg:p-12">
      <!-- Card -->
      <div
        class="w-full max-w-md rounded-2xl p-8 shadow-2xl animate-scale-in delay-100"
        style="background: #ffffff"
      >
        <!-- Mobile logo -->
        <div class="mb-8 flex items-center gap-2 lg:hidden">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-lg text-white font-bold text-sm"
            style="background: #dc2626; font-family: 'Syne', sans-serif"
          >
            M
          </div>
          <span
            class="font-bold tracking-wider text-slate-800"
            style="font-family: 'Syne', sans-serif; font-size: 14px"
          >
            MOTOMEX RETAILERS
          </span>
        </div>

        <!-- Heading -->
        <div class="mb-8">
          <h1
            class="text-2xl font-bold text-slate-900 leading-tight"
            style="font-family: 'Syne', sans-serif"
          >
            Iniciar sesión
          </h1>
          <p class="mt-1.5 text-sm text-slate-500">Ingresa tus credenciales para continuar</p>
        </div>

        <!-- Error alert -->
        <Transition name="error">
          <div
            v-if="auth.error"
            class="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5"
          >
            <div class="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-red-500" />
            <p class="text-sm text-red-700">{{ auth.error }}</p>
          </div>
        </Transition>

        <!-- Form -->
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <!-- Username -->
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700" for="username">
              Usuario o Email
            </label>
            <input
              id="username"
              v-model="username"
              type="text"
              autocomplete="username"
              placeholder="usuario@motomex.com"
              required
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-100"
            />
          </div>

          <!-- Password -->
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700" for="password">
              Contraseña
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="••••••••"
                required
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-11 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-100"
              />
              <button
                type="button"
                class="absolute right-3 cursor-pointer top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                @click="showPassword = !showPassword"
              >
                <EyeSlashIcon v-if="showPassword" class="h-5 w-5" />
                <EyeIcon v-else class="h-5 w-5" />
              </button>
            </div>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="auth.isLoading"
            class="relative mt-2 cursor-pointer w-full overflow-hidden rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60"
            style="background: linear-gradient(135deg, #dc2626, #b91c1c)"
          >
            <span v-if="auth.isLoading" class="flex items-center justify-center gap-2">
              <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Verificando…
            </span>
            <span v-else>Iniciar sesión</span>

            <!-- Shimmer overlay on hover -->
            <span
              class="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/10 transition-transform duration-700 hover:translate-x-full"
              aria-hidden="true"
            />
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-enter-active,
.error-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease,
    max-height 0.25s ease;
}
.error-enter-from,
.error-leave-to {
  opacity: 0;
  transform: translateY(-6px);
  max-height: 0;
}
.error-enter-to,
.error-leave-from {
  max-height: 80px;
}
</style>
