import { del, get, patch, post, useApiCollectionQuery } from '#lib/api'
import type ReportView from '#models/report_view'
import DownloadIcon from 'lucide-solid/icons/download'
import PlusIcon from 'lucide-solid/icons/plus'
import Share2Icon from 'lucide-solid/icons/share-2'
import Trash2Icon from 'lucide-solid/icons/trash-2'
import { For, Show, type Component } from 'solid-js'

export const ViewList: Component<{ currentTab?: number }> = () => {
  const views = useApiCollectionQuery<ReportView>('report_views')
  const privateViews = () =>
    views.data?.filter((v) => !v.isPublic).sort((a, b) => a.name.localeCompare(b.name)) || []
  const sharedViews = () =>
    views.data?.filter((v) => v.isPublic).sort((a, b) => a.name.localeCompare(b.name)) || []

  const addView = () => {
    const name = prompt('Nom de la vue')
    if (!name) return
    post('/api/report_views', { name }).then(() => {
      views.refetch()
    })
  }

  const openTab = (view: ReportView) => () => {
    if (typeof view.displayIndex === 'number') return
    patch(`/api/report_views/${view.id}`, {
      displayIndex: views.data?.reduce(
        (a, b) => (typeof b.displayIndex === 'number' ? Math.max(a, b.displayIndex + 1) : a),
        0
      ),
    }).then(() => {
      views.refetch()
    })
  }

  const deleteView = (view: ReportView) => {
    del(`/api/report_views/${view.id}`).then(() => {
      views.refetch()
    })
  }

  const shareView = async (viewId: ReportView['id']) => {
    const view = (await get(`/api/report_views/${viewId}`)) as ReportView
    post(`/api/report_views`, { ...view, isPublic: true }).then(() => {
      views.refetch()
    })
  }

  const importView = async (viewId: ReportView['id']) => {
    const view = (await get(`/api/report_views/${viewId}`)) as ReportView
    const { id, createdAt, updatedAt, userId, ...viewData } = view
    post('/api/report_views', {
      ...viewData,
      name: viewData.name + ' - Copie',
      isPublic: false,
    }).then(() => {
      views.refetch()
    })
  }

  return (
    <div>
      <h2 class="text-lg flex items-center justify-between">
        Mes vues
        <button class="btn btn-sm btn-circle btn-soft btn-primary ml-2" onClick={addView}>
          <PlusIcon class="inline h-4 w-4" />
        </button>
      </h2>
      <ul class="w-full flex flex-col">
        <For each={privateViews()}>
          {(v) => (
            <li
              onClick={openTab(v)}
              class="relative px-4 py-2 hover:bg-base-200 flex items-center group cursor-pointer rounded"
            >
              <a
                classList={{
                  italic: typeof v.displayIndex === 'number',
                }}
              >
                {v.name}
              </a>
              <div class="flex absolute right-2 gap-1">
                <button
                  class="btn btn-xs btn-circle btn-soft btn-primary opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    shareView(v.id)
                  }}
                >
                  <Share2Icon class="inline h-4 w-4" />
                </button>
                <button
                  class="btn btn-xs btn-circle btn-soft btn-error opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    deleteView(v)
                  }}
                >
                  <Trash2Icon class="inline h-4 w-4" />
                </button>
              </div>
            </li>
          )}
        </For>
      </ul>
      <h2 class="text-lg">Vues partagées</h2>
      <ul class="w-full flex flex-col">
        <For each={sharedViews()}>
          {(v) => (
            <li class="relative px-4 py-2 hover:bg-base-200 flex items-center group cursor-pointer rounded">
              <a>
                {v.name} <span class="text-xs text-base-content/60">{v.user?.commonName}</span>
              </a>
              <div class="flex absolute right-2 gap-1">
                <button
                  class="btn btn-xs btn-circle btn-soft btn-primary opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    importView(v.id)
                  }}
                >
                  <DownloadIcon class="inline h-4 w-4" />
                </button>
                <Show when={'isMine' in v && v.isMine}>
                  <button
                    class="btn btn-xs btn-circle btn-soft btn-error opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      deleteView(v)
                    }}
                  >
                    <Trash2Icon class="inline h-4 w-4" />
                  </button>
                </Show>
              </div>
            </li>
          )}
        </For>
      </ul>
    </div>
  )
}
