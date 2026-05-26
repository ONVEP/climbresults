import type { DataColumnSchema } from '#common/api_types'
import FileUpIcon from 'lucide-solid/icons/file-up'
import PlusIcon from 'lucide-solid/icons/plus'
import type { Component } from 'solid-js'
import { createSignal, For, Show } from 'solid-js'
import { post, queryClient } from '../../lib/api'
import DataEditDialog from './DataEditDialog'
import DataImportDialog from './DataImportDialog'

const DataBrowserHeader: Component<{
  models: { name: string; label: string }[]
  model: string | null
  schema?: DataColumnSchema[] | null
  onModelChange?: (model: string) => void
}> = (props) => {
  const [importData, setImportData] = createSignal<string | null>(null)
  const handleImport = async () => {
    const data = await navigator.clipboard.readText()
    console.log('Pasted content: ', JSON.stringify(data))
    setImportData(data)
  }
  const handleImportClose = () => setImportData(null)
  const [editData, setEditData] = createSignal<{ [key: string]: any } | null>(null)
  const handleNewData = async (data?: Record<string, any>) => {
    if (!data) return setEditData(null)
    try {
      await post(`/api/data/?model=${props.model}`, data)
      queryClient.invalidateQueries({ queryKey: ['data', props.model] })
      setEditData(null)
    } catch (e: any) {
      alert(`Erreur lors de l'ajout de la donnée: ${e.message}`)
      setEditData(data)
    }
  }

  return (
    <div class="flex gap-4">
      <select
        class="select"
        onChange={(e) => props.onModelChange?.(e.currentTarget.value)}
        value={props.model ?? 'null'}
      >
        <option disabled value="null">
          Choisir les données
        </option>
        <For each={props.models}>
          {(model) => <option value={model.name}>{model.label}</option>}
        </For>
      </select>
      <Show when={props.model}>
        <button class="btn btn-square" onClick={handleImport}>
          <FileUpIcon />
        </button>
        <button class="btn btn-square btn-primary" onClick={() => setEditData({})}>
          <PlusIcon />
        </button>
      </Show>
      <DataImportDialog data={importData()} columns={props.schema} onClose={handleImportClose} />
      <Show when={props.schema}>
        {(columns) => (
          <DataEditDialog columns={columns()} data={editData()} onClose={handleNewData} />
        )}
      </Show>
    </div>
  )
}

export default DataBrowserHeader
