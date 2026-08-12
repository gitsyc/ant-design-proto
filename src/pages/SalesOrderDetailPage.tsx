import { type Key, type ReactNode, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button, Card, DatePicker, Drawer, Form, Input, Select, Space, Table, Upload, type UploadProps } from '../ui'
import { semanticTokens } from '../theme/tokens'

type TransferPurchaseStatus = '未转采购' | '已转采购' | '已转采购待同步CRM' | '解绑中'
type PurchaseBindType = '转采购' | '采购绑定'

type SalesOrder = {
  orderNo: string
  customerName: string
  phone: string
  model: string
  status: '有效大定' | '已关闭' | '已退订'
  createdAt: string
  carAssigned: boolean
  transferPurchaseStatus: TransferPurchaseStatus
  purchaseOrderNo?: string
  purchaseBindType?: PurchaseBindType
  purchaseBindTime?: string
}

type PurchaseOrder = {
  purchaseOrderNo: string
  supplier: string
  createdAt: string
  crmSyncFlag: boolean
  boundSalesOrderNo?: string
}

function maskPhone(value: string) {
  if (value.length < 11) return value
  return `${value.slice(0, 3)}****${value.slice(-4)}`
}

function FieldRow(props: { label: string; value: ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: semanticTokens.size.filterItemGap, minWidth: 0 }}>
      <div style={{ width: semanticTokens.size.filterLabelWidth, color: semanticTokens.color.filterLabelText, flex: 'none' }}>{props.label}</div>
      <div style={{ minWidth: 0, flex: 1 }}>{props.value}</div>
    </div>
  )
}

export default function SalesOrderDetailPage() {
  const params = useParams()
  const navigate = useNavigate()

  const orderNo = params.orderNo ?? 'SO202604220001'

  const [salesOrder, setSalesOrder] = useState<SalesOrder>(() => ({
    orderNo,
    customerName: '张三',
    phone: '13812345678',
    model: '宋PLUS EV',
    status: '有效大定',
    createdAt: '2026-04-22 10:10',
    carAssigned: false,
    transferPurchaseStatus: '未转采购',
  }))

  const purchaseOrders: PurchaseOrder[] = useMemo(
    () => [
      { purchaseOrderNo: 'PO202604220001', supplier: '厂家直采', createdAt: '2026-04-22 10:20', crmSyncFlag: true },
      { purchaseOrderNo: 'PO202604220002', supplier: '区域配额', createdAt: '2026-04-22 10:25', crmSyncFlag: false },
      { purchaseOrderNo: 'PO202604220003', supplier: '厂家直采', createdAt: '2026-04-22 10:30', crmSyncFlag: true, boundSalesOrderNo: 'SO202604220099' },
    ],
    []
  )

  const [bindOpen, setBindOpen] = useState(false)
  const [unbindOpen, setUnbindOpen] = useState(false)
  const [selectedPurchaseKeys, setSelectedPurchaseKeys] = useState<Key[]>([])
  const [unbindForm] = Form.useForm()
  const [fileList, setFileList] = useState<NonNullable<UploadProps['fileList']>>([])

  const canBind = !salesOrder.carAssigned && !salesOrder.purchaseOrderNo
  const canTransferPurchase = !salesOrder.carAssigned && salesOrder.status === '有效大定' && salesOrder.transferPurchaseStatus !== '解绑中'
  const canUnbind = Boolean(salesOrder.purchaseOrderNo) || salesOrder.transferPurchaseStatus !== '未转采购'

  const bindColumns = [
    { title: '采购订单号', dataIndex: 'purchaseOrderNo' },
    { title: '供应来源', dataIndex: 'supplier' },
    { title: '创建时间', dataIndex: 'createdAt' },
    { title: '是否同步CRM', dataIndex: 'crmSyncFlag', render: (v: boolean) => (v ? '是' : '否') },
    { title: '已绑定销售单', dataIndex: 'boundSalesOrderNo', render: (v?: string) => v ?? '-' },
  ]

  const onConfirmBind = () => {
    const targetNo = typeof selectedPurchaseKeys[0] === 'string' ? selectedPurchaseKeys[0] : undefined
    const target = purchaseOrders.find(p => p.purchaseOrderNo === targetNo)
    if (!target || target.boundSalesOrderNo) return

    setSalesOrder(v => ({
      ...v,
      purchaseOrderNo: target.purchaseOrderNo,
      purchaseBindType: '采购绑定',
      purchaseBindTime: '2026-04-22 11:00',
      transferPurchaseStatus: '已转采购',
    }))
    setBindOpen(false)
    setSelectedPurchaseKeys([])
  }

  const onTransferPurchase = () => {
    navigate(`/vehicle/purchase/create?salesOrderNo=${encodeURIComponent(salesOrder.orderNo)}`)
  }

  const onSubmitUnbind = async () => {
    const values = await unbindForm.validateFields()
    void values
    setSalesOrder(v => ({ ...v, transferPurchaseStatus: '解绑中' }))
    setUnbindOpen(false)
    unbindForm.resetFields()
    setFileList([])
  }

  const infoGrid = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: semanticTokens.size.filterItemGap }}>
      <FieldRow label="DIP销售订单号" value={salesOrder.orderNo} />
      <FieldRow label="客户" value={salesOrder.customerName} />
      <FieldRow label="手机号" value={maskPhone(salesOrder.phone)} />
      <FieldRow label="车型" value={salesOrder.model} />
      <FieldRow label="订单状态" value={salesOrder.status} />
      <FieldRow label="创建时间" value={salesOrder.createdAt} />
    </div>
  )

  const relationGrid = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: semanticTokens.size.filterItemGap }}>
      <FieldRow label="转采购状态" value={salesOrder.transferPurchaseStatus} />
      <FieldRow label="采购订单号" value={salesOrder.purchaseOrderNo ?? '-'} />
      <FieldRow label="关联采购类型" value={salesOrder.purchaseBindType ?? '-'} />
      <FieldRow label="绑定时间" value={salesOrder.purchaseBindTime ?? '-'} />
      <FieldRow label="配车状态" value={salesOrder.carAssigned ? '已配车' : '未配车'} />
      <FieldRow label="配车限制" value={salesOrder.purchaseOrderNo ? '仅可查询绑定采购单库存' : '-'} />
    </div>
  )

  return (
    <Space direction="vertical" size={semanticTokens.size.buttonGap} style={{ width: '100%' }}>
      <Card
        title="销售订单详情"
        extra={
          <Space size={semanticTokens.size.buttonGap}>
            <Button type="primary" disabled={!canBind} onClick={() => setBindOpen(true)}>
              采购绑定
            </Button>
            <Button type="primary" disabled={!canTransferPurchase} onClick={onTransferPurchase}>
              转采购
            </Button>
            <Button type="primary" danger disabled={!canUnbind} onClick={() => setUnbindOpen(true)}>
              采购解绑
            </Button>
            <Button className="app-btn-tertiary">
              <Link to="/sales/orders">返回列表</Link>
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" size={semanticTokens.size.buttonGap} style={{ width: '100%' }}>
          {infoGrid}
          {relationGrid}
        </Space>
      </Card>

      <Drawer
        open={bindOpen}
        title="采购绑定"
        placement="right"
        width={520}
        onClose={() => {
          setBindOpen(false)
          setSelectedPurchaseKeys([])
        }}
        footer={
          <Space size={semanticTokens.size.buttonGap} style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button className="app-btn-tertiary" onClick={() => setBindOpen(false)}>
              取消
            </Button>
            <Button type="primary" disabled={selectedPurchaseKeys.length === 0} onClick={onConfirmBind}>
              确认绑定
            </Button>
          </Space>
        }
      >
        <Table
          rowKey="purchaseOrderNo"
          columns={bindColumns}
          dataSource={purchaseOrders}
          rowSelection={{
            type: 'radio',
            selectedRowKeys: selectedPurchaseKeys,
            onChange: keys => setSelectedPurchaseKeys(keys),
            getCheckboxProps: (record: PurchaseOrder) => ({ disabled: Boolean(record.boundSalesOrderNo) }),
          }}
        />
      </Drawer>

      <Drawer
        open={unbindOpen}
        title="采购解绑申请"
        placement="right"
        width={520}
        onClose={() => {
          setUnbindOpen(false)
          unbindForm.resetFields()
          setFileList([])
        }}
        footer={
          <Space size={semanticTokens.size.buttonGap} style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button className="app-btn-tertiary" onClick={() => setUnbindOpen(false)}>
              取消
            </Button>
            <Button type="primary" onClick={onSubmitUnbind}>
              提交申请
            </Button>
          </Space>
        }
      >
        <Form form={unbindForm} layout="vertical" colon={false}>
          <Form.Item name="unbindReason" label="解绑原因" rules={[{ required: true, message: '请选择解绑原因' }]}>
            <Select
              placeholder="请选择"
              options={[
                { value: 'customer_cancel', label: '客户取消采购绑定' },
                { value: 'change_purchase_way', label: '客户改购现车' },
                { value: 'other', label: '其他' },
              ]}
            />
          </Form.Item>
          <Form.Item name="unbindRemark" label="解绑说明">
            <Input.TextArea placeholder="请输入" maxLength={500} showCount autoSize={{ minRows: 4, maxRows: 8 }} />
          </Form.Item>
          <Form.Item name="attachment" label="附件">
            <Upload
              multiple
              maxCount={9}
              fileList={fileList}
              accept=".jpg,.jpeg,.png,.pdf"
              beforeUpload={() => false}
              onChange={info => setFileList(info.fileList)}
            >
              <Button className="app-btn-secondary">选择文件</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="unbindTime" label="预计解绑时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Drawer>
    </Space>
  )
}
