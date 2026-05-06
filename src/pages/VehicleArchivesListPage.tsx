import { Button, Card, DatePicker, Form, Input, Select, Space, Table } from '../ui'
import { semanticTokens } from '../theme/tokens'

export default function VehicleArchivesListPage() {
  const [form] = Form.useForm()

  const columns = [
    { title: 'VIN', dataIndex: 'vin' },
    { title: '车牌号', dataIndex: 'plateNo' },
    { title: '车型', dataIndex: 'model' },
    { title: '颜色', dataIndex: 'color' },
    { title: '动力类型', dataIndex: 'powerType' },
    { title: '车辆状态', dataIndex: 'status' },
    { title: '所属仓库', dataIndex: 'warehouse' },
    { title: '入库时间', dataIndex: 'inboundAt' },
    { title: '更新时间', dataIndex: 'updatedAt' },
    { title: '操作', render: () => <a>查看</a> },
  ]

  const dataSource = [
    {
      key: '1',
      vin: 'LC0C76C41N0000001',
      plateNo: '粤B·A1234',
      model: '宋PLUS DM-i',
      color: '天青蓝',
      powerType: '插混',
      status: '在库',
      warehouse: '深圳总仓',
      inboundAt: '2026-04-30 15:12',
      updatedAt: '2026-05-01 09:20',
    },
    {
      key: '2',
      vin: 'LC0C76C41N0000002',
      plateNo: '粤B·B5678',
      model: '海豹DM-i',
      color: '皓月白',
      powerType: '插混',
      status: '待整备',
      warehouse: '深圳总仓',
      inboundAt: '2026-04-29 11:05',
      updatedAt: '2026-04-30 18:40',
    },
    {
      key: '3',
      vin: 'LC0C76C41N0000003',
      plateNo: '粤A·C8888',
      model: '汉EV',
      color: '曜石黑',
      powerType: '纯电',
      status: '在库',
      warehouse: '广州分仓',
      inboundAt: '2026-04-28 10:26',
      updatedAt: '2026-04-29 16:03',
    },
    {
      key: '4',
      vin: 'LC0C76C41N0000004',
      plateNo: '粤A·D1024',
      model: '唐DM-i',
      color: '赤帝红',
      powerType: '插混',
      status: '已出库',
      warehouse: '广州分仓',
      inboundAt: '2026-04-26 14:50',
      updatedAt: '2026-04-30 13:18',
    },
    {
      key: '5',
      vin: 'LC0C76C41N0000005',
      plateNo: '粤C·E6666',
      model: '元PLUS',
      color: '极光绿',
      powerType: '纯电',
      status: '在库',
      warehouse: '珠海分仓',
      inboundAt: '2026-04-25 09:30',
      updatedAt: '2026-04-27 10:11',
    },
    {
      key: '6',
      vin: 'LC0C76C41N0000006',
      plateNo: '粤C·F0001',
      model: '秦PLUS DM-i',
      color: '皓月白',
      powerType: '插混',
      status: '待整备',
      warehouse: '珠海分仓',
      inboundAt: '2026-04-24 17:02',
      updatedAt: '2026-04-25 08:45',
    },
    {
      key: '7',
      vin: 'LC0C76C41N0000007',
      plateNo: '粤B·G2026',
      model: '海豚',
      color: '薄荷绿',
      powerType: '纯电',
      status: '在库',
      warehouse: '深圳总仓',
      inboundAt: '2026-04-23 13:27',
      updatedAt: '2026-04-23 13:27',
    },
    {
      key: '8',
      vin: 'LC0C76C41N0000008',
      plateNo: '粤A·H1314',
      model: '驱逐舰05',
      color: '曜石黑',
      powerType: '插混',
      status: '已出库',
      warehouse: '广州分仓',
      inboundAt: '2026-04-22 16:16',
      updatedAt: '2026-04-29 09:05',
    },
  ]

  return (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      <Card>
        <Form form={form} layout="horizontal" labelAlign="right" colon={false}>
          <div className="app-filter-row">
            <div className="app-filter-grid">
              <Form.Item className="app-filter-item" name="vin" label="VIN">
                <Input placeholder="请输入" />
              </Form.Item>

              <Form.Item className="app-filter-item" name="plateNo" label="车牌号">
                <Input placeholder="请输入" />
              </Form.Item>

              <Form.Item className="app-filter-item" name="model" label="车型">
                <Input placeholder="请输入" />
              </Form.Item>

              <Form.Item className="app-filter-item" name="warehouse" label="仓库">
                <Select
                  placeholder="请选择"
                  options={[
                    { value: 'all', label: '全部' },
                    { value: 'sz', label: '深圳总仓' },
                    { value: 'gz', label: '广州分仓' },
                    { value: 'zh', label: '珠海分仓' },
                  ]}
                />
              </Form.Item>

              <Form.Item className="app-filter-item" name="status" label="车辆状态">
                <Select
                  placeholder="请选择"
                  options={[
                    { value: 'all', label: '全部' },
                    { value: 'in_stock', label: '在库' },
                    { value: 'reconditioning', label: '待整备' },
                    { value: 'out_stock', label: '已出库' },
                  ]}
                />
              </Form.Item>

              <Form.Item className="app-filter-item" name="inboundAt" label="入库日期">
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
        title="车档列表"
        extra={
          <Space className="app-table-actions" size={semanticTokens.size.buttonGap}>
            <Button type="primary">新增</Button>
            <Button className="app-btn-secondary">导出</Button>
            <Button type="primary" danger>
              删除
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
