import { createContext, createSignal, useContext, type Component, type JSX } from 'solid-js'

type EventMap = {
  'report:request-copy-report-data': void
  'report:column-drag-start': { columnKey: string; columnLabel: string }
  'report:column-drag-end': void
  'report:column-drop': { columnKey: string; position: number }
}

type GlobalState = {
  editMode: boolean
}

type StateChangeHandler<K extends keyof GlobalState> = (value: GlobalState[K]) => void

type EventBus = {
  emit<K extends keyof EventMap>(event: K, data?: EventMap[K]): void
  subscribe<K extends keyof EventMap>(
    event: K,
    handler: EventMap[K] extends void ? () => void : (data: EventMap[K]) => void
  ): () => void
  getState<K extends keyof GlobalState>(key: K): GlobalState[K]
  setState<K extends keyof GlobalState>(key: K, value: GlobalState[K]): void
  onStateChange<K extends keyof GlobalState>(key: K, handler: StateChangeHandler<K>): () => void
}

const STORAGE_KEY = 'rappac:global-state'

function loadState(): GlobalState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      // Merge defaults first, then stored values - ensures new keys get defaults
      // while preserving existing stored values
      return { ...getDefaultState(), ...JSON.parse(stored) }
    }
  } catch (e) {
    console.error('Failed to load state from localStorage:', e)
  }
  return getDefaultState()
}

function saveState(state: GlobalState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save state to localStorage:', e)
  }
}

function getDefaultState(): GlobalState {
  return {
    editMode: false,
  }
}

const EventBusContext = createContext<EventBus>()

export const EventBusProvider: Component<{ children: JSX.Element }> = (props) => {
  const [listeners, setListeners] = createSignal<
    Partial<Record<keyof EventMap, Set<(data?: any) => void>>>
  >({})
  const [state, setState] = createSignal<GlobalState>(loadState())
  const [stateListeners, setStateListeners] = createSignal<
    Partial<Record<keyof GlobalState, Set<StateChangeHandler<any>>>>
  >({})

  const eventBus: EventBus = {
    emit<K extends keyof EventMap>(event: K, data: EventMap[K]) {
      const handlers = listeners()[event]
      if (handlers) {
        handlers.forEach((handler) => handler(data))
      }
    },
    subscribe<K extends keyof EventMap>(
      event: K,
      handler: EventMap[K] extends void ? () => void : (data: EventMap[K]) => void
    ) {
      setListeners((prev) => {
        const existing = prev[event] || new Set()
        existing.add(handler as any)
        return { ...prev, [event]: existing }
      })
      return () => {
        setListeners((prev) => {
          const existing = prev[event]
          if (existing) {
            existing.delete(handler as any)
          }
          return { ...prev }
        })
      }
    },
    getState<K extends keyof GlobalState>(key: K): GlobalState[K] {
      return state()[key]
    },
    setState<K extends keyof GlobalState>(key: K, value: GlobalState[K]) {
      setState((prev) => {
        const newState = { ...prev, [key]: value }
        saveState(newState)
        return newState
      })
      // Notify listeners
      const handlers = stateListeners()[key]
      if (handlers) {
        handlers.forEach((handler) => handler(value))
      }
    },
    onStateChange<K extends keyof GlobalState>(key: K, handler: StateChangeHandler<K>): () => void {
      setStateListeners((prev) => {
        const existing = prev[key] || new Set()
        existing.add(handler)
        return { ...prev, [key]: existing }
      })
      return () => {
        setStateListeners((prev) => {
          const existing = prev[key]
          if (existing) {
            existing.delete(handler)
          }
          return { ...prev }
        })
      }
    },
  }

  return <EventBusContext.Provider value={eventBus}>{props.children}</EventBusContext.Provider>
}

export const useEventBus = () => {
  const context = useContext(EventBusContext)
  if (!context) {
    throw new Error('useEventBus must be used within EventBusProvider')
  }
  return context
}
