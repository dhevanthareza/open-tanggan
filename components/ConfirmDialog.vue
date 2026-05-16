<script setup lang="ts">
const { state, respond } = useConfirm()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-all duration-150"
      leave-to-class="opacity-0"
    >
      <div
        v-if="state.visible"
        class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="respond(false)" />

        <!-- Dialog panel -->
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="translate-y-4 sm:translate-y-0 sm:scale-95 opacity-0"
          leave-active-class="transition-all duration-150"
          leave-to-class="translate-y-4 sm:translate-y-0 sm:scale-95 opacity-0"
        >
          <div v-if="state.visible" class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <!-- Top accent -->
            <div :class="['h-1.5', state.destructive ? 'bg-destructive' : 'bg-amber-400']" />

            <div class="p-6 space-y-4">
              <!-- Icon -->
              <div :class="['h-14 w-14 rounded-full flex items-center justify-center mx-auto', state.destructive ? 'bg-red-100' : 'bg-amber-100']">
                <svg :class="['h-7 w-7', state.destructive ? 'text-red-600' : 'text-amber-600']" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <!-- Text -->
              <div class="text-center">
                <h3 class="text-lg font-bold text-foreground">{{ state.title }}</h3>
                <p class="text-sm text-muted-foreground mt-2 leading-relaxed">{{ state.message }}</p>
              </div>

              <!-- Buttons — stacked on mobile for big tap targets -->
              <div class="flex flex-col gap-3 pt-1">
                <button
                  @click="respond(true)"
                  :class="[
                    'w-full h-12 rounded-xl text-base font-semibold text-white transition-colors',
                    state.destructive ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'
                  ]"
                >
                  {{ state.confirmLabel }}
                </button>
                <button
                  @click="respond(false)"
                  class="w-full h-12 rounded-xl border-2 border-border text-base font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  {{ state.cancelLabel }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
