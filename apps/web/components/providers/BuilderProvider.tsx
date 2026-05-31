'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react'
import { useBuilderStore } from '@/lib/builder/store'

interface BuilderContextValue {
  siteId: string
  pageId: string
}

const BuilderContext = createContext<BuilderContextValue | null>(null)

export function useBuilderContext() {
  const ctx = useContext(BuilderContext)
  if (!ctx) throw new Error('useBuilderContext must be used within BuilderProvider')
  return ctx
}

interface BuilderProviderProps {
  siteId: string
  pageId: string
  children: ReactNode
}

export default function BuilderProvider({
  siteId,
  pageId,
  children,
}: BuilderProviderProps) {
  const setSections = useBuilderStore((s) => s.setSections)
  const isDirty = useBuilderStore((s) => s.isDirty)
  const sections = useBuilderStore((s) => s.sections)
  const pageSettings = useBuilderStore((s) => s.pageSettings)
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/sites/${siteId}/pages/${pageId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.sections) setSections(data.sections)
        }
      } catch {
        // silently fail — page may not exist yet
      }
    }
    load()
  }, [siteId, pageId, setSections])

  useEffect(() => {
    if (!isDirty) return
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    autoSaveRef.current = setTimeout(async () => {
      try {
        await fetch(`/api/sites/${siteId}/pages/${pageId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sections, pageSettings }),
        })
      } catch {
        // auto-save failed silently
      }
    }, 2000)
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    }
  }, [isDirty, sections, pageSettings, siteId, pageId])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const store = useBuilderStore.getState()
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) store.redo()
        else store.undo()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        if (store.selection) {
          e.preventDefault()
          store.copySelection()
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
        if (store.clipboard) {
          e.preventDefault()
          store.pasteClipboard()
        }
      }
    },
    [],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <BuilderContext.Provider value={{ siteId, pageId }}>
      {children}
    </BuilderContext.Provider>
  )
}
