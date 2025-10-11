import { useEffect } from 'react'

export interface ToastOptions {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

type ToastListener = (toast: ToastOptions) => void

const listeners = new Set<ToastListener>()

export function notifyToast(toast: ToastOptions) {
  for (const listener of Array.from(listeners)) listener(toast)
}

export function useToast() {
  return {
    toast: notifyToast,
  }
}

// Hook for the Toaster component to subscribe to toast events
export function useToastSubscription(onToast: ToastListener) {
  useEffect(() => {
    listeners.add(onToast)
    return () => {
      listeners.delete(onToast)
    }
  }, [onToast])
}
