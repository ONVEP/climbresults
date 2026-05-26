import type { DataColumnSchema } from '#common/api_types'
import type { Condition } from '#common/condition_types'
import { patch, useApiItemQuery, useModelQuery } from '#lib/api'
import { evaluateCondition, filterData } from '#lib/condition_evaluator'
import type ReportView from '#models/report_view'
import type { FormattingRule, ReportViewOrder } from '#models/report_view'
import type { UseQueryResult } from '@tanstack/solid-query'
import {
  createColumnHelper,
  createSolidTable,
  flexRender,
  getCoreRowModel,
} from '@tanstack/solid-table'
import ArrowDownIcon from 'lucide-solid/icons/arrow-down'
import ArrowDownUpIcon from 'lucide-solid/icons/arrow-down-up'
import ArrowUpIcon from 'lucide-solid/icons/arrow-up'
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  Match,
  onCleanup,
  Show,
  Switch,
  type Component,
} from 'solid-js'
import { useEventBus } from '../../../lib/events'
import { DataCellRenderer } from '../data_renderers/DataCellRenderer'

type ModelQueryResult = UseQueryResult<{ data: Record<string, any>[]; schema: DataColumnSchema[] }>

export const ReportTable: Component<{ currentView: number }> = (props) => {
  const eventBus = useEventBus()

  const [resizingColumn, setResizingColumn] = createSignal<number | null>(null)
  const [startX, setStartX] = createSignal(0)
  const [startWidth, setStartWidth] = createSignal(0)
  const [tempWidth, setTempWidth] = createSignal<number | null>(null)
  const [draggingColumn, setDraggingColumn] = createSignal<number | null>(null)
  const [draggingNewColumn, setDraggingNewColumn] = createSignal<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = createSignal<number | null>(null)
  const [editingCell, setEditingCell] = createSignal<{
    rowIndex: number
    columnKey: string
  } | null>(null)
  const [tempCellValue, setTempCellValue] = createSignal<any>(null)
  const exitEditing = () => {
    setEditingCell(null)
    setTempCellValue(null)
  }

  const reportView = createMemo(() =>
    useApiItemQuery<ReportView>('report_views', props.currentView)
  )

  const sourceData = createMemo<{ [key: string]: ModelQueryResult }>(() => {
    const view = reportView()
    const models = new Set<string>()
    if (view.data?.mainModel) models.add(view.data?.mainModel)
    const result: { [key: string]: ModelQueryResult } = {}
    models.forEach((m) => (result[m] = useModelQuery(m)))
    return result
  })

  const getRowFormatting = (row: Record<string, any>): FormattingRule | null => {
    const formatting = reportView().data?.formatting
    if (!formatting) return null

    const format: FormattingRule = {
      bgColor: null,
      fgColor: null,
      bold: false,
      italic: false,
      underline: false,
      condition: null,
    }

    // Iterate through formatting rules and return the first matching rule
    for (const rule of formatting) {
      if (rule.condition && evaluateCondition(rule.condition as Condition, row)) {
        format.bgColor ||= rule.bgColor
        format.fgColor ||= rule.fgColor
        format.bold ||= rule.bold
        format.italic ||= rule.italic
        format.underline ||= rule.underline
      }
    }
    return format
  }

  const columnHelper = createColumnHelper<any>()
  const table = createSolidTable({
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    get columns() {
      const selectionColumn = columnHelper.display({
        id: 'select',
        header: ({ table }) => {
          let ref: HTMLInputElement | undefined
          createEffect(() => {
            if (ref)
              ref.indeterminate = table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
          })
          return (
            <label class="text-center w-full inline-block">
              <input
                ref={ref}
                type="checkbox"
                class="checkbox checkbox-xs"
                checked={table.getIsAllRowsSelected()}
                onChange={table.getToggleAllRowsSelectedHandler()}
              />
            </label>
          )
        },
        cell: ({ row }) => (
          <label class="absolute left-0 top-0 right-0 bottom-0 px-2 py-1 flex justify-center">
            <input
              type="checkbox"
              class="checkbox checkbox-xs"
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()}
            />
          </label>
        ),
        size: 40,
      })

      return [
        selectionColumn,
        ...(reportView().data?.columns ?? [])
          .map((col) => {
            const schema = sourceData()[reportView().data?.mainModel || ''].data?.schema || []
            const column = schema.find((c) => c.property === col.key)
            if (!column)
              return columnHelper.accessor(col.key, {
                header: `N/A (${col.label || col.key})`,
                cell: () => '-',
                size: 150,
              })
            return columnHelper.accessor(column.property, {
              header: col.label || column.displayName,
              cell: (info) => {
                const value = info.getValue()
                const rowIndex = info.row.index
                const columnKey = column.property
                const isEditing = () =>
                  editingCell()?.rowIndex === rowIndex && editingCell()?.columnKey === columnKey

                const handleBlur = () => {
                  // Commit the change when input is released
                  const data = sourceData()[reportView().data?.mainModel || '']?.data?.data
                  if (data && isEditing()) {
                    data[rowIndex][columnKey] = tempCellValue()
                  }
                  exitEditing()
                }

                return (
                  <div
                    onDblClick={() => {
                      if (!eventBus.getState('editMode')) return
                      setEditingCell({ rowIndex, columnKey })
                      setTempCellValue(value)
                      console.log('Editing cell', rowIndex, columnKey)
                    }}
                    onBlur={handleBlur}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === 'Escape') {
                        handleBlur()
                      }
                    }}
                  >
                    <DataCellRenderer
                      column={column}
                      value={isEditing() ? tempCellValue() : value}
                      readonly={!isEditing()}
                      transforms={col.transform}
                      onChange={(newValue) => {
                        setTempCellValue(newValue)
                      }}
                      onBlur={handleBlur}
                    />
                  </div>
                )
              },
              size: 150,
            })
          })
          .filter((x) => x !== null),
      ]
    },
    get data() {
      const rawData = sourceData()[reportView().data?.mainModel || '']?.data?.data || []
      const filters = reportView().data?.filters ?? null

      const filteredData = filterData(rawData, filters)

      // Apply ordering
      const orderRules = Array.isArray(reportView().data?.order) ? reportView().data?.order! : []
      if (orderRules.length === 0) return filteredData

      const orderedData: any[] = [...filteredData]
      orderedData.sort((a, b) => {
        for (const rule of orderRules) {
          const aVal = a[rule.key]
          const bVal = b[rule.key]

          // Handle null/undefined values
          if (aVal == null && bVal == null) continue
          if (aVal == null) return rule.direction === 'asc' ? 1 : -1
          if (bVal == null) return rule.direction === 'asc' ? -1 : 1

          // Compare values
          let comparison = 0
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            comparison = aVal.localeCompare(bVal)
          } else {
            comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
          }

          if (comparison !== 0) {
            return rule.direction === 'asc' ? comparison : -comparison
          }
        }
        return 0
      })

      return orderedData
    },
  })

  const gridTemplateColumns = createMemo(() => {
    const columns = reportView().data?.columns ?? []
    const colIndex = resizingColumn()

    const dataColumnWidths = columns
      .map((col, i) => {
        const width = colIndex === i && tempWidth() !== null ? tempWidth()! : col.width
        return `max(1rem, ${width}px)`
      })
      .join(' ')

    return `40px ${dataColumnWidths}`
  })

  const handleResizeStart = (e: MouseEvent, index: number) => {
    e.preventDefault()
    const dataColumnIndex = index - 1

    const columns = reportView().data?.columns ?? []
    setResizingColumn(dataColumnIndex)
    setStartX(e.clientX)
    setStartWidth(columns[dataColumnIndex]?.width ?? 100)
    setTempWidth(columns[dataColumnIndex]?.width ?? 100)
  }

  const handleResizeMove = (e: MouseEvent) => {
    const colIndex = resizingColumn()
    if (colIndex === null) return

    const delta = e.clientX - startX()
    const newWidth = Math.max(50, startWidth() + delta)
    setTempWidth(newWidth)
  }

  const handleResizeEnd = () => {
    const colIndex = resizingColumn()
    if (colIndex === null) return

    const newWidth = tempWidth()
    if (newWidth === null) return

    const columns = reportView().data?.columns ?? []
    const newColumns = [...columns]
    newColumns[colIndex] = { ...newColumns[colIndex], width: newWidth }

    patch(`/api/report_views/${props.currentView}`, { columns: newColumns }).then(() => {
      reportView()
        .refetch()
        .then(() => {
          setResizingColumn(null)
          setTempWidth(null)
        })
    })
  }

  const handleDragStart = (e: DragEvent, index: number) => {
    const dataColumnIndex = index - 1

    setDraggingColumn(dataColumnIndex)
    e.dataTransfer!.effectAllowed = 'move'
    e.dataTransfer!.setData('text/plain', dataColumnIndex.toString())
  }

  const handleDragOver = (e: DragEvent, index: number) => {
    e.preventDefault()
    const dataColumnIndex = index - 1
    if (dataColumnIndex < 0) return

    console.log('Drag over', e.dataTransfer!.getData('text/plain'))
    setDragOverColumn(dataColumnIndex)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e: DragEvent, dropIndex: number) => {
    e.preventDefault()
    const dataDropIndex = dropIndex - 1
    if (dataDropIndex <= -1) return

    // Check if dropping a new column from ViewConfig
    if (draggingNewColumn() !== null) {
      const columnKey = e.dataTransfer!.getData('text/plain')
      if (columnKey) {
        const columns = reportView().data?.columns ?? []
        const position = dataDropIndex === -1 ? columns.length : dataDropIndex
        eventBus.emit('report:column-drop', { columnKey, position })
      }
      setDraggingNewColumn(null)
      setDragOverColumn(null)
      return
    }

    // Handle reordering existing columns
    const dragIndex = draggingColumn()
    if (dragIndex === null || dragIndex === dataDropIndex) {
      setDraggingColumn(null)
      setDragOverColumn(null)
      return
    }

    const columns = reportView().data?.columns ?? []
    const newColumns = [...columns]
    const [draggedColumn] = newColumns.splice(dragIndex, 1)
    if (dataDropIndex === -1) newColumns.push(draggedColumn)
    else if (dragIndex < dataDropIndex) newColumns.splice(dataDropIndex - 1, 0, draggedColumn)
    else newColumns.splice(dataDropIndex, 0, draggedColumn)

    patch(`/api/report_views/${props.currentView}`, { columns: newColumns }).then(() => {
      reportView()
        .refetch()
        .then(() => {
          setDraggingColumn(null)
          setDragOverColumn(null)
        })
    })
  }

  const handleDragEnd = () => {
    setDraggingColumn(null)
    setDragOverColumn(null)
  }

  const toggleColumnOrder = (columnKey: string) => {
    const viewData = reportView().data
    const currentOrder = Array.isArray(viewData?.order) ? viewData.order : []
    const existingOrderIndex = currentOrder.findIndex((o) => o.key === columnKey)

    let newOrder: ReportViewOrder[]

    if (existingOrderIndex === -1) {
      // Column not in order, add it with ascending direction
      newOrder = [{ key: columnKey, direction: 'asc' }]
    } else {
      const currentDirection = currentOrder[existingOrderIndex].direction
      if (currentDirection === 'asc') {
        // Switch to descending
        newOrder = [{ key: columnKey, direction: 'desc' }]
      } else {
        // Remove ordering
        newOrder = []
      }
    }

    patch(`/api/report_views/${props.currentView}`, { order: newOrder }).then(() => {
      reportView().refetch()
    })
  }

  const getColumnOrderInfo = (columnKey: string) => {
    const currentOrder = reportView().data?.order
    if (!Array.isArray(currentOrder)) return null
    const orderRule = currentOrder.find((o) => o.key === columnKey)
    return orderRule
  }

  const handleCopyToClipboard = async () => {
    let selectedRows = table.getSelectedRowModel().rows
    if (selectedRows.length === 0) selectedRows = table.getRowModel().rows

    const rows = selectedRows
      .map((row) => {
        const cells = row.getVisibleCells().slice(1) // Skip selection column
        return cells
          .map((cell) => {
            const value = cell.getValue()
            return value?.toString() || ''
          })
          .join('\t')
      })
      .join('\n')

    const tsv = rows

    try {
      await navigator.clipboard.writeText(tsv)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  createEffect(() => {
    const unsubscribe1 = eventBus.subscribe('report:request-copy-report-data', () => {
      handleCopyToClipboard()
    })
    const unsubscribe2 = eventBus.subscribe('report:column-drag-start', (data) => {
      setDraggingNewColumn(data.columnLabel)
    })
    const unsubscribe3 = eventBus.subscribe('report:column-drag-end', () => {
      setDraggingNewColumn(null)
    })
    const unsubscribe4 = eventBus.onStateChange('editMode', (value) => {
      if (!value) exitEditing()
    })
    onCleanup(() => {
      unsubscribe1()
      unsubscribe2()
      unsubscribe3()
      unsubscribe4()
    })
  })

  return (
    <div onMouseMove={handleResizeMove} onMouseUp={handleResizeEnd} class="flex">
      <table class="table table-xs text-nowrap [&_th,&_td]:overflow-hidden w-fit h-fit">
        <thead
          class="grid sticky top-0 bg-base-100"
          style={{ 'grid-template-columns': gridTemplateColumns() }}
        >
          <tr class="contents">
            <For each={table.getLeafHeaders()}>
              {(header, index) => {
                const dataColumnIndex = () => index() - 1
                const column = () =>
                  dataColumnIndex() >= 0 ? reportView().data?.columns?.[dataColumnIndex()] : null
                const orderInfo = () => (column() ? getColumnOrderInfo(column()!.key) : null)

                return (
                  <th
                    class="hover:bg-base-200 hover:[&_div.drag-handle]:bg-base-300 relative select-none"
                    classList={{
                      'cursor-move': dataColumnIndex() >= 0,
                      'opacity-50': draggingColumn() === dataColumnIndex(),
                      'border-l-2 border-primary': dragOverColumn() === dataColumnIndex(),
                      'border-r-2 border-primary':
                        dragOverColumn() === -1 && index() === table.getLeafHeaders().length - 1,
                    }}
                    draggable={dataColumnIndex() >= 0}
                    onDragStart={(e) => handleDragStart(e, index())}
                    onDragOver={(e) => handleDragOver(e, index())}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index())}
                    onDragEnd={handleDragEnd}
                  >
                    <div class="flex items-center gap-1 hover:[&>button]:opacity-100">
                      <span class="flex-1">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </span>
                      <Show when={column()}>
                        <button
                          class="btn btn-xs btn-ghost btn-square"
                          classList={{ 'opacity-0': !orderInfo() }}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleColumnOrder(column()!.key)
                          }}
                          onDragStart={(e) => e.preventDefault()}
                          draggable={false}
                        >
                          <Switch fallback={<ArrowDownUpIcon size={12} />}>
                            <Match when={orderInfo() && orderInfo()!.direction === 'asc'}>
                              <ArrowUpIcon size={12} stroke-width={4} class="text-base-content" />
                            </Match>
                            <Match when={orderInfo() && orderInfo()!.direction === 'desc'}>
                              <ArrowDownIcon size={12} stroke-width={4} class="text-base-content" />
                            </Match>
                          </Switch>
                        </button>
                      </Show>
                    </div>
                    <Show when={dataColumnIndex() >= 0}>
                      <div
                        class="drag-handle absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary/50"
                        onMouseDown={(e) => {
                          e.stopPropagation()
                          handleResizeStart(e, index())
                        }}
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                      />
                    </Show>
                  </th>
                )
              }}
            </For>
          </tr>
        </thead>
        <tbody class="grid" style={{ 'grid-template-columns': gridTemplateColumns() }}>
          <For each={table.getRowModel().rows}>
            {(row) => {
              const formatting = getRowFormatting(row.original)
              return (
                <tr
                  class="contents [&:hover>td]:bg-base-200"
                  classList={{
                    [formatting?.bgColor || '']: !!formatting?.bgColor,
                  }}
                >
                  <For each={row.getVisibleCells()}>
                    {(cell) => (
                      <td
                        class="relative"
                        classList={{
                          [formatting?.bgColor || '']: !!formatting?.bgColor,
                          [formatting?.fgColor || '']: !!formatting?.fgColor,
                          'font-bold': formatting?.bold,
                          'italic': formatting?.italic,
                          'underline': formatting?.underline,
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    )}
                  </For>
                </tr>
              )
            }}
          </For>
        </tbody>
      </table>
      <div
        class="grow"
        onDragOver={(e) => handleDragOver(e, -1)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, -1)}
      >
        <div
          class="h-screen border-dashed border-2 border-primary rounded-lg pointer-events-none flex items-center justify-center bg-base-200 transition-opacity"
          classList={{ 'opacity-0': draggingNewColumn() === null }}
        >
          <div class="text-center">
            Ajouter une colonne <br />
            <span>"{draggingNewColumn()}"</span>
          </div>
        </div>
      </div>
    </div>
  )
}
