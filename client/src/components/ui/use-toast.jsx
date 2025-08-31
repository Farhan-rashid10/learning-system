// src/components/ui/use-toast.jsx
import * as React from "react"
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from "@radix-ui/react-toast"

const ToastContext = React.createContext(null)

export function Toaster({ children }) {
  return (
    <ToastProvider swipeDirection="right">
      {children}
      <ToastViewport className="fixed bottom-0 right-0 flex flex-col gap-2 p-4 outline-none z-50" />
    </ToastProvider>
  )
}

export function useToast() {
  const [open, setOpen] = React.useState(false)
  const [toastContent, setToastContent] = React.useState({
    title: "",
    description: "",
  })

  const toast = ({ title, description }) => {
    setToastContent({ title, description })
    setOpen(true)
  }

  const ToastElement = (
    <Toast open={open} onOpenChange={setOpen}>
      <div className="bg-white dark:bg-gray-900 border rounded-lg shadow p-4">
        {toastContent.title && (
          <ToastTitle className="font-bold">{toastContent.title}</ToastTitle>
        )}
        {toastContent.description && (
          <ToastDescription>{toastContent.description}</ToastDescription>
        )}
        <ToastClose className="absolute top-2 right-2">✕</ToastClose>
      </div>
    </Toast>
  )

  return { toast, ToastElement }
}
