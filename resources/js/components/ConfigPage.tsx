import { get, post } from '#lib/api'
import type { ConfigData, ConfigOptions } from '#providers/config_provider'
import { createResource, createSignal, For, Show, type Component } from 'solid-js'
import { ConfigField } from './parts/ConfigField'
import { TestNotificationButton } from './parts/TestNotificationButton'

export const ConfigPage: Component<{}> = () => {
  const [oldConfig, { refetch }] = createResource(() => get('/api/config') as Promise<ConfigData>)
  // Track unsaved changes: undefined = unmodified, value = modified locally, null = reset (to be saved)
  const [newValues, setNewValues] = createSignal<Record<string, any>>({})

  const hasUnsavedChanges = () => Object.keys(newValues()).length > 0

  const handleInputChange = (key: keyof ConfigOptions, value: any) => {
    if (value === oldConfig()?.config[key].value) {
      const { [key]: _, ...rest } = newValues()
      setNewValues(rest)
    } else setNewValues({ ...newValues(), [key]: value })
  }

  const handleReset = (key: keyof ConfigOptions) => {
    if (!oldConfig()?.config[key].isModified) {
      const { [key]: _, ...rest } = newValues()
      setNewValues(rest)
    } else setNewValues({ ...newValues(), [key]: null })
  }

  const handleCancel = () => {
    setNewValues({})
  }

  const handleSave = async () => {
    await post('/api/config', newValues())
    setNewValues({})
    refetch()
  }

  return (
    <div class="container mx-auto p-4 pb-24">
      <TestNotificationButton />

      <For each={oldConfig()?.sections}>
        {(section) => (
          <section class="mb-8">
            <h2 class="text-2xl font-bold mb-2">{section.category}</h2>
            <div class="gap-4 grid grid-cols-1 lg:grid-cols-2">
              <For each={section.options}>
                {(option) => (
                  <ConfigField
                    description={option.description}
                    value={oldConfig()!.config[option.key]}
                    unsavedValue={newValues()[option.key]}
                    onInputChange={(value) => handleInputChange(option.key, value)}
                    onReset={() => handleReset(option.key)}
                  />
                )}
              </For>
            </div>
          </section>
        )}
      </For>

      <Show when={hasUnsavedChanges()}>
        <div class="fixed bottom-0 left-0 right-0 bg-base-200 border-t border-base-300 p-4 flex justify-end gap-2 shadow-lg">
          <button class="btn" onClick={handleCancel}>
            Annuler
          </button>
          <button class="btn btn-primary" onClick={handleSave}>
            Enregistrer
          </button>
        </div>
      </Show>
    </div>
  )
}
