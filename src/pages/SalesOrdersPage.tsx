import { type ReactNode, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, DatePicker, Drawer, Form, Input, Select, Space, Table } from '../ui'
import { semanticTokens } from '../theme/tokens'

function Annotated(props: { index: number; onClick: () => void; children: ReactNode }) {
  return (
    <div style={{ position: 'relative', overflow: 'visible' }}>
      {props.children}
      <Button
        type="primary"
        shape="circle"
        size="small"
        onClick={props.onClick}
        style={{ position: 'absolute', top: semanticTokens.size.pagePadding, left: semanticTokens.size.pagePadding, zIndex: 10 }}
      >
        {props.index}
      </Button>
    </div>
  )
}

export default function SalesOrdersPage() {
  const [form] = Form.useForm()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeKey, setActiveKey] = useState<'filters' | 'list'>('filters')

  type SalesOrderRow = { key: string; orderNo: string }

  const annotations: Record<typeof activeKey, { title: string; content: ReactNode }> = {
    filters: {
      title: '筛选区说明',
      content: (
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <div>这里的筛选项用于快速定位订单：订单编号、关键字、状态、创建日期。</div>
          <div>点击“查询”提交筛选条件；点击“重置”清空输入。</div>
        </Space>
      ),
    },
    list: {
      title: '订单列表说明',
      content: (
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <div>这里展示查询结果列表；可通过“新建订单 / 导出 / 取消 / 刷新”进行操作。</div>
          <div>“查看”进入订单详情。</div>
        </Space>
      ),
    },
  }

  const openAnnotation = (key: typeof activeKey) => {
    setActiveKey(key)
    setDrawerOpen(true)
  }

  const columns = [
    { title: '订单编号', dataIndex: 'orderNo' },
    { title: '客户', dataIndex: 'customer' },
    { title: '手机号', dataIndex: 'phone' },
    { title: '车型', dataIndex: 'model' },
    { title: '状态', dataIndex: 'status' },
    { title: '创建时间', dataIndex: 'createdAt' },
    { title: '操作', render: (_: unknown, record: SalesOrderRow) => <Link to={`/sales/orders/${encodeURIComponent(record.orderNo)}`}>查看</Link> },
  ]

  const dataSource = [
    { key: '1', orderNo: 'SO-20260415-0001', customer: '张三', phone: '138****5678', model: '宋PLUS EV', status: '待审核', createdAt: '2026-04-15 10:23' },
    { key: '2', orderNo: 'SO-20260415-0002', customer: '李四', phone: '139****3210', model: '海豹DM-i', status: '已审核', createdAt: '2026-04-15 09:15' },
  ]

  const active = annotations[activeKey]

  return (
    <>
      <Button
        type="primary"
        onClick={() => setDrawerOpen(true)}
        style={{ position: 'fixed', top: semanticTokens.size.pagePadding, right: semanticTokens.size.pagePadding, zIndex: 9999 }}
      >
        标注说明
      </Button>

      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <Annotated index={1} onClick={() => openAnnotation('filters')}>
          <Card>
            <Form form={form} layout="horizontal" labelAlign="right" colon={false}>
              <div className="app-filter-row">
                <div className="app-filter-grid">
                  <Form.Item className="app-filter-item" name="orderNo" label="订单编号">
                    <Input placeholder="请输入" />
                  </Form.Item>

                  <Form.Item className="app-filter-item" name="keyword" label="关键字">
                    <Input placeholder="客户/手机号/VIN" />
                  </Form.Item>

                  <Form.Item className="app-filter-item" name="status" label="订单状态">
                    <Select
                      placeholder="请选择"
                      options={[
                        { value: 'all', label: '全部' },
                        { value: 'pending', label: '待审核' },
                        { value: 'approved', label: '已审核' },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item className="app-filter-item" name="createdAt" label="创建日期">
                    <DatePicker.RangePicker />
                  </Form.Item>
                </div>

                <div className="app-filter-actions-bar">
                  <Space className="app-filter-actions" size={semanticTokens.size.buttonGap}>
                    <Button type="primary">查询</Button>
                    <Button className="app-btn-tertiary" onClick={() => form.resetFields()}>
                      重置
                    </Button>
                  </Space>
                </div>
              </div>
            </Form>
          </Card>
        </Annotated>

        <Annotated index={2} onClick={() => openAnnotation('list')}>
          <Card
            className="app-table-card"
            title="订单列表"
            extra={
              <Space className="app-table-actions" size={semanticTokens.size.buttonGap}>
                <Button type="primary">新建订单</Button>
                <Button className="app-btn-secondary">导出</Button>
                <Button type="primary" danger>
                  取消
                </Button>
                <Button className="app-btn-tertiary">刷新</Button>
              </Space>
            }
          >
            <Table columns={columns} dataSource={dataSource} />
          </Card>
        </Annotated>
      </Space>

      <Drawer open={drawerOpen} placement="right" title={active.title} onClose={() => setDrawerOpen(false)}>
        {active.content}
      </Drawer>
    </>
  )
}
