## 项目规约（必须遵守）

### 1. 组件库存（强制）
- 禁止：直接从 `antd` 引入组件。
- 禁止：直接从 `@ant-design/icons` 引入图标。
- 必须：组件统一从 `src/ui/index.ts` 引入（例如 `import { Button } from '../ui'`）。
- 必须：图标统一从 `src/ui/icons.ts` 引入（例如 `import { UserOutlined } from '../ui/icons'`）。
- 若需要新组件/新图标：先把它补到 `src/ui/index.ts` 或 `src/ui/icons.ts`，页面再从统一出口引入。

### 2. 视觉令牌 / 主题（强制）
- 视觉令牌唯一来源：`src/theme/tokens.ts`（`semanticTokens`）。
- Ant Design 主题配置：`src/theme/antdTheme.ts`，必须从 `semanticTokens` 映射到 antd token（例如 `borderRadius`、`colorPrimary`）。
- 应用入口必须包裹主题提供者：`src/main.tsx` 使用 `AppThemeProvider`。
- 样式使用原则：
  - 优先：`useAppToken()` 获取 antd token（例如 `token.colorBgLayout`、`token.colorBgContainer`）。
  - 其次：使用 `semanticTokens` 中的业务语义 token（例如 `semanticTokens.color.siderBg`、`semanticTokens.radius.button`）。
  - 禁止：在页面/布局中硬编码颜色值与圆角值（例如 `#fff`、`#f4f6fb`、`borderRadius: 8`）。
- 字号/颜色等基础视觉必须通过主题与 token 统一生效，禁止页面里单独手写字号/颜色。
- 代码源头：`src/theme/tokens.ts`、`src/theme/antdTheme.ts`、`src/theme/AppThemeProvider.tsx`、`src/index.css`。

### 3. 导航规范（强制）
- 左侧导航（Sider）：
  - 背景色/文字色/交互色只能来自 `semanticTokens.color.siderBg` / `semanticTokens.color.siderText` / `semanticTokens.color.siderItemActiveBg` / `semanticTokens.color.siderActiveText`，禁止页面/布局里写字面量颜色。
  - 宽度：以 `semanticTokens.size.siderWidthPercent` 为目标比例，并用 `semanticTokens.size.siderMinWidth/siderMaxWidth` 做宽度钳制；折叠宽度用 `semanticTokens.size.siderCollapsedWidth`。
  - 子菜单叶子缩进：`semanticTokens.size.siderLeafIndent` 统一控制，禁止在页面/布局里单独手写 padding。
  - 菜单字号：`semanticTokens.size.siderMenuFontSize` 统一控制，禁止页面/布局里单独手写字号。
  - 菜单圆角：`semanticTokens.radius.menuItem` 统一控制，禁止单独在页面/布局里写圆角。
- 顶部导航（Top Nav）：
  - 菜单字号：`semanticTokens.size.topNavMenuFontSize` 统一控制，禁止页面/布局里单独手写字号。
- 样式落地依赖全局样式与 CSS 变量：布局需使用 `className="app-sider"` / `className="app-header"`。
- 代码源头：`src/theme/tokens.ts`、`src/index.css`、`src/layouts/AdminLayout.tsx`。

### 4. 按钮规范（强制）
- 圆角：只能通过 `semanticTokens.radius.button` 配置，并在 `src/theme/antdTheme.ts` 中映射到 `token.borderRadius`。
- 间距：动作区按钮必须使用 `Space size={semanticTokens.size.buttonGap}`。
- 尺寸规范：
  - 列表表头操作区按钮：必须放在 `Space className="app-table-actions"` 中，由全局样式统一控制尺寸与字号。
  - 筛选区操作区按钮：必须放在 `Space className="app-filter-actions"` 中，由全局样式统一控制尺寸与字号。
- 语义按钮用法：
  - 主按钮（新增/添加/查询）：`type="primary"`。
  - 危险操作（删除/撤销/取消）：`type="primary" danger`。
  - 次按钮（导出）：`className="app-btn-secondary"`。
  - 最次要按钮（重置/刷新）：`className="app-btn-tertiary"`。
- 禁止：在页面里手写按钮颜色/边框色/hover 交互色；必须通过 `semanticTokens` + 全局样式统一配置。
- 代码源头：`src/theme/tokens.ts`、`src/theme/antdTheme.ts`、`src/theme/AppThemeProvider.tsx`、`src/index.css`。

### 5. 列表页（Table）规范（强制）
- 表头样式：底色/文字色必须来自 `semanticTokens.color.tableHeaderBg` / `semanticTokens.color.tableHeaderText`，禁止页面单独覆写。
- 表头字重：必须加粗，通过 `semanticTokens.size.tableHeaderFontWeight`统一控制，禁止页面单独覆写。
- 圆角：只能使用 `semanticTokens.radius.table`，禁止在页面里单独写圆角。
- 行高：表头/内容行高分别使用 `semanticTokens.size.tableHeaderHeight` / `semanticTokens.size.tableRowHeight`，禁止通过 padding/height 局部调整。
- 文案样式：字号使用 `semanticTokens.size.tableCellFontSize`；操作列颜色使用 `semanticTokens.color.tableActionText`；其它列文字色使用 `semanticTokens.color.tableCellText`。
- Card 包裹：若 Table 外层使用 Card，必须加 `className="app-table-card"`，圆角与内边距由 `semanticTokens.size.tableCardBodyPadding*` + 全局样式统一控制。
- 分页：全工程统一使用 `src/ui` 导出的 `Table` 默认分页能力；必须展示总条数（showTotal）并开启每页条数选择（showSizeChanger），禁止关闭。
- 代码源头：`src/theme/tokens.ts`、`src/theme/AppThemeProvider.tsx`、`src/index.css`、`src/ui/Table.tsx`。

### 6. 筛选区布局（强制）
- 结构：一行放三个筛选项；每个筛选项为“标题区 + 输入框区”同一行排列。布局与尺寸由 `semanticTokens.size.filter*` + 全局样式统一控制。
- 必须使用：
  - 容器：`className="app-filter-row"`，内部包含 `div.app-filter-grid`（筛选项区域）与 `div.app-filter-actions-bar`（按钮区）。
  - 筛选项：使用组件库的 `Form.Item`，并统一加 `className="app-filter-item"`（例如 `Form.Item className="app-filter-item" name="xxx" label="标题"`）。
  - 操作按钮区：`Space className="app-filter-actions"`。
- 禁止：在页面/组件里手写筛选区尺寸、间距、label 颜色与字号等字面量。
- 代码源头：`src/theme/tokens.ts`、`src/theme/AppThemeProvider.tsx`、`src/index.css`。

### 7. 内容区列表（ul/ol）排版（强制）
- `.app-content` 范围内的普通 HTML 列表（`ul/ol`）缩进与上下间距：统一由全局样式控制（对应 token：`semanticTokens.size.contentList*`）。
- 禁止：在页面/组件里为 `ul/ol` 零散手写 `margin`/`padding` 来修复 `antd/dist/reset.css` 导致的列表间距问题。
- 若确需特殊列表样式：为列表容器加业务 class，并在 `src/index.css` 集中维护（避免影响 antd 组件内部的 `ul`，如分页等）。
- 代码源头：`src/theme/tokens.ts`、`src/theme/AppThemeProvider.tsx`、`src/index.css`。

### 8. 页面与路由（强制）
- 页面文件统一放在 `src/pages/*Page.tsx`，并且使用默认导出组件。
- 布局文件统一放在 `src/layouts/*Layout.tsx`。
- 新增页面时必须补齐路由入口（当前路由在 `src/main.tsx` 的 `Routes` 中）。
- 代码源头：`src/main.tsx`。

### 9. Trae AI 生成页面输出要求（强制）
- 生成页面前先从 PRD 提取：页面目标、数据结构、筛选字段、表格列、按钮与交互、状态枚举、跳转路径。
- 生成页面后必须自检并确保满足：
  - 未出现 `import ... from 'antd'` 与 `import ... from '@ant-design/icons'`
  - 页面/布局未硬编码颜色、圆角、字号、间距等字面量
  - 组件全部从 `src/ui` / `src/ui/icons` 引入
  - 视觉令牌全部来自 `semanticTokens` 或 `useAppToken()`
