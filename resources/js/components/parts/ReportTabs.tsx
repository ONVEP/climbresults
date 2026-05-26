import { patch, useApiCollectionQuery } from '#lib/api'
import { useEventBus } from '#lib/events'
import type ReportView from '#models/report_view'
import ClipboardIcon from 'lucide-solid/icons/clipboard'
import Columns2Icon from 'lucide-solid/icons/columns-2'
import PencilIcon from 'lucide-solid/icons/pencil'
import Table2Icon from 'lucide-solid/icons/table-2'
import XIcon from 'lucide-solid/icons/x'
import { createSignal, For, onMount, Show, type Component } from 'solid-js'
import { SidePanel } from '../ReportPage'

export const ReportTabs: Component<{
  currentView: number
  onCurrentViewChange?: (id: number) => void
  onToggleViewList?: () => void
  onToggleColumnsConfig?: () => void
  openSidePanel?: SidePanel
}> = (props) => {
  const reportViews = useApiCollectionQuery<ReportView>('report_views')
  const eventBus = useEventBus()
  const [editMode, setEditMode] = createSignal(eventBus.getState('editMode'))

  onMount(() => {
    const unsubscribe = eventBus.onStateChange('editMode', setEditMode)
    return unsubscribe
  })

  const toggleEditMode = () => {
    eventBus.setState('editMode', !editMode())
  }

  const closeTab = (view: ReportView) => {
    patch(`/api/report_views/${view.id}`, { displayIndex: null }).then(() => {
      reportViews.refetch()
      if (props.currentView === view.id) {
        props.onCurrentViewChange?.(-1)
      }
    })
  }

  return (
    <div class="flex shadow-md z-50">
      <div role="tablist" class="tabs tabs-border overflow-x-auto items-end">
        <For each={reportViews.data?.filter((v) => typeof v.displayIndex === 'number')}>
          {(view) => (
            <button
              role="tab"
              class="tab"
              classList={{
                'tab-active': props.currentView === view.id,
              }}
              onClick={() => props.onCurrentViewChange?.(view.id)}
            >
              {view.name}
              <XIcon
                class="ml-2 inline h-4 w-4 cursor-pointer hover:bg-base-300"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  closeTab(view)
                }}
              />
            </button>
          )}
        </For>
      </div>
      <div class="grow"></div>
      <div class="flex p-2 gap-2">
        <Show when={props.currentView !== -1}>
          <button
            class="btn btn-sm btn-square btn-ghost btn-primary tooltip tooltip-bottom hidden"
            classList={{ 'btn-active': editMode() }}
            onClick={toggleEditMode}
            data-tip="Mode édition"
          >
            <PencilIcon class="inline h-4 w-4" />
          </button>
          <button
            class="btn btn-sm btn-square btn-ghost tooltip tooltip-bottom"
            onClick={() => eventBus.emit('report:request-copy-report-data')}
            data-tip="Copier vers Excel"
          >
            <ClipboardIcon class="inline h-4 w-4" />
          </button>
          <button
            class="btn btn-sm btn-square btn-ghost tooltip tooltip-left"
            classList={{ 'btn-active': props.openSidePanel == SidePanel.ColumnsConfig }}
            onClick={props.onToggleColumnsConfig}
            data-tip="Configurer les colonnes"
          >
            <Columns2Icon class="inline h-4 w-4" />
          </button>
        </Show>
        <button
          class="btn btn-sm btn-square btn-ghost tooltip tooltip-left"
          classList={{ 'btn-active': props.openSidePanel == SidePanel.ViewList }}
          onClick={props.onToggleViewList}
          data-tip="Gérer les vues"
        >
          <Table2Icon class="inline h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
