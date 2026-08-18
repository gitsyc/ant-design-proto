// src/layouts/AdminLayout.tsx
import { useEffect, useMemo, useState } from 'react'
import { Dropdown, Input, Layout, Menu, Space } from '../ui'
import { LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from '../ui/icons'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { semanticTokens } from '../theme/tokens'
import { useAppToken } from '../theme/AppThemeProvider'
import { AnnotationOverlay } from '../components/Annotation/AnnotationOverlay'

const { Header, Sider, Content } = Layout

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const { token } = useAppToken()
  const [siderWidth, setSiderWidth] = useState<number>(semanticTokens.size.siderWidth)

  useEffect(() => {
    const update = () => {
      const ideal = (window.innerWidth * semanticTokens.size.siderWidthPercent) / 100
      const next = Math.round(Math.min(Math.max(ideal, semanticTokens.size.siderMinWidth), semanticTokens.size.siderMaxWidth))
      setSiderWidth(next)
    }

    update()
    window.addEventListener('resize', update, { passive: true })
    return () => window.removeEventListener('resize', update)
  }, [])

  const topItems = useMemo(
    () => [
      { key: '/vehicle', label: <Link to="/vehicle/purchase/orders">整车管理</Link> },
      { key: '/sales', label: <Link to="/sales/orders">增值服务</Link> },
      { key: '/inventory', label: <Link to="/inventory/cars">市场管理</Link> },
      { key: '/system', label: <Link to="/system/users">财务管理</Link> },
    ],
    []
  )

  const siderItems = useMemo(
    () => [
      {
        key: 'vehicle-management',
        label: '车辆管理',
        children: [
          {
            key: '/vehicle/archives',
            label: <Link to="/vehicle/archives">车档列表</Link>,
          },
        ],
      },
      {
        key: 'vehicle-purchase',
        label: '整车采购',
        children: [
          {
            key: '/vehicle/purchase/filings',
            label: <Link to="/vehicle/purchase/filings">大客户备案</Link>,
          },
          {
            key: '/vehicle/purchase/orders',
            label: <Link to="/vehicle/purchase/orders">采购订单</Link>,
          },
        ],
      },
      {
        key: 'sales',
        label: '整车销售',
        children: [
          { key: '/sales/orders', label: <Link to="/sales/orders">订单列表</Link> },
          { key: '/sales/unbind-applies', label: <Link to="/sales/unbind-applies">解绑申请</Link> },
        ],
      },
      {
        key: 'customers',
        label: '客户管理',
        children: [
          { key: '/customers/list', label: <Link to="/customers/list">客户列表</Link> },
        ],
      },
    ],
    []
  )

  const userMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: '个人信息' },
      { key: 'logout', icon: <LogoutOutlined />, label: '退出登录' },
    ],
  }

  // 将详情/新建等子路由映射到对应的菜单叶子，保证高亮正确
  const selectedMenuKey = useMemo(() => {
    const path = location.pathname
    if (path.startsWith('/vehicle/purchase/filings')) return '/vehicle/purchase/filings'
    if (path.startsWith('/vehicle/purchase')) return '/vehicle/purchase/orders'
    if (path.startsWith('/sales/orders')) return '/sales/orders'
    if (path.startsWith('/sales/unbind-applies')) return '/sales/unbind-applies'
    return path
  }, [location.pathname])
  const openKeys = ['vehicle-management', 'vehicle-purchase', 'sales', 'customers']

  return (
    <Layout style={{ minHeight: '100vh', background: token.colorBgLayout, overflowX: 'hidden' }}>
      <Sider
        className="app-sider"
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={siderWidth}
        collapsedWidth={semanticTokens.size.siderCollapsedWidth}
        style={{
          background: semanticTokens.color.siderBg,
          ['--app-sider-bg' as never]: semanticTokens.color.siderBg,
          ['--app-sider-active-bg' as never]: semanticTokens.color.siderItemActiveBg,
          ['--app-sider-text' as never]: semanticTokens.color.siderText,
          ['--app-sider-active-text' as never]: semanticTokens.color.siderActiveText,
          ['--app-sider-item-radius' as never]: `${semanticTokens.radius.menuItem}px`,
          ['--app-sider-leaf-indent' as never]: `${semanticTokens.size.siderLeafIndent}px`,
          ['--app-sider-menu-font-size' as never]: `${semanticTokens.size.siderMenuFontSize}px`,
        }}
      >
        <div
          style={{
            height: semanticTokens.size.headerHeight,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            color: semanticTokens.color.siderText,
            fontWeight: 800,
          }}
        >
          BYD
        </div>

        <Menu
          mode="inline"
          theme="light"
          items={siderItems}
          selectedKeys={[selectedMenuKey]}
          defaultOpenKeys={openKeys}
          style={{ background: 'transparent' }}
        />
      </Sider>

      <Layout style={{ minWidth: 0 }}>
        <Header
          className="app-header"
          style={{
            background: token.colorBgContainer,
            padding: '0 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            minWidth: 0,
            ['--app-top-menu-font-size' as never]: `${semanticTokens.size.topNavMenuFontSize}px`,
          }}
        >
          <Space size={12} align="center" style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{ cursor: 'pointer', fontSize: 18, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => setCollapsed(v => !v)}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>

            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <Menu mode="horizontal" items={topItems} selectedKeys={[]} style={{ borderBottom: 'none' }} />
            </div>
          </Space>

          <Space size={12} align="center">
            <Input.Search placeholder="搜索" allowClear style={{ width: 240 }} />
            <Dropdown menu={userMenu} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <UserOutlined />
                <span>用户</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content
          className="app-content"
          style={{
            padding: semanticTokens.size.pagePadding,
            background: token.colorBgLayout,
            minWidth: 0,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
      <AnnotationOverlay />
    </Layout>
  )
}
