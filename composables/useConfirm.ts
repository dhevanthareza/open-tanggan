// Module-level resolve — only runs client-side (user interaction only)
let confirmResolve: ((v: boolean) => void) | null = null

export const useConfirm = () => {
  const state = useState('confirm-dialog', () => ({
    visible: false,
    title: '',
    message: '',
    confirmLabel: 'Ya, Lanjutkan',
    cancelLabel: 'Batal',
    destructive: false,
  }))

  const ask = (opts: {
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    destructive?: boolean
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      confirmResolve = resolve
      state.value = {
        visible: true,
        title: opts.title,
        message: opts.message,
        confirmLabel: opts.confirmLabel ?? 'Ya, Lanjutkan',
        cancelLabel: opts.cancelLabel ?? 'Batal',
        destructive: opts.destructive ?? false,
      }
    })
  }

  const respond = (value: boolean) => {
    state.value.visible = false
    confirmResolve?.(value)
    confirmResolve = null
  }

  return { state, ask, respond }
}
