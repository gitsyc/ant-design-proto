// 大客户备案 - 列表页
// 菜单：整车管理 > 整车采购 > 大客户备案
// 筛选项、列表列、工具栏按原系统：查询点按钮触发；操作列为查看，已保存另显示编辑
import { useMemo, useState, type Key } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import { Button, Card, Checkbox, DatePicker, Dropdown, Form, Input, Modal, Select, Space, Table, Tag, message } from '../ui'
import { AppstoreOutlined, DownloadOutlined, PlusOutlined, ReloadOutlined } from '../ui/icons'
import { semanticTokens } from '../theme/tokens'
import {
  CURRENT_DEALER_NAME,
  FILING_STATUS_COLOR,
  FILING_STATUS_OPTIONS,
  GROUP_OPTIONS,
  majorCustomerFilings,
  type FilingStatus,
  type MajorCustomerFiling,
} from '../data/majorCustomerFilings'

type QueryValues = {
  groupName?: string
  keyword?: string
  projectName?: string
  status?: FilingStatus
  deadline?: { format: (s: string) => string }[]
}

const TOGGLE_COLUMNS = [
  { key: 'customerNo', title: '大客户编号' },
  { key: 'crmNo', title: 'CRM单据编号' },
  { key: 'status', title: '单据状态' },
  { key: 'network', title: '网络' },
  { key: 'dealerName', title: '经销商' },
  { key: 'dealerCode', title: '经销商代码' },
  { key: 'projectName', title: '大客户项目' },
  { key: 'deadline', title: '交期截止' },
  { key: 'groupCode', title: '集团编码' },
  { key: 'groupName', title: '集团' },
] as const

const DEFAULT_VISIBLE = TOGGLE_COLUMNS.map(c => c.key)

export default function MajorCustomerFilingListPage() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [rows, setRows] = useState<MajorCustomerFiling[]>(() => majorCustomerFilings.map(f => ({ ...f })))
  const [query, setQuery] = useState<QueryValues>({})
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([])
  const [visibleCols, setVisibleCols] = useState<string[]>(DEFAULT_VISIBLE)
  const [page, setPage] = useState({ current: 1, pageSize: 10 })

  const applyQuery = () => {
    setQuery({ ...(form.getFieldsValue() as QueryValues) })
    setPage(p => ({ ...p, current: 1 }))
  }

  const filtered = useMemo(() => {
    return rows.filter(r => {
      if (query.groupName && r.groupName !== query.groupName) return false
      if (query.keyword) {
        const kw = String(query.keyword)
        const hit = r.customerNo.includes(kw) || (r.crmNo ?? '').includes(kw)
        if (!hit) return false
      }
      if (query.projectName && !r.projectName.includes(query.projectName)) return false
      if (query.status && r.status !== query.status) return false
      if (query.deadline && query.deadline.length === 2) {
        const [start, end] = query.deadline
        if (start && r.deadline < start.format('YYYY-MM-DD')) return false
        if (end && r.deadline > end.format('YYYY-MM-DD')) return false
      }
      return true
    })
  }, [rows, query])

  const colVisible = (key: string) => visibleCols.includes(key)

  const columns: ColumnsType<MajorCustomerFiling> = [
    {
      title: '序号',
      width: 64,
      align: 'center',
      render: (_: unknown, __: MajorCustomerFiling, index: number) => (page.current - 1) * page.pageSize + index + 1,
    },
    {
      title: '大客户编号',
      dataIndex: 'customerNo',
      hidden: !colVisible('customerNo'),
      render: (v: string, record) => (
        <a onClick={() => navigate(`/vehicle/purchase/filings/create?key=${record.key}&mode=view`)}>{v || '-'}</a>
      ),
    },
    { title: 'CRM单据编号', dataIndex: 'crmNo', hidden: !colVisible('crmNo'), render: (v: string) => v || '-' },
    {
      title: '单据状态',
      dataIndex: 'status',
      hidden: !colVisible('status'),
      render: (v: FilingStatus) => <Tag color={FILING_STATUS_COLOR[v]}>{v}</Tag>,
    },
    { title: '网络', dataIndex: 'network', hidden: !colVisible('network') },
    { title: '经销商', dataIndex: 'dealerName', hidden: !colVisible('dealerName') },
    { title: '经销商代码', dataIndex: 'dealerCode', hidden: !colVisible('dealerCode') },
    { title: '大客户项目', dataIndex: 'projectName', hidden: !colVisible('projectName') },
    { title: '交期截止', dataIndex: 'deadline', hidden: !colVisible('deadline') },
    { title: '集团编码', dataIndex: 'groupCode', hidden: !colVisible('groupCode') },
    { title: '集团', dataIndex: 'groupName', hidden: !colVisible('groupName') },
    {
      title: '操作',
      width: 140,
      fixed: 'right',
      render: (_: unknown, record: MajorCustomerFiling) => (
        <Space size={12}>
          <a onClick={() => navigate(`/vehicle/purchase/filings/create?key=${record.key}&mode=view`)}>查看</a>
          {record.status === '已保存' && (
            <a onClick={() => navigate(`/vehicle/purchase/filings/create?key=${record.key}`)}>编辑</a>
          )}
        </Space>
      ),
    },
  ]

  // 工具栏取消：仅已保存的勾选行可取消
  const handleBatchCancel = () => {
    if (selectedKeys.length === 0) {
      message.warning('请先选择要取消的备案')
      return
    }
    const selected = rows.filter(r => selectedKeys.includes(r.key))
    if (selected.some(r => r.status !== '已保存')) {
      message.warning('仅已保存的备案可以取消')
      return
    }
    Modal.confirm({
      title: '取消备案',
      content: `确认取消已选的 ${selected.length} 条备案？取消后不可恢复。`,
      okText: '确认取消',
      cancelText: '再想想',
      okButtonProps: { danger: true },
      onOk: () => {
        setRows(prev => prev.map(r => (selectedKeys.includes(r.key) ? { ...r, status: '已取消' } : r)))
        setSelectedKeys([])
        message.success('备案已取消')
      },
    })
  }

  const toggleCol = (key: string, checked: boolean) => {
    setVisibleCols(prev => (checked ? [...prev, key] : prev.filter(k => k !== key)))
  }

  return (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      <Card>
        <Form form={form} layout="horizontal" labelAlign="right" colon={false}>
          <div className="app-filter-row">
            <div className="app-filter-grid">
              <Form.Item className="app-filter-item" name="groupName" label="集团">
                <Select placeholder="请选择" allowClear options={GROUP_OPTIONS} />
              </Form.Item>
              <Form.Item className="app-filter-item" label="经销商">
                <Input value={CURRENT_DEALER_NAME} disabled />
              </Form.Item>
              <Form.Item className="app-filter-item" name="keyword" label="关键字">
                <Input placeholder="DIP/CRM大客户编号" allowClear />
              </Form.Item>
              <Form.Item className="app-filter-item" name="projectName" label="大客户项目">
                <Input placeholder="大客户项目" allowClear />
              </Form.Item>
              <Form.Item className="app-filter-item" name="deadline" label="交期截止">
                <DatePicker.RangePicker style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} />
              </Form.Item>
              <Form.Item className="app-filter-item" name="status" label="状态">
                <Select
                  placeholder="请选择"
                  allowClear
                  options={FILING_STATUS_OPTIONS.filter(o => o.value !== 'all')}
                />
              </Form.Item>
            </div>
            <div className="app-filter-actions-bar">
              <Space className="app-filter-actions" size={semanticTokens.size.buttonGap}>
                <Button type="primary" onClick={applyQuery}>查询</Button>
                <Button
                  className="app-btn-tertiary"
                  onClick={() => {
                    form.resetFields()
                    setQuery({})
                    setPage(p => ({ ...p, current: 1 }))
                  }}
                >
                  重置
                </Button>
              </Space>
            </div>
          </div>
        </Form>
      </Card>

      <Card
        className="app-table-card"
        title="大客户备案列表"
        extra={
          <Space size={semanticTokens.size.buttonGap}>
            <Space className="app-table-actions" size={semanticTokens.size.buttonGap}>
              <Button type="primary" danger onClick={handleBatchCancel}>取消</Button>
              <Button className="app-btn-secondary" icon={<DownloadOutlined />} onClick={() => message.success('导出成功')}>
                导出
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/vehicle/purchase/filings/create')}>
                新增
              </Button>
              <Button className="app-btn-tertiary" icon={<ReloadOutlined />} onClick={applyQuery}>刷新</Button>
            </Space>
            <Dropdown
              trigger={['click']}
              popupRender={() => (
                <div style={{ padding: '8px 12px', background: '#fff', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                  {TOGGLE_COLUMNS.map(c => (
                    <div key={c.key} style={{ padding: '4px 0' }}>
                      <Checkbox checked={colVisible(c.key)} onChange={e => toggleCol(c.key, e.target.checked)}>
                        {c.title}
                      </Checkbox>
                    </div>
                  ))}
                </div>
              )}
            >
              <Button className="app-btn-tertiary" icon={<AppstoreOutlined />} style={{ width: 30, height: 30, padding: 0 }} />
            </Dropdown>
          </Space>
        }
      >
        <Table
          rowSelection={{
            selectedRowKeys: selectedKeys,
            onChange: keys => setSelectedKeys(keys),
          }}
          columns={columns}
          dataSource={filtered}
          pagination={{
            current: page.current,
            pageSize: page.pageSize,
            onChange: (current, pageSize) => setPage({ current, pageSize }),
          }}
          locale={{ emptyText: '暂无备案数据' }}
        />
      </Card>
    </Space>
  )
}
