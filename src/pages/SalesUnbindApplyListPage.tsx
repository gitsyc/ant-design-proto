import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, DatePicker, Form, Input, Select, Space, Table } from '../ui'
import { semanticTokens } from '../theme/tokens'

type UnbindApplyStatus = '草稿' | '审核中' | '已审核' | '已取消' | '已驳回'
type ApprovalChannel = 'STORE_MANAGER' | 'CRM'

type UnbindApply = {
  key: string
  applyNo: string
  dealerName: string
  applicantName: string
  dipSalesOrderNo: string
  crmSalesOrderNo?: string
  appSalesOrderNo?: string
  dipPurchaseOrderNo: string
  crmPurchaseOrderNo?: string
  status: UnbindApplyStatus
  approvalChannel: ApprovalChannel
  crmApprovalNode?: string
  unbindReason: string
  approvedBy?: string
  approvedTime?: string
  createTime: string
}

function canEdit(status: UnbindApplyStatus) {
  return status === '草稿' || status === '已驳回'
}

function canCancel(status: UnbindApplyStatus) {
  return status === '草稿' || status === '审核中'
}

export default function SalesUnbindApplyListPage() {
  const [form] = Form.useForm()

  const dataSource: UnbindApply[] = useMemo(
    () => [
      {
        key: '1',
        applyNo: '王朝XSJB20260422001',
        dealerName: '深圳XX店',
        applicantName: '张三',
        dipSalesOrderNo: 'SO202604220001',
        crmSalesOrderNo: 'CRM-SO-001',
        appSalesOrderNo: 'APP-SO-001',
        dipPurchaseOrderNo: 'PO202604220001',
        crmPurchaseOrderNo: 'CRM-PO-001',
        status: '审核中',
        approvalChannel: 'CRM',
        crmApprovalNode: '厂端审批中',
        unbindReason: '客户改购现车',
        createTime: '2026-04-22 10:05',
      },
      {
        key: '2',
        applyNo: '王朝XSJB20260422002',
        dealerName: '深圳XX店',
        applicantName: '李四',
        dipSalesOrderNo: 'SO202604220002',
        dipPurchaseOrderNo: 'PO202604220002',
        status: '草稿',
        approvalChannel: 'STORE_MANAGER',
        unbindReason: '客户取消采购绑定',
        createTime: '2026-04-22 11:10',
      },
      {
        key: '3',
        applyNo: '王朝XSJB20260422003',
        dealerName: '广州YY店',
        applicantName: '王五',
        dipSalesOrderNo: 'SO202604220003',
        dipPurchaseOrderNo: 'PO202604220003',
        status: '已驳回',
        approvalChannel: 'STORE_MANAGER',
        unbindReason: '其他',
        approvedBy: '门店总经理',
        approvedTime: '2026-04-22 12:30',
        createTime: '2026-04-22 12:00',
      },
    ],
    []
  )

  const columns = [
    { title: '解绑申请单编号', dataIndex: 'applyNo' },
    { title: '经销商名称', dataIndex: 'dealerName' },
    { title: '解绑人', dataIndex: 'applicantName' },
    { title: 'DIP销售订单号', dataIndex: 'dipSalesOrderNo' },
    { title: 'DIP采购订单号', dataIndex: 'dipPurchaseOrderNo' },
    { title: '单据状态', dataIndex: 'status' },
    { title: '审批渠道', dataIndex: 'approvalChannel', render: (v: ApprovalChannel) => (v === 'CRM' ? '厂端审批' : '门店总经理') },
    { title: '销服审批节点', dataIndex: 'crmApprovalNode', render: (v?: string) => v ?? '-' },
    { title: '解绑原因', dataIndex: 'unbindReason' },
    { title: '审核人', dataIndex: 'approvedBy', render: (v?: string) => v ?? '-' },
    { title: '审核时间', dataIndex: 'approvedTime', render: (v?: string) => v ?? '-' },
    { title: '创建时间', dataIndex: 'createTime' },
    {
      title: '操作',
      render: (_: unknown, record: UnbindApply) => (
        <Space size={semanticTokens.size.buttonGap}>
          <Button className="app-btn-tertiary">
            <Link to={`/sales/unbind-applies/${record.applyNo}`}>查看</Link>
          </Button>
          <Button className="app-btn-secondary" disabled={!canEdit(record.status)}>
            <Link to={`/sales/unbind-applies/${record.applyNo}?mode=edit`}>修改</Link>
          </Button>
          <Button type="primary" danger disabled={!canCancel(record.status)}>
            取消
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <Space direction="vertical" size={semanticTokens.size.buttonGap} style={{ width: '100%' }}>
      <Card>
        <Form form={form} layout="horizontal" labelAlign="right" colon={false}>
          <div className="app-filter-row">
            <div className="app-filter-grid">
              <Form.Item className="app-filter-item" name="dealer" label="经销商">
                <Select
                  placeholder="请选择"
                  options={[
                    { value: 'all', label: '全部' },
                    { value: 'sz', label: '深圳XX店' },
                    { value: 'gz', label: '广州YY店' },
                  ]}
                />
              </Form.Item>

              <Form.Item className="app-filter-item" name="salesOrder" label="销售订单">
                <Input placeholder="DIP/CRM/APP订单号" />
              </Form.Item>

              <Form.Item className="app-filter-item" name="purchaseOrder" label="采购订单">
                <Input placeholder="DIP/CRM采购订单号" />
              </Form.Item>

              <Form.Item className="app-filter-item" name="appOrderNo" label="APP订单号">
                <Input placeholder="请输入" />
              </Form.Item>

              <Form.Item className="app-filter-item" name="applicant" label="解绑人">
                <Input placeholder="请输入" />
              </Form.Item>

              <Form.Item className="app-filter-item" name="unbindTime" label="解绑时间">
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

      <Card className="app-table-card" title="销售订单解绑申请">
        <Table columns={columns} dataSource={dataSource} />
      </Card>
    </Space>
  )
}

