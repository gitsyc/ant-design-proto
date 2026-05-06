import { Button, Card, DatePicker, Form, Input, Select, Space, Table } from '../ui'
import { semanticTokens } from '../theme/tokens'

export default function SalesOrdersPage() {
  const [form] = Form.useForm()

  const columns = [
    { title: '订单编号', dataIndex: 'orderNo' },
    { title: '客户', dataIndex: 'customer' },
    { title: '手机号', dataIndex: 'phone' },
    { title: '车型', dataIndex: 'model' },
    { title: '状态', dataIndex: 'status' },
    { title: '创建时间', dataIndex: 'createdAt' },
    { title: '操作', render: () => <a>查看</a> },
  ]

  const dataSource = [
    { key: '1', orderNo: 'SO-20260415-0001', customer: '张三', phone: '138****5678', model: '宋PLUS EV', status: '待审核', createdAt: '2026-04-15 10:23' },
    { key: '2', orderNo: 'SO-20260415-0002', customer: '李四', phone: '139****3210', model: '海豹DM-i', status: '已审核', createdAt: '2026-04-15 09:15' },
  ]

  return (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
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
    </Space>
  )
}
