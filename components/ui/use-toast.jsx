"use client"

import * as React from "react"

import { Toast, ToastProvider, ToastViewport } from "@/components/ui/toast"

const ToastContext = React.createContext({
  toast: () => {},
})

export function ToastProviderWrapper({ children }) {
  const [toasts, setToasts] = React.useState([])

  const toast = React.useCallback(
    ({ ...props }) => {
      const id = Math.random().toString(36).slice(2)
      setToasts((toasts) => [...toasts, { id, ...props }])
      return id
    },
    [setToasts]
  )

  const dismiss = React.useCallback((id) => {
    setToasts((toasts) => toasts.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      <ToastProvider>
        {children}
        {toasts.map(({ id, ...props }) => (
          <Toast key={id} {...props} onOpenChange={(open) => !open && dismiss(id)} />
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const { toast } = React.useContext(ToastContext)
  return { toast }
}
