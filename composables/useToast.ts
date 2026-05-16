let nextId = 0

export const useToast = () => {
  const toasts = useState<Array<{ id: number; message: string; type: 'success' | 'error' | 'info' }>>(
    'app-toasts',
    () => [],
  )

  const add = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (!process.client) return
    const id = ++nextId
    toasts.value = [...toasts.value, { id, message, type }]
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 3500)
  }

  return {
    toasts,
    success: (msg: string) => add(msg, 'success'),
    error: (msg: string) => add(msg, 'error'),
    info: (msg: string) => add(msg, 'info'),
  }
}
