import { type ReactNode, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { Button, Card, DatePicker, Form, Input, Select, Space, Table, Upload, type UploadProps } from '../ui'
import { semanticTokens } from '../theme/tokens'

type UnbindApplyStatus = '草稿' | '审核中' | '已审核' | '已取消' | '已驳回'
type ApprovalChannel = 'STORE_MANAGER' | 'CRM'

type Attachment = {
  uid: string
  name: string
  url?: string
}

type ApprovalLog = {
  key: string
  nodeName: string
  approverName?: string
  approvalResult: '通过' | '驳回' | '取消'
  approvalRemark?: string
  approvalTime: string
  sourceSystem: 'DIP' | 'CRM'
}

type UnbindApplyDetail = {
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
  unbindRemark?: string
  series?: string
  model?: string
  config?: string
  configCode?: string
  approvedBy?: string
  approvedTime?: string
  unbindTime?: string
  attachments: Attachment[]
  approvalLogs: ApprovalLog[]
}

function FieldRow(props: { label: string; value: ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: semanticTokens.size.filterItemGap, minWidth: 0 }}>
      <div style={{ width: semanticTokens.size.filterLabelWidth, color: semanticTokens.color.filterLabelText, flex: 'none' }}>{props.label}</div>
      <div style={{ minWidth: 0, flex: 1 }}>{props.value}</div>
    </div>
  )
}

export default function SalesUnbindApplyDetailPage() {
  const params = useParams()
  const location = useLocation()
  const mode = new URLSearchParams(location.search).get('mode')
  const editable = mode === 'edit'

  const applyNo = params.applyNo ?? '王朝XSJB20260422001'

  const initialDetail: UnbindApplyDetail = useMemo(
    () => ({
      applyNo,
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
      unbindRemark: '客户改购现车，申请解绑后重新下单',
      series: '王朝',
      model: '宋PLUS EV',
      config: '尊贵型',
      configCode: 'CFG-001',
      attachments: [{ uid: '1', name: '客户申请.pdf', url: '#' }],
      approvalLogs: [
        { key: '1', nodeName: '提交申请', approverName: '张三', approvalResult: '通过', approvalRemark: '-', approvalTime: '2026-04-22 10:05', sourceSystem: 'DIP' },
        { key: '2', nodeName: '厂端审批', approverName: '-', approvalResult: '通过', approvalRemark: '-', approvalTime: '2026-04-22 10:20', sourceSystem: 'CRM' },
      ],
    }),
    [applyNo]
  )

  const [detail, setDetail] = useState<UnbindApplyDetail>(initialDetail)
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<NonNullable<UploadProps['fileList']>>(
    initialDetail.attachments.map(a => ({ uid: a.uid, name: a.name, url: a.url, status: 'done' }))
  )

  const canSubmit = detail.status === '草稿' || detail.status === '已驳回'

  const approvalColumns = [
    { title: '审批节点', dataIndex: 'nodeName' },
    { title: '审批人', dataIndex: 'approverName', render: (v?: string) => v ?? '-' },
    { title: '结果', dataIndex: 'approvalResult' },
    { title: '意见', dataIndex: 'approvalRemark', render: (v?: string) => v ?? '-' },
    { title: '时间', dataIndex: 'approvalTime' },
    { title: '来源', dataIndex: 'sourceSystem' },
  ]

  const baseGrid = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: semanticTokens.size.filterItemGap }}>
      <FieldRow label="解绑申请单编号" value={detail.applyNo} />
      <FieldRow label="经销商名称" value={detail.dealerName} />
      <FieldRow label="解绑人" value={detail.applicantName} />
      <FieldRow label="单据状态" value={detail.status} />
      <FieldRow label="审批渠道" value={detail.approvalChannel === 'CRM' ? '厂端审批' : '门店总经理'} />
      <FieldRow label="销服审批节点" value={detail.crmApprovalNode ?? '-'} />
    </div>
  )

  const orderGrid = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: semanticTokens.size.filterItemGap }}>
      <FieldRow label="DIP销售订单号" value={detail.dipSalesOrderNo} />
      <FieldRow label="CRM销售订单号" value={detail.crmSalesOrderNo ?? '-'} />
      <FieldRow label="APP销售订单号" value={detail.appSalesOrderNo ?? '-'} />
      <FieldRow label="DIP采购订单号" value={detail.dipPurchaseOrderNo} />
      <FieldRow label="CRM采购订单号" value={detail.crmPurchaseOrderNo ?? '-'} />
      <FieldRow label="车型" value={detail.model ?? '-'} />
    </div>
  )

  const onSubmit = async () => {
    const values = await form.validateFields()
    setDetail(v => ({
      ...v,
      unbindReason: values.unbindReason,
      unbindRemark: values.unbindRemark,
      status: '审核中',
      crmApprovalNode: v.approvalChannel === 'CRM' ? '厂端审批中' : '门店总经理审批中',
    }))
  }

  return (
    <Space direction="vertical" size={semanticTokens.size.buttonGap} style={{ width: '100%' }}>
      <Card
        title="解绑申请详情"
        extra={
          <Space size={semanticTokens.size.buttonGap}>
            <Button type="primary" disabled={!editable || !canSubmit} onClick={onSubmit}>
              提交审批
            </Button>
            <Button className="app-btn-secondary">查看审批记录</Button>
            <Button className="app-btn-secondary">下载附件</Button>
            <Button className="app-btn-tertiary">
              <Link to="/sales/unbind-applies">返回列表</Link>
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" size={semanticTokens.size.buttonGap} style={{ width: '100%' }}>
          {baseGrid}
          {orderGrid}
        </Space>
      </Card>

      <Card title="解绑信息">
        <Form
          form={form}
          layout="vertical"
          colon={false}
          initialValues={{ unbindReason: detail.unbindReason, unbindRemark: detail.unbindRemark }}
          disabled={!editable}
        >
          <Form.Item name="unbindReason" label="解绑原因" rules={[{ required: true, message: '请选择解绑原因' }]}>
            <Select
              placeholder="请选择"
              options={[
                { value: '客户取消采购绑定', label: '客户取消采购绑定' },
                { value: '客户改购现车', label: '客户改购现车' },
                { value: '其他', label: '其他' },
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
          <Form.Item name="unbindTime" label="解绑时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Card>

      <Card title="审批轨迹">
        <Table columns={approvalColumns} dataSource={detail.approvalLogs} pagination={false} />
      </Card>
    </Space>
  )
}

