import type { DataColumnSchema } from '#common/api_types'
import { patch } from '#lib/api'
import type { FormattingRule } from '#models/report_view'
import BoldIcon from 'lucide-solid/icons/bold'
import ItalicIcon from 'lucide-solid/icons/italic'
import PlusIcon from 'lucide-solid/icons/plus'
import Trash2Icon from 'lucide-solid/icons/trash-2'
import UnderlineIcon from 'lucide-solid/icons/underline'
import XIcon from 'lucide-solid/icons/x'
import { createSignal, Index, Show, type Component } from 'solid-js'
import { Portal } from 'solid-js/web'
import { ConditionEditor } from '../ConditionEditor'

const TAILWIND_BG_COLORS = [
  [
    'bg-red-300',
    'bg-orange-300',
    'bg-yellow-300',
    'bg-green-300',
    'bg-blue-300',
    'bg-indigo-300',
    'bg-purple-300',
    'bg-pink-300',
    'bg-gray-300',
  ],
  [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-gray-500',
  ],
  [
    'bg-red-700',
    'bg-orange-700',
    'bg-yellow-700',
    'bg-green-700',
    'bg-blue-700',
    'bg-indigo-700',
    'bg-purple-700',
    'bg-pink-700',
    'bg-gray-700',
  ],
]

const TAILWIND_TEXT_COLORS = [
  [
    'text-red-300',
    'text-orange-300',
    'text-yellow-300',
    'text-green-300',
    'text-blue-300',
    'text-indigo-300',
    'text-purple-300',
    'text-pink-300',
    'text-gray-300',
  ],
  [
    'text-red-500',
    'text-orange-500',
    'text-yellow-500',
    'text-green-500',
    'text-blue-500',
    'text-indigo-500',
    'text-purple-500',
    'text-pink-500',
    'text-gray-500',
  ],
  [
    'text-red-700',
    'text-orange-700',
    'text-yellow-700',
    'text-green-700',
    'text-blue-700',
    'text-indigo-700',
    'text-purple-700',
    'text-pink-700',
    'text-gray-700',
  ],
]

export const ConditionalFormattingDialog: Component<{
  viewId: number
  formatting: FormattingRule[] | null
  columns: DataColumnSchema[]
  onClose: () => void
  onSaved: () => void
}> = (props) => {
  const initialRules: FormattingRule[] = props.formatting || []

  const [rules, setRules] = createSignal<FormattingRule[]>(initialRules)
  const [saving, setSaving] = createSignal(false)
  const [expandedRule, setExpandedRule] = createSignal<number | null>(null)

  const addRule = () => {
    const newIndex = rules().length
    setRules([
      ...rules(),
      {
        bgColor: null,
        fgColor: null,
        bold: false,
        italic: false,
        underline: false,
        condition: null,
      },
    ])
    setExpandedRule(newIndex)
  }

  const removeRule = (index: number) => {
    setRules(rules().filter((_, i) => i !== index))
  }

  const updateRule = (index: number, updates: Partial<FormattingRule>) => {
    const newRules = [...rules()]
    newRules[index] = { ...newRules[index], ...updates }
    setRules(newRules)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await patch(`/api/report_views/${props.viewId}`, {
        formatting: rules().length > 0 ? rules() : null,
      })
      props.onSaved()
      props.onClose()
    } catch (error) {
      console.error('Failed to save formatting:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Portal>
      <div class="modal modal-open">
        <div class="modal-box max-w-4xl">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold">Mise en forme conditionnelle</h3>
            <button type="button" class="btn btn-sm btn-square btn-ghost" onClick={props.onClose}>
              <XIcon size={16} />
            </button>
          </div>

          <div class="flex flex-col gap-4">
            <p class="text-sm text-base-content/70">
              Définissez des règles de mise en forme en fonction des valeurs des données. Les lignes
              qui correspondent aux conditions seront formatées.
            </p>

            <Show
              when={rules().length > 0}
              fallback={
                <div class="text-center py-8 text-base-content/50">
                  Aucune règle de mise en forme. Cliquez sur "Ajouter une règle" pour commencer.
                </div>
              }
            >
              <div class="flex flex-col gap-2">
                <Index each={rules()}>
                  {(rule, index) => (
                    <div class="collapse collapse-arrow border border-base-300 bg-base-100">
                      <input
                        type="radio"
                        name="formatting-rules"
                        checked={expandedRule() === index}
                        onChange={() => setExpandedRule(index)}
                      />
                      <div class="collapse-title">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-2">
                            <span class="text-sm font-medium">Règle {index + 1}</span>
                            <Show when={rule().bgColor || rule().fgColor}>
                              <span
                                class="inline-flex justify-center items-center w-4 h-4 border border-base-300 rounded text-xs"
                                classList={{
                                  [rule().bgColor ?? '']: true,
                                  [rule().fgColor ?? '']: true,
                                }}
                              >
                                A
                              </span>
                            </Show>
                            <Show when={rule().bold}>
                              <BoldIcon size={14} />
                            </Show>
                            <Show when={rule().italic}>
                              <ItalicIcon size={14} />
                            </Show>
                            <Show when={rule().underline}>
                              <UnderlineIcon size={14} />
                            </Show>
                          </div>
                          <button
                            type="button"
                            class="btn btn-xs btn-square btn-ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeRule(index)
                            }}
                          >
                            <Trash2Icon size={14} />
                          </button>
                        </div>
                      </div>
                      <div class="collapse-content">
                        <div class="flex flex-col gap-3 pt-2">
                          <div class="flex gap-4">
                            <div>
                              <label class="label">
                                <span class="label-text">Couleur de fond</span>
                              </label>
                              <div class="grid grid-cols-9 gap-1 w-fit">
                                <Index each={TAILWIND_BG_COLORS}>
                                  {(row) => (
                                    <Index each={row()}>
                                      {(colorClass) => (
                                        <button
                                          type="button"
                                          class="w-8 h-8 rounded border-2 transition-all"
                                          classList={{
                                            'border-base-content': rule().bgColor === colorClass(),
                                            'border-base-300': rule().bgColor !== colorClass(),
                                            'scale-110': rule().bgColor === colorClass(),
                                            [colorClass()]: true,
                                          }}
                                          onClick={() =>
                                            updateRule(index, { bgColor: colorClass() })
                                          }
                                        />
                                      )}
                                    </Index>
                                  )}
                                </Index>
                              </div>
                              <button
                                type="button"
                                class="btn btn-xs btn-ghost mt-1"
                                onClick={() => updateRule(index, { bgColor: null })}
                              >
                                Effacer
                              </button>
                            </div>

                            <div>
                              <label class="label">
                                <span class="label-text">Couleur du texte</span>
                              </label>
                              <div class="grid grid-cols-9 gap-1 w-fit">
                                <Index each={TAILWIND_TEXT_COLORS}>
                                  {(row) => (
                                    <Index each={row()}>
                                      {(colorClass) => (
                                        <button
                                          type="button"
                                          class="w-8 h-8 rounded border-2 transition-all"
                                          classList={{
                                            'border-base-content': rule().fgColor === colorClass(),
                                            'border-base-300': rule().fgColor !== colorClass(),
                                            'scale-110': rule().fgColor === colorClass(),
                                            [colorClass().replace('text-', 'bg-')]: true,
                                          }}
                                          onClick={() =>
                                            updateRule(index, { fgColor: colorClass() })
                                          }
                                        />
                                      )}
                                    </Index>
                                  )}
                                </Index>
                              </div>
                              <button
                                type="button"
                                class="btn btn-xs btn-ghost mt-1"
                                onClick={() => updateRule(index, { fgColor: null })}
                              >
                                Effacer
                              </button>
                            </div>
                          </div>

                          <div>
                            <label class="label">
                              <span class="label-text">Style du texte</span>
                            </label>
                            <div class="flex gap-2">
                              <button
                                type="button"
                                class="btn btn-sm"
                                classList={{ 'btn-active': rule().bold }}
                                onClick={() => updateRule(index, { bold: !rule().bold })}
                              >
                                <BoldIcon size={16} />
                                Gras
                              </button>
                              <button
                                type="button"
                                class="btn btn-sm"
                                classList={{ 'btn-active': rule().italic }}
                                onClick={() => updateRule(index, { italic: !rule().italic })}
                              >
                                <ItalicIcon size={16} />
                                Italique
                              </button>
                              <button
                                type="button"
                                class="btn btn-sm"
                                classList={{ 'btn-active': rule().underline }}
                                onClick={() => updateRule(index, { underline: !rule().underline })}
                              >
                                <UnderlineIcon size={16} />
                                Souligné
                              </button>
                            </div>
                          </div>

                          <div>
                            <label class="label">
                              <span class="label-text">Condition</span>
                            </label>
                            <ConditionEditor
                              condition={rule().condition}
                              onChange={(condition) => updateRule(index, { condition })}
                              columns={props.columns}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Index>
              </div>
            </Show>

            <button type="button" class="btn btn-sm btn-ghost w-fit" onClick={addRule}>
              <PlusIcon size={16} />
              Ajouter une règle
            </button>
          </div>

          <div class="modal-action">
            <button type="button" class="btn btn-ghost" onClick={props.onClose}>
              Annuler
            </button>
            <button type="button" class="btn btn-primary" onClick={handleSave} disabled={saving()}>
              {saving() ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
        <div class="modal-backdrop" onClick={props.onClose} />
      </div>
    </Portal>
  )
}
