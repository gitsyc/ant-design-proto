import { useEffect, type ReactNode } from 'react'
import { App as AntdApp, ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { antdTheme } from './antdTheme'
import { semanticTokens } from './tokens'

// 日期面板（星期、月份、「今天」等）依赖 dayjs 语言包；占位符依赖 antd locale
dayjs.locale('zh-cn')

export function AppThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.style.setProperty('--app-table-header-bg', semanticTokens.color.tableHeaderBg)
    document.documentElement.style.setProperty('--app-table-header-text', semanticTokens.color.tableHeaderText)
    document.documentElement.style.setProperty('--app-table-radius', `${semanticTokens.radius.table}px`)
    document.documentElement.style.setProperty('--app-table-header-height', `${semanticTokens.size.tableHeaderHeight}px`)
    document.documentElement.style.setProperty('--app-table-row-height', `${semanticTokens.size.tableRowHeight}px`)
    document.documentElement.style.setProperty('--app-table-card-body-padding-top', `${semanticTokens.size.tableCardBodyPaddingTop}px`)
    document.documentElement.style.setProperty('--app-table-card-body-padding-bottom', `${semanticTokens.size.tableCardBodyPaddingBottom}px`)
    document.documentElement.style.setProperty('--app-table-card-body-padding-x', `${semanticTokens.size.tableCardBodyPaddingX}px`)
    document.documentElement.style.setProperty('--app-btn-secondary-bg', semanticTokens.color.buttonSecondaryBg)
    document.documentElement.style.setProperty('--app-btn-danger-bg', semanticTokens.color.buttonDangerBg)
    document.documentElement.style.setProperty('--app-btn-tertiary-bg', semanticTokens.color.buttonTertiaryBg)
    document.documentElement.style.setProperty('--app-btn-tertiary-border', semanticTokens.color.buttonTertiaryBorder)
    document.documentElement.style.setProperty('--app-btn-tertiary-text', semanticTokens.color.buttonTertiaryText)
    document.documentElement.style.setProperty('--app-btn-gap', `${semanticTokens.size.buttonGap}px`)
    document.documentElement.style.setProperty('--app-btn-font-size', `${semanticTokens.size.buttonFontSize}px`)
    document.documentElement.style.setProperty('--app-content-list-margin-top', `${semanticTokens.size.contentListMarginTop}px`)
    document.documentElement.style.setProperty('--app-content-list-margin-bottom', `${semanticTokens.size.contentListMarginBottom}px`)
    document.documentElement.style.setProperty('--app-content-list-padding-start', `${semanticTokens.size.contentListPaddingStart}px`)
    document.documentElement.style.setProperty('--app-content-list-item-gap', `${semanticTokens.size.contentListItemGap}px`)
    document.documentElement.style.setProperty('--app-filter-btn-width', `${semanticTokens.size.filterActionButtonWidth}px`)
    document.documentElement.style.setProperty('--app-filter-btn-height', `${semanticTokens.size.filterActionButtonHeight}px`)
    document.documentElement.style.setProperty('--app-table-header-btn-width', `${semanticTokens.size.tableHeaderActionButtonWidth}px`)
    document.documentElement.style.setProperty('--app-table-header-btn-height', `${semanticTokens.size.tableHeaderActionButtonHeight}px`)
    document.documentElement.style.setProperty('--app-filter-item-width', `${semanticTokens.size.filterItemWidth}px`)
    document.documentElement.style.setProperty('--app-filter-item-height', `${semanticTokens.size.filterItemHeight}px`)
    document.documentElement.style.setProperty('--app-filter-item-gap', `${semanticTokens.size.filterItemGap}px`)
    document.documentElement.style.setProperty('--app-filter-label-width', `${semanticTokens.size.filterLabelWidth}px`)
    document.documentElement.style.setProperty('--app-filter-label-height', `${semanticTokens.size.filterLabelHeight}px`)
    document.documentElement.style.setProperty('--app-filter-label-font-size', `${semanticTokens.size.filterLabelFontSize}px`)
    document.documentElement.style.setProperty('--app-filter-label-color', semanticTokens.color.filterLabelText)
    document.documentElement.style.setProperty('--app-filter-input-width', `${semanticTokens.size.filterInputWidth}px`)
    document.documentElement.style.setProperty('--app-filter-input-height', `${semanticTokens.size.filterInputHeight}px`)
    document.documentElement.style.setProperty('--app-table-cell-text', semanticTokens.color.tableCellText)
    document.documentElement.style.setProperty('--app-table-action-text', semanticTokens.color.tableActionText)
    document.documentElement.style.setProperty('--app-table-cell-font-size', `${semanticTokens.size.tableCellFontSize}px`)
    document.documentElement.style.setProperty('--app-table-header-font-weight', `${semanticTokens.size.tableHeaderFontWeight}`)
  }, [])

  return (
    <ConfigProvider locale={zhCN} theme={antdTheme}>
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  )
}

export const useAppToken = () => theme.useToken()
