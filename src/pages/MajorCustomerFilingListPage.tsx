// 大客户备案 - 列表页
// 菜单：整车管理 > 整车采购 > 大客户备案
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, DatePicker, Form, Input, Modal, Select, Space, Table, Tag, message } from '../ui'
import { semanticTokens } from '../theme/tokens'
import {
  majorCustomerFilings,
  FILING_STATUS_OPTIONS,
  FILING_STATUS_COLOR,
  isFilingRemote,
  type MajorCustomerFiling,
  type FilingStatus,
} from '../data/majorCustomerFilings'

export default function MajorCustomerFilingListPage() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  // 原型：本地维护一份可变副本，便于演示取消申请后的状态变化
  const [rows, setRows] = useState<MajorCustomerFiling[]>(() => majorCustomerFilings.map(f => ({ ...f })))
  // 筛选触发计数器：查询/重置/表单变更时自增，驱动 filtered 重算
  const [tick, setTick] = useState(0)
  const bump = () => setTick(t => t + 1)

  const columns = [
    { title: '大客户项目', dataIndex: 'projectName' },
    { title: '大客户编号', dataIndex: 'customerNo', render: (v: string) => v || '-' },
    {
      title: '是否涉及异地发运',
      key: 'involveRemote',
      render: (_: unknown, record: MajorCustomerFiling) => (isFilingRemote(record) ? '是' : '否'),
    },
    { title: '交期截止', dataIndex: 'deadline' },
    {
      title: '备案状态',
      dataIndex: 'status',
      render: (v: FilingStatus) => <Tag color={FILING_STATUS_COLOR[v]}>{v}</Tag>,
    },
    { title: '创建时间', dataIndex: 'createdAt' },
    {
      title: '操作',
      width: 220,
      render: (_: unknown, record: MajorCustomerFiling) => (
        <Space size={12}>
          <a onClick={() => navigate(`/vehicle/purchase/filings/create?key=${record.key}`)}>
            {record.status === '草稿' || record.status === '已驳回' ? '编辑' : '查看'}
          </a>
          {record.status === '已驳回' && <a onClick={() => handleCancel(record)}>取消申请</a>}
          <a onClick={() => navigate(`/vehicle/purchase/filings/create?key=${record.key}#approvals`)}>审批记录</a>
        </Space>
      ),
    },
  ]

  // 取消申请：仅已驳回可执行，二次确认后状态置为已取消
  const handleCancel = (record: MajorCustomerFiling) => {
    Modal.confirm({
      title: '取消备案申请',
      content: '取消后该备案申请将关闭且不可恢复，确认取消？',
      okText: '确认取消',
      cancelText: '再想想',
      okButtonProps: { danger: true },
      onOk: () => {
        setRows(prev => prev.map(r => (r.key === record.key ? { ...r, status: '已取消' } : r)))
        message.success('备案申请已取消')
      },
    })
  }

  // 筛选（原型：在已加载数据中过滤）
  const filtered = useMemo(() => {
    const v = form.getFieldsValue()
    return rows.filter(r => {
      if (v.projectName && !r.projectName.includes(v.projectName)) return false
      if (v.customerNo && !r.customerNo.includes(v.customerNo)) return false
      if (v.status && v.status !== 'all' && r.status !== v.status) return false
      if (v.involveRemote && v.involveRemote !== 'all') {
        const flag = v.involveRemote === 'yes'
        if (isFilingRemote(r) !== flag) return false
      }
      // 交期截止区间过滤（RangePicker 返回 [起, 止] 的 dayjs，按 YYYY-MM-DD 字符串比较）
      if (v.deadline && v.deadline.length === 2) {
        const [start, end] = v.deadline
        if (start && r.deadline < start.format('YYYY-MM-DD')) return false
        if (end && r.deadline > end.format('YYYY-MM-DD')) return false
      }
      return true
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, tick])

  return (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      <Card>
        <Form form={form} layout="horizontal" labelAlign="right" colon={false} onValuesChange={() => bump()}>
          <div className="app-filter-row">
            <div className="app-filter-grid">
              <Form.Item className="app-filter-item" name="projectName" label="大客户项目">
                <Input placeholder="请输入" allowClear />
              </Form.Item>
              <Form.Item className="app-filter-item" name="customerNo" label="大客户编号">
                <Input placeholder="请输入" allowClear />
              </Form.Item>
              <Form.Item className="app-filter-item" name="status" label="备案状态">
                <Select placeholder="请选择" options={FILING_STATUS_OPTIONS} />
              </Form.Item>
              <Form.Item className="app-filter-item" name="involveRemote" label="是否涉及异地发运">
                <Select
                  placeholder="请选择"
                  options={[
                    { value: 'all', label: '全部' },
                    { value: 'yes', label: '是' },
                    { value: 'no', label: '否' },
                  ]}
                />
              </Form.Item>
              <Form.Item className="app-filter-item" name="deadline" label="交期截止">
                <DatePicker.RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </div>

            <div className="app-filter-actions-bar">
              <Space className="app-filter-actions" size={semanticTokens.size.buttonGap}>
                <Button type="primary" onClick={() => bump()}>
                  查询
                </Button>
                <Button
                  className="app-btn-tertiary"
                  onClick={() => {
                    form.resetFields()
                    bump()
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
        title="大客户备案"
        extra={
          <Space className="app-table-actions" size={semanticTokens.size.buttonGap}>
            <Button type="primary" onClick={() => navigate('/vehicle/purchase/filings/create')}>
              新增
            </Button>
            <Button className="app-btn-tertiary" onClick={() => bump()}>
              刷新
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filtered}
          locale={{ emptyText: '暂无备案数据' }}
        />
      </Card>
    </Space>
  )
}
