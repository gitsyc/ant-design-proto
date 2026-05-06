import type { ThemeConfig } from 'antd'
import { semanticTokens } from './tokens'

export const antdTheme: ThemeConfig = {
  token: {
    borderRadius: semanticTokens.radius.button,
    colorError: semanticTokens.color.buttonDangerBg,
    colorPrimary: semanticTokens.color.buttonPrimaryBg,
    colorSuccess: semanticTokens.color.buttonSecondaryBg,
    colorText: semanticTokens.color.controlText,
    colorTextLightSolid: semanticTokens.color.buttonTextOnSolid,
    fontSize: semanticTokens.size.controlFontSize,
  },
}
