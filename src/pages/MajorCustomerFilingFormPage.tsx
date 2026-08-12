// 大客户备案 - 新增/编辑表单页（主从结构：车辆明细行可展开异地收货地址明细）
import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Button, Card, DatePicker, Form, Input, InputNumber, Radio, Select, Space, Table, Tag, Upload, message,
} from '../ui'
import { UploadOutlined } from '../ui/icons'
import { semanticTokens } from '../theme/tokens'
import AddressBookTable from './filing/AddressBookTable'
import {
  majorCustomerFilings,
  FILING_STATUS_COLOR,
  formatFullAddress,
  type VehicleDetail,
  type RemoteAllocation,
  type AddressBookEntry,
} from '../data/majorCustomerFilings'

let seedId = 1000
const uid = () => `tmp-${seedId++}`

// 空车辆明细行
const emptyVehicle = (): VehicleDetail => ({
  key: uid(), series: '', seriesCode: '', modelCode: '', model: '', quantity: 1, usedQty: 0, involveRemote: false, allocations: [],
})

export default function MajorCustomerFilingFormPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [form] = Form.useForm()

  // 编辑态：从 query 读取 key，命中则载入
  const editingKey = useMemo(() => new URLSearchParams(location.search).get('key') ?? '', [location.search])
  const existing = useMemo(() => majorCustomerFilings.find(f => f.key === editingKey), [editingKey])
  const readOnly = !!existing && !['草稿', '已驳回'].includes(existing.status)

  // 必填附件受控计数（原型：仅跟踪是否已上传，编辑态视为已具备）
  const [licenseCount, setLicenseCount] = useState<number>(existing ? 1 : 0)
  const [contractCount, setContractCount] = useState<number>(existing ? 1 : 0)
  const [vehicles, setVehicles] = useState<VehicleDetail[]>(
    existing ? existing.vehicleDetails.map(v => ({ ...v, allocations: v.allocations.map(a => ({ ...a })) })) : [emptyVehicle()]
  )
  // 备案级异地收货地址簿
  const [addressBook, setAddressBook] = useState<AddressBookEntry[]>(
    existing ? existing.addressBook.map(a => ({ ...a })) : []
  )
  // 受控展开态：仅涉及异地发运的车型行可展开；编辑态默认展开这些行
  const [expandedKeys, setExpandedKeys] = useState<string[]>(
    existing ? existing.vehicleDetails.filter(v => v.involveRemote).map(v => v.key) : []
  )

  // 地址簿下拉选项
  const addressOptions = addressBook.map(a => ({ value: a.id, label: formatFullAddress(a) || '（未填写地址）' }))
  const findAddress = (id: string) => addressBook.find(a => a.id === id)

  // 地址簿增删改
  const addAddressEntry = () =>
    setAddressBook(prev => [
      ...prev,
      { id: uid(), province: '', city: '', district: '', detailAddress: '', contact: '', mobile: '', landline: '' },
    ])
  const patchAddressEntry = (id: string, patch: Partial<AddressBookEntry>) =>
    setAddressBook(prev => prev.map(a => (a.id === id ? { ...a, ...patch } : a)))
  const removeAddressEntry = (id: string) => {
    // 被任一车型分配引用的地址不可删除
    const referenced = vehicles.some(v => v.allocations.some(al => al.addressId === id))
    if (referenced) {
      message.error('该地址已被车型异地发运分配引用，请先移除相关分配')
      return
    }
    setAddressBook(prev => prev.filter(a => a.id !== id))
  }

  // 车辆明细行增删改
  const addVehicle = () => setVehicles(prev => [...prev, emptyVehicle()])
  const removeVehicle = (key: string) => {
    setVehicles(prev => prev.filter(v => v.key !== key))
    setExpandedKeys(prev => prev.filter(k => k !== key))
  }
  const patchVehicle = (key: string, patch: Partial<VehicleDetail>) =>
    setVehicles(prev => prev.map(v => (v.key === key ? { ...v, ...patch } : v)))

  // 车型异地发运分配（引用地址簿）增删改
  const addAllocation = (vKey: string) =>
    setVehicles(prev =>
      prev.map(v =>
        v.key === vKey
          ? { ...v, allocations: [...v.allocations, { key: uid(), addressId: '', approvedQty: 1 }] }
          : v
      )
    )
  const removeAllocation = (vKey: string, aKey: string) =>
    setVehicles(prev =>
      prev.map(v => (v.key === vKey ? { ...v, allocations: v.allocations.filter(a => a.key !== aKey) } : v))
    )
  const patchAllocation = (vKey: string, aKey: string, patch: Partial<RemoteAllocation>) =>
    setVehicles(prev =>
      prev.map(v =>
        v.key === vKey
          ? { ...v, allocations: v.allocations.map(a => (a.key === aKey ? { ...a, ...patch } : a)) }
          : v
      )
    )

  // 地址簿 + 车辆明细分配的业务校验（返回错误信息，null 表示通过）
  const validateAll = (): string | null => {
    // 1) 地址簿：地址非空且同一备案内不重复
    const bookSet = new Set<string>()
    for (const a of addressBook) {
      if (!a.province || !a.city || !a.district) return '异地收货地址簿存在未选择省市区的地址'
      if (!a.detailAddress.trim()) return '异地收货地址簿存在未填写的详细地址'
      const full = formatFullAddress(a).trim()
      if (bookSet.has(full)) return `异地收货地址「${full}」已存在于地址簿，请勿重复录入`
      bookSet.add(full)
    }
    // 2) 车辆明细 + 车型异地发运分配
    if (vehicles.length === 0) return '请至少录入一条车辆明细'
    const anyRemote = vehicles.some(v => v.involveRemote)
    if (anyRemote && addressBook.length === 0) return '请先在异地收货地址簿中录入收货地址'
    for (const v of vehicles) {
      if (!v.series || !v.model) return '请完整填写车辆明细的车系与车型'
      if (!v.quantity || v.quantity <= 0) return '车辆明细数量须为正整数'
      if (v.involveRemote) {
        if (v.allocations.length === 0) return `请为涉及异地发运的车型「${v.model || '未命名'}」至少录入一条异地发运分配`
        const addrIdSet = new Set<string>()
        let sum = 0
        for (const al of v.allocations) {
          if (!al.addressId || !findAddress(al.addressId)) return `请为车型「${v.model}」的异地发运分配选择收货地址`
          if (addrIdSet.has(al.addressId)) return `车型「${v.model}」下的收货地址已存在，请勿重复录入`
          addrIdSet.add(al.addressId)
          if (!al.approvedQty || al.approvedQty <= 0) return '请输入有效的正整数核定发车数量'
          sum += al.approvedQty
        }
        if (sum > v.quantity) return `车型「${v.model}」各收货地址核定发车数量之和（${sum}）已超过车型需求数量（${v.quantity}）`
      }
    }
    return null
  }

  // 保存/提交
  const handleSubmit = async (isSubmit: boolean) => {
    try {
      await form.validateFields()
    } catch {
      return
    }
    if (licenseCount === 0 || contractCount === 0) {
      message.error('请上传大客户营业执照和大客户合同')
      return
    }
    const err = validateAll()
    if (err) {
      message.error(err)
      return
    }
    message.success(isSubmit ? '提交成功，备案已进入审批流程' : '已保存草稿')
    navigate('/vehicle/purchase/filings')
  }

  return (
    <Space direction="vertical" size={semanticTokens.size.buttonGap} style={{ width: '100%' }}>
      <Card
        title={existing ? (readOnly ? '查看大客户备案' : '编辑大客户备案') : '新增大客户备案'}
        extra={
          <Space size={semanticTokens.size.buttonGap}>
            {existing && <Tag color={FILING_STATUS_COLOR[existing.status]}>{existing.status}</Tag>}
            {!readOnly && <Button type="primary" onClick={() => handleSubmit(true)}>提交</Button>}
            {!readOnly && <Button className="app-btn-secondary" onClick={() => handleSubmit(false)}>保存</Button>}
            <Button className="app-btn-tertiary">
              <Link to="/vehicle/purchase/filings">{readOnly ? '返回备案列表' : '退出'}</Link>
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          colon={false}
          disabled={readOnly}
          initialValues={{
            dealerName: existing?.dealerName ?? '杭州方程豹汽车销售有限公司',
            dealerCode: existing?.dealerCode ?? 'DLR-HZ-001',
            projectName: existing?.projectName,
            customerNo: existing?.customerNo,
            deadline: existing?.deadline ? dayjs(existing.deadline) : undefined,
            network: existing?.network ?? '方程豹',
            remark: existing?.remark,
            crmNo: existing?.crmNo,
          }}
        >
          {/* 基本信息 */}
          <div style={{ margin: '4px 0 12px', fontWeight: 600, borderLeft: '3px solid #1677ff', paddingLeft: 8 }}>基本信息</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <Form.Item name="dealerName" label="经销商名称">
              <Input disabled />
            </Form.Item>
            <Form.Item name="dealerCode" label="经销商编码">
              <Input disabled />
            </Form.Item>
            <Form.Item name="network" label="网络">
              <Input disabled />
            </Form.Item>
            <Form.Item name="projectName" label="大客户项目" rules={[{ required: true, message: '请输入大客户项目' }, { max: 50 }]}>
              <Input placeholder="请输入" />
            </Form.Item>
            <Form.Item name="customerNo" label="大客户编号">
              <Input disabled placeholder="系统自动生成" />
            </Form.Item>
            <Form.Item name="deadline" label="交期截止" rules={[{ required: true, message: '请选择交期截止日期' }]}>
              <DatePicker style={{ width: '100%' }} placeholder="请选择日期" />
            </Form.Item>
            <Form.Item name="crmNo" label="CRM单据编号">
              <Input disabled placeholder="同步CRM后由CRM返回" />
            </Form.Item>
            <Form.Item name="remark" label="备注" rules={[{ max: 100 }]}>
              <Input.TextArea placeholder="请输入" maxLength={100} autoSize={{ minRows: 1, maxRows: 3 }} />
            </Form.Item>
          </div>
          <div style={{ marginBottom: 8, color: semanticTokens.color.filterLabelText, fontSize: 12 }}>
            是否涉及异地发运在车辆明细中按车型逐行标识；任一车型涉及异地发运时，该备案即视为涉及异地发运。
          </div>

          {/* 附件 */}
          <div style={{ margin: '16px 0 12px', fontWeight: 600, borderLeft: '3px solid #1677ff', paddingLeft: 8 }}>附件</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <Form.Item label="大客户营业执照" required>
              <Upload maxCount={1} disabled={readOnly} beforeUpload={() => false} onChange={({ fileList }) => setLicenseCount(fileList.length)}>
                <Button icon={<UploadOutlined />} disabled={readOnly}>上传营业执照</Button>
              </Upload>
            </Form.Item>
            <Form.Item label="大客户合同" required>
              <Upload maxCount={1} disabled={readOnly} beforeUpload={() => false} onChange={({ fileList }) => setContractCount(fileList.length)}>
                <Button icon={<UploadOutlined />} disabled={readOnly}>上传合同</Button>
              </Upload>
            </Form.Item>
          </div>

          {/* 异地收货地址簿（备案级，地址录一次，供车型分配引用） */}
          <AddressBookTable
            addressBook={addressBook}
            readOnly={readOnly}
            patchAddressEntry={patchAddressEntry}
            removeAddressEntry={removeAddressEntry}
            addAddressEntry={addAddressEntry}
          />

          {/* 车辆明细（主表）+ 车型异地发运分配（从表，展开录入，引用地址簿） */}
          <div style={{ margin: '16px 0 12px', fontWeight: 600, borderLeft: '3px solid #1677ff', paddingLeft: 8 }}>车辆明细</div>
          <div style={{ marginBottom: 8, color: semanticTokens.color.filterLabelText, fontSize: 12 }}>
            车型与数量在此录入一次；按车型逐行标识是否涉及异地发运，标识为"是"的车型展开从地址簿选择收货地址并录核定发车数量。
          </div>
          <Table
            rowKey="key"
            dataSource={vehicles}
            pagination={false}
            columns={[
              {
                title: '车系',
                dataIndex: 'series',
                render: (val: string, r: VehicleDetail) => (
                  <Input value={val} placeholder="车系" disabled={readOnly}
                    onChange={e => patchVehicle(r.key, { series: e.target.value })} />
                ),
              },
              {
                title: '车型',
                dataIndex: 'model',
                render: (val: string, r: VehicleDetail) => (
                  <Input value={val} placeholder="车型" disabled={readOnly}
                    onChange={e => patchVehicle(r.key, { model: e.target.value })} />
                ),
              },
              {
                title: '数量',
                dataIndex: 'quantity',
                width: 120,
                render: (val: number, r: VehicleDetail) => (
                  <InputNumber min={1} precision={0} value={val} style={{ width: '100%' }} disabled={readOnly}
                    onChange={n => patchVehicle(r.key, { quantity: Number(n) || 0 })} />
                ),
              },
              { title: '已用数量', dataIndex: 'usedQty', width: 90 },
              {
                title: '是否涉及异地发运',
                dataIndex: 'involveRemote',
                width: 160,
                render: (val: boolean, r: VehicleDetail) => (
                  <Radio.Group
                    value={val}
                    disabled={readOnly}
                    onChange={e => {
                      const next = e.target.value as boolean
                      // 关闭异地发运时清空该车型已录入的分配，避免残留
                      patchVehicle(r.key, next ? { involveRemote: true } : { involveRemote: false, allocations: [] })
                      // 同步受控展开态：选"是"展开该行，选"否"收起
                      setExpandedKeys(prev => (next ? [...new Set([...prev, r.key])] : prev.filter(k => k !== r.key)))
                    }}
                    options={[
                      { value: true, label: '是' },
                      { value: false, label: '否' },
                    ]}
                  />
                ),
              },
              {
                title: '操作',
                width: 140,
                render: (_: unknown, r: VehicleDetail) => (
                  readOnly ? '-' : (
                    <Space size={12}>
                      {r.involveRemote && (
                        <a onClick={() => addAllocation(r.key)}>加分配</a>
                      )}
                      <a onClick={() => removeVehicle(r.key)} style={{ color: semanticTokens.color.buttonDangerBg }}>删除</a>
                    </Space>
                  )
                ),
              },
            ]}
            expandable={{
              // 受控展开态：仅涉及异地发运的车型行可展开，切"否"或删除时同步移除
              expandedRowKeys: expandedKeys,
              onExpandedRowsChange: keys => setExpandedKeys(keys as string[]),
              // 仅该车型标识涉及异地发运时展示异地收货地址从表
              rowExpandable: (r: VehicleDetail) => r.involveRemote,
              expandedRowRender: (r: VehicleDetail) => (
                <div
                  style={{
                    margin: '4px 0 4px 32px',
                    padding: '10px 12px 12px',
                    background: '#f5f7fa',
                    borderLeft: '3px solid #1677ff',
                    borderRadius: 4,
                  }}
                >
                  <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 600, color: '#5a6b87' }}>
                    ▸ 异地发运分配 · 车型「{r.model || '未命名'}」
                    <span style={{ fontWeight: 400, marginLeft: 6 }}>
                      （从地址簿选地址，各地址核定数之和不超过车型数量 {r.quantity}）
                    </span>
                  </div>
                  <Table
                    className="app-subtable"
                    rowKey="key"
                    size="small"
                    pagination={false}
                    dataSource={r.allocations}
                    locale={{ emptyText: '暂无分配，点击该车型行右侧「加分配」从地址簿选择收货地址' }}
                    columns={[
                      {
                        title: '异地收货地址',
                        dataIndex: 'addressId',
                        render: (val: string, a: RemoteAllocation) => (
                          <Select
                            value={val || undefined}
                            placeholder={addressBook.length ? '从地址簿选择' : '请先在地址簿录入地址'}
                            style={{ width: '100%' }}
                            disabled={readOnly}
                            options={addressOptions}
                            onChange={id => patchAllocation(r.key, a.key, { addressId: id })}
                          />
                        ),
                      },
                      {
                        title: '联系人',
                        width: 100,
                        render: (_: unknown, a: RemoteAllocation) => findAddress(a.addressId)?.contact || '-',
                      },
                      {
                        title: '手机号',
                        width: 130,
                        render: (_: unknown, a: RemoteAllocation) => findAddress(a.addressId)?.mobile || '-',
                      },
                      {
                        title: '固定电话',
                        width: 130,
                        render: (_: unknown, a: RemoteAllocation) => findAddress(a.addressId)?.landline || '-',
                      },
                      {
                        title: '核定发车数量',
                        dataIndex: 'approvedQty',
                        width: 130,
                        render: (val: number, a: RemoteAllocation) => (
                          <InputNumber min={1} precision={0} value={val} style={{ width: '100%' }} disabled={readOnly}
                            onChange={n => patchAllocation(r.key, a.key, { approvedQty: Number(n) || 0 })} />
                        ),
                      },
                      {
                        title: '操作',
                        width: 80,
                        render: (_: unknown, a: RemoteAllocation) => (
                          readOnly ? '-' : (
                            <a onClick={() => removeAllocation(r.key, a.key)} style={{ color: semanticTokens.color.buttonDangerBg }}>删除</a>
                          )
                        ),
                      },
                    ]}
                  />
                </div>
              ),
            }}
          />
          {!readOnly && (
            <Button className="app-btn-tertiary" style={{ marginTop: 8 }} onClick={addVehicle}>
              + 添加车型
            </Button>
          )}

          {/* 签批表（仅大客户区域经理审批节点上传，此处展示上传入口） */}
          <div style={{ margin: '16px 0 12px', fontWeight: 600, borderLeft: '3px solid #1677ff', paddingLeft: 8 }}>签批表</div>
          <Form.Item extra="仅大客户区域经理审批节点可上传，随备案单归档">
            <Upload beforeUpload={() => false} disabled={readOnly}>
              <Button icon={<UploadOutlined />} disabled={readOnly}>上传签批表</Button>
            </Upload>
          </Form.Item>

          {/* 审批记录 */}
          {existing && existing.approvals.length > 0 && (
            <>
              <div id="approvals" style={{ margin: '16px 0 12px', fontWeight: 600, borderLeft: '3px solid #1677ff', paddingLeft: 8 }}>审批记录</div>
              <Table
                rowKey="key"
                size="small"
                pagination={false}
                dataSource={existing.approvals}
                columns={[
                  { title: '审批人', dataIndex: 'approver' },
                  { title: '审批节点', dataIndex: 'node' },
                  { title: '审批时间', dataIndex: 'approvedAt' },
                  { title: '审批意见', dataIndex: 'opinion' },
                  { title: '下一审批节点', dataIndex: 'nextNode' },
                  { title: '下一节点审批人', dataIndex: 'nextApprover' },
                ]}
              />
            </>
          )}

        </Form>
      </Card>
    </Space>
  )
}
