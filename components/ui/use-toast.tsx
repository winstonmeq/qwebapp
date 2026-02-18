"use client"

import * as React from "react"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000 // ✅ 1 second

type ToastProps = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()
const listeners: Array<(state: ToastProps[]) => void> = []

let memoryState: ToastProps[] = []

function emitChange() {
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

// ✅ Manual dismiss
function dismiss(id: string) {
  const timeout = toastTimeouts.get(id)
  if (timeout) {
    clearTimeout(timeout)
    toastTimeouts.delete(id)
  }

  memoryState = memoryState.filter((t) => t.id !== id)
  emitChange()
}

export function toast(props: Omit<ToastProps, "id">) {
  const id = genId()

  memoryState = [{ ...props, id }, ...memoryState].slice(0, TOAST_LIMIT)
  emitChange()

  const timeout = setTimeout(() => {
    dismiss(id)
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(id, timeout)
}

export function useToast() {
  const [state, setState] = React.useState<ToastProps[]>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [])

  return {
    toast,
    dismiss, // ✅ expose dismiss
    toasts: state,
  }
}
