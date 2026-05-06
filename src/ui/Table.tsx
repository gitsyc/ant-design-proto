import { Table as AntTable } from 'antd'
import type { TableProps } from 'antd'

const defaultPageSizeOptions = ['10', '20', '50', '100']

export function Table<RecordType extends object = Record<string, unknown>>(props: TableProps<RecordType>) {
  const { pagination, scroll, ...rest } = props

  if (pagination === false) {
    const baseScroll = typeof scroll === 'object' ? scroll : undefined
    const mergedScroll = baseScroll ? { ...baseScroll, x: baseScroll.x ?? 'max-content' } : { x: 'max-content' }
    return <AntTable {...rest} pagination={false} scroll={mergedScroll} />
  }

  const basePagination = typeof pagination === 'object' ? pagination : undefined
  const baseScroll = typeof scroll === 'object' ? scroll : undefined
  const mergedScroll = baseScroll ? { ...baseScroll, x: baseScroll.x ?? 'max-content' } : { x: 'max-content' }

  return (
    <AntTable
      {...rest}
      scroll={mergedScroll}
      pagination={{
        ...basePagination,
        showTotal: basePagination?.showTotal ?? (total => `共 ${total} 条`),
        showSizeChanger: true,
        pageSizeOptions: basePagination?.pageSizeOptions ?? defaultPageSizeOptions,
      }}
    />
  )
}
