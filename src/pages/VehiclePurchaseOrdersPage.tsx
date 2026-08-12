import { useNavigate } from 'react-router-dom'
import { Button, Card, Form, Input, Select, Space, Table } from '../ui'
import { semanticTokens } from '../theme/tokens'

export default function VehiclePurchaseOrdersPage() {
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const columns = [
    { title: '采购单号', dataIndex: 'purchaseNo' },
    { title: '采购类型', dataIndex: 'purchaseType' },
    { title: '供应商', dataIndex: 'supplier' },
    { title: '车型', dataIndex: 'model' },
    { title: '数量', dataIndex: 'quantity' },
    { title: '含税总额', dataIndex: 'amount' },
    { title: '状态', dataIndex: 'status' },
    { title: '创建日期', dataIndex: 'createdAt' },
    { title: '操作', render: () => <a>查看</a> },
  ]

  const dataSource = [
    {
      key: '1',
      purchaseNo: 'PO-20260430-0001',
      purchaseType: '现货采购',
      supplier: '比亚迪厂家',
      model: '汉EV',
      quantity: 10,
      amount: '¥ 2,580,000.00',
      status: '待确认',
      createdAt: '2026-04-30',
    },
    {
      key: '2',
      purchaseNo: 'PO-20260430-0002',
      purchaseType: '订单采购',
      supplier: '区域供应商A',
      model: '宋PLUS DM-i',
      quantity: 6,
      amount: '¥ 928,800.00',
      status: '采购中',
      createdAt: '2026-04-30',
    },
    {
      key: '3',
      purchaseNo: 'PO-20260430-0003',
      purchaseType: '现货采购',
      supplier: '区域供应商B',
      model: '唐DM-i',
      quantity: 4,
      amount: '¥ 879,200.00',
      status: '待确认',
      createdAt: '2026-04-29',
    },
    {
      key: '4',
      purchaseNo: 'PO-20260430-0004',
      purchaseType: '订单采购',
      supplier: '区域供应商C',
      model: '海豹DM-i',
      quantity: 8,
      amount: '¥ 1,358,400.00',
      status: '采购中',
      createdAt: '2026-04-29',
    },
    {
      key: '5',
      purchaseNo: 'PO-20260430-0005',
      purchaseType: '现货采购',
      supplier: '比亚迪厂家',
      model: '秦PLUS DM-i',
      quantity: 12,
      amount: '¥ 1,137,600.00',
      status: '已完成',
      createdAt: '2026-04-28',
    },
    {
      key: '6',
      purchaseNo: 'PO-20260430-0006',
      purchaseType: '订单采购',
      supplier: '区域供应商A',
      model: '元PLUS',
      quantity: 6,
      amount: '¥ 726,000.00',
      status: '采购中',
      createdAt: '2026-04-28',
    },
    {
      key: '7',
      purchaseNo: 'PO-20260430-0007',
      purchaseType: '现货采购',
      supplier: '区域供应商D',
      model: '宋PLUS EV',
      quantity: 5,
      amount: '¥ 744,500.00',
      status: '待确认',
      createdAt: '2026-04-27',
    },
    {
      key: '8',
      purchaseNo: 'PO-20260430-0008',
      purchaseType: '订单采购',
      supplier: '区域供应商E',
      model: '汉DM-i',
      quantity: 3,
      amount: '¥ 663,000.00',
      status: '已取消',
      createdAt: '2026-04-27',
    },
    {
      key: '9',
      purchaseNo: 'PO-20260430-0009',
      purchaseType: '现货采购',
      supplier: '区域供应商B',
      model: '海豚',
      quantity: 15,
      amount: '¥ 1,395,000.00',
      status: '已完成',
      createdAt: '2026-04-26',
    },
    {
      key: '10',
      purchaseNo: 'PO-20260430-0010',
      purchaseType: '订单采购',
      supplier: '区域供应商C',
      model: '驱逐舰05',
      quantity: 7,
      amount: '¥ 786,100.00',
      status: '采购中',
      createdAt: '2026-04-26',
    },
    {
      key: '11',
      purchaseNo: 'PO-20260430-0011',
      purchaseType: '现货采购',
      supplier: '区域供应商F',
      model: '海豹',
      quantity: 2,
      amount: '¥ 399,800.00',
      status: '待确认',
      createdAt: '2026-04-25',
    },
    {
      key: '12',
      purchaseNo: 'PO-20260430-0012',
      purchaseType: '订单采购',
      supplier: '比亚迪厂家',
      model: '唐EV',
      quantity: 3,
      amount: '¥ 834,000.00',
      status: '采购中',
      createdAt: '2026-04-25',
    },
    {
      key: '13',
      purchaseNo: 'PO-20260430-0013',
      purchaseType: '现货采购',
      supplier: '区域供应商A',
      model: '宋Pro DM-i',
      quantity: 9,
      amount: '¥ 1,060,200.00',
      status: '待确认',
      createdAt: '2026-04-24',
    },
    {
      key: '14',
      purchaseNo: 'PO-20260430-0014',
      purchaseType: '订单采购',
      supplier: '区域供应商D',
      model: '秦EV',
      quantity: 6,
      amount: '¥ 792,000.00',
      status: '已完成',
      createdAt: '2026-04-24',
    },
    {
      key: '15',
      purchaseNo: 'PO-20260430-0015',
      purchaseType: '现货采购',
      supplier: '区域供应商E',
      model: '海狮07 EV',
      quantity: 4,
      amount: '¥ 958,000.00',
      status: '采购中',
      createdAt: '2026-04-23',
    },
    {
      key: '16',
      purchaseNo: 'PO-20260430-0016',
      purchaseType: '订单采购',
      supplier: '区域供应商B',
      model: '宋L EV',
      quantity: 3,
      amount: '¥ 699,000.00',
      status: '待确认',
      createdAt: '2026-04-23',
    },
    {
      key: '17',
      purchaseNo: 'PO-20260430-0017',
      purchaseType: '现货采购',
      supplier: '区域供应商C',
      model: '元UP',
      quantity: 10,
      amount: '¥ 998,000.00',
      status: '采购中',
      createdAt: '2026-04-22',
    },
    {
      key: '18',
      purchaseNo: 'PO-20260430-0018',
      purchaseType: '订单采购',
      supplier: '区域供应商F',
      model: '海豹06 DM-i',
      quantity: 6,
      amount: '¥ 698,400.00',
      status: '待确认',
      createdAt: '2026-04-22',
    },
    {
      key: '19',
      purchaseNo: 'PO-20260430-0019',
      purchaseType: '现货采购',
      supplier: '比亚迪厂家',
      model: '汉EV',
      quantity: 2,
      amount: '¥ 516,000.00',
      status: '已取消',
      createdAt: '2026-04-21',
    },
    {
      key: '20',
      purchaseNo: 'PO-20260430-0020',
      purchaseType: '订单采购',
      supplier: '区域供应商A',
      model: '宋PLUS DM-i',
      quantity: 11,
      amount: '¥ 1,702,800.00',
      status: '采购中',
      createdAt: '2026-04-21',
    },
    {
      key: '21',
      purchaseNo: 'PO-20260430-0021',
      purchaseType: '现货采购',
      supplier: '区域供应商D',
      model: '海豚',
      quantity: 20,
      amount: '¥ 1,860,000.00',
      status: '已完成',
      createdAt: '2026-04-20',
    },
    {
      key: '22',
      purchaseNo: 'PO-20260430-0022',
      purchaseType: '订单采购',
      supplier: '区域供应商E',
      model: '驱逐舰05',
      quantity: 5,
      amount: '¥ 561,500.00',
      status: '待确认',
      createdAt: '2026-04-20',
    },
  ]

  return (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      <Card>
        <Form form={form} layout="horizontal" labelAlign="right" colon={false}>
          <div className="app-filter-row">
            <div className="app-filter-grid">
              <Form.Item className="app-filter-item" name="purchaseNo" label="采购单号">
                <Input placeholder="请输入" />
              </Form.Item>

              <Form.Item className="app-filter-item" name="supplier" label="供应商">
                <Input placeholder="请输入" />
              </Form.Item>

              <Form.Item className="app-filter-item" name="status" label="状态">
                <Select
                  placeholder="请选择"
                  options={[
                    { value: 'all', label: '全部' },
                    { value: 'pending', label: '待确认' },
                    { value: 'purchasing', label: '采购中' },
                    { value: 'done', label: '已完成' },
                    { value: 'canceled', label: '已取消' },
                  ]}
                />
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
        title="采购订单"
        extra={
          <Space className="app-table-actions" size={semanticTokens.size.buttonGap}>
            <Button type="primary" onClick={() => navigate('/vehicle/purchase/create')}>新增</Button>
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
