// 大客户备案 - 新增/编辑表单页（主从结构：车辆明细行可展开异地收货地址明细）
import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Button, Card, DatePicker, Form, Input, InputNumber, Modal, Radio, Select, Space, Table, Tag, Upload, message,
} from '../ui'
import { CloudUploadOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined } from '../ui/icons'
import { semanticTokens } from '../theme/tokens'
import AddressBookTable from './filing/AddressBookTable'
import {
  majorCustomerFilings,
  FILING_STATUS_COLOR,
  formatFullAddress,
  VEHICLE_MODELS,
  findVehicleModel,
  type VehicleDetail,
  type RemoteAllocation,
  type AddressBookEntry,
} from '../data/majorCustomerFilings'

let seedId = 1000
const uid = () => `tmp-${seedId++}`

// 空车辆明细行
const emptyVehicle = (): VehicleDetail => ({
  key: uid(), series: '', seriesCode: '', modelCode: '', model: '', quantity: 0, usedQty: 0, involveRemote: false, allocations: [],
})

export default function MajorCustomerFilingFormPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [form] = Form.useForm()

  // 编辑态：从 query 读取 key；mode=view 为只读查看
  const search = useMemo(() => new URLSearchParams(location.search), [location.search])
  const editingKey = search.get('key') ?? ''
  const existing = useMemo(() => majorCustomerFilings.find(f => f.key === editingKey), [editingKey])
  const viewMode = search.get('mode') === 'view'
  const readOnly = viewMode || (!!existing && !['已保存', '审核驳回', '同步失败'].includes(existing.status))

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
  const [selectedVehicleKeys, setSelectedVehicleKeys] = useState<string[]>([])

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
      message.error('该地址已被车型异地收货分配引用，请先移除相关分配')
      return
    }
    setAddressBook(prev => prev.filter(a => a.id !== id))
  }

  // 车辆明细行增删改
  const addVehicle = () => setVehicles(prev => [...prev, emptyVehicle()])
  const patchVehicle = (key: string, patch: Partial<VehicleDetail>) =>
    setVehicles(prev => prev.map(v => (v.key === key ? { ...v, ...patch } : v)))

  // 车型异地发运分配（引用地址簿）增删改
  const addAllocation = (vKey: string) =>
    setVehicles(prev =>
      prev.map(v =>
        v.key === vKey
          ? { ...v, allocations: [...v.allocations, { key: uid(), addressId: '', approvedQty: 1, usedQty: 0 }] }
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
        if (v.allocations.length === 0) return `请为涉及异地收货的车型「${v.model || '未命名'}」至少录入一条异地收货分配`
        const addrIdSet = new Set<string>()
        let sum = 0
        for (const al of v.allocations) {
          if (!al.addressId || !findAddress(al.addressId)) return `请为车型「${v.model}」的异地收货分配选择收货地址`
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
    message.success(isSubmit ? '提交成功，备案已进入审批流程' : '保存成功，已同步至CRM')
    navigate('/vehicle/purchase/filings')
  }

  // 刷新：还原为进入页面时的数据
  const handleRefresh = () => {
    form.resetFields()
    setVehicles(existing ? existing.vehicleDetails.map(v => ({ ...v, allocations: v.allocations.map(a => ({ ...a })) })) : [emptyVehicle()])
    setAddressBook(existing ? existing.addressBook.map(a => ({ ...a })) : [])
    setLicenseCount(existing ? 1 : 0)
    setContractCount(existing ? 1 : 0)
    setExpandedKeys(existing ? existing.vehicleDetails.filter(v => v.involveRemote).map(v => v.key) : [])
    setSelectedVehicleKeys([])
    message.success('已刷新')
  }

  const removeSelectedVehicles = () => {
    if (selectedVehicleKeys.length === 0) {
      message.warning('请先勾选要删除的车辆明细')
      return
    }
    Modal.confirm({
      title: '删除车辆明细',
      content: `确认删除已选 ${selectedVehicleKeys.length} 条车辆明细？`,
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        setVehicles(prev => prev.filter(v => !selectedVehicleKeys.includes(v.key)))
        setExpandedKeys(prev => prev.filter(k => !selectedVehicleKeys.includes(k)))
        setSelectedVehicleKeys([])
        message.success('已删除')
      },
    })
  }

  return (
    <Space direction="vertical" size={semanticTokens.size.buttonGap} style={{ width: '100%' }}>
      <Card
        title={<span className="annot-filingform-rule-statusflow">{existing ? (readOnly ? '查看大客户备案' : '编辑大客户备案') : '新增大客户备案'}</span>}
        extra={
          <Space className="app-page-actions annot-filingform-action-topbar" size={8}>
            {existing && <Tag color={FILING_STATUS_COLOR[existing.status]}>{existing.status}</Tag>}
            <Button type="primary" icon={<ReloadOutlined />} onClick={handleRefresh}>刷新</Button>
            {!readOnly && <Button type="primary" onClick={() => handleSubmit(false)}>保存</Button>}
            {!readOnly && <Button type="primary" onClick={() => handleSubmit(true)}>提交</Button>}
            <Button type="primary" onClick={() => navigate('/vehicle/purchase/filings')}>退出</Button>
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
            dealerCode: existing?.dealerCode ?? 'FCBTEST004',
            projectName: existing?.projectName,
            customerNo: existing?.customerNo,
            deadline: existing?.deadline ? dayjs(existing.deadline) : undefined,
            network: existing?.network ?? '方程豹',
            remark: existing?.remark,
            crmNo: existing?.crmNo,
          }}
        >
          {/* 基本信息 */}
          <div className="app-section-title" style={{ margin: '4px 0 12px' }}>基本信息</div>
          <div className="annot-filingform-field-basicinfo" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
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
            是否涉及异地收货在车辆明细中按车型逐行标识；任一车型涉及异地收货时，该备案即视为涉及异地收货。
          </div>

          {/* 附件：标签左、上传附件链接右，纵向排列 */}
          <div className="app-section-title">附件</div>
          <div className="app-attach-list">
            <div className="app-attach-row">
              <span className="app-attach-label">大客户营业执照</span>
              <Upload maxCount={1} disabled={readOnly} beforeUpload={() => false} onChange={({ fileList }) => setLicenseCount(fileList.length)}>
                <a className="app-upload-link"><CloudUploadOutlined /> 上传附件</a>
              </Upload>
            </div>
            <div className="app-attach-row">
              <span className="app-attach-label">大客户合同</span>
              <Upload maxCount={1} disabled={readOnly} beforeUpload={() => false} onChange={({ fileList }) => setContractCount(fileList.length)}>
                <a className="app-upload-link"><CloudUploadOutlined /> 上传附件</a>
              </Upload>
            </div>
          </div>

          {/* 异地收货地址簿（备案级，地址录一次，供车型分配引用） */}
          <AddressBookTable
            addressBook={addressBook}
            readOnly={readOnly}
            patchAddressEntry={patchAddressEntry}
            removeAddressEntry={removeAddressEntry}
            addAddressEntry={addAddressEntry}
          />

          {/* 车辆明细：标题左、添加/删除右；勾选后点删除 */}
          <div className="app-section-bar">
            <div className="app-section-title" style={{ margin: 0 }}>车辆明细</div>
            {!readOnly && (
              <Space size={8}>
                <Button className="app-btn-tertiary" icon={<PlusOutlined />} onClick={addVehicle}>添加</Button>
                <Button className="app-icon-btn-danger" icon={<DeleteOutlined />} onClick={removeSelectedVehicles} />
              </Space>
            )}
          </div>
          <Table
            className="app-vehicle-table annot-filingform-field-vehicletable"
            rowKey="key"
            dataSource={vehicles}
            pagination={false}
            locale={{ emptyText: '暂无数据' }}
            rowSelection={readOnly ? undefined : {
              selectedRowKeys: selectedVehicleKeys,
              onChange: keys => setSelectedVehicleKeys(keys as string[]),
            }}
            columns={[
              {
                title: '序号',
                width: 64,
                align: 'center',
                render: (_: unknown, __: VehicleDetail, index: number) => index + 1,
              },
              {
                title: '车系',
                dataIndex: 'series',
                render: (val: string) => (
                  <Input value={val} placeholder="自动带出" disabled />
                ),
              },
              {
                title: '车系编码',
                dataIndex: 'seriesCode',
                width: 110,
                render: (val: string) => (
                  <Input value={val} placeholder="自动带出" disabled />
                ),
              },
              {
                title: '车型编码',
                dataIndex: 'modelCode',
                width: 120,
                render: (val: string) => (
                  <Input value={val} placeholder="自动带出" disabled />
                ),
              },
              {
                title: '车型',
                dataIndex: 'model',
                render: (val: string, r: VehicleDetail) => (
                  <Select
                    value={val || undefined}
                    placeholder="请选择"
                    disabled={readOnly}
                    style={{ width: '100%' }}
                    options={VEHICLE_MODELS.map(m => ({ value: m.model, label: m.model }))}
                    onChange={model => {
                      const found = model ? findVehicleModel(model) : undefined
                      patchVehicle(r.key, found
                        ? { model: found.model, modelCode: found.modelCode, series: found.series, seriesCode: found.seriesCode }
                        : { model: '', modelCode: '', series: '', seriesCode: '' })
                    }}
                    allowClear
                  />
                ),
              },
              {
                title: '数量',
                dataIndex: 'quantity',
                width: 120,
                render: (val: number, r: VehicleDetail) => (
                  <InputNumber
                    className="app-required-placeholder"
                    min={1}
                    precision={0}
                    value={val > 0 ? val : null}
                    placeholder="必填"
                    style={{ width: '100%' }}
                    disabled={readOnly}
                    onChange={n => patchVehicle(r.key, { quantity: Number(n) || 0 })}
                  />
                ),
              },
              { title: '已用数量', dataIndex: 'usedQty', width: 90 },
              {
                title: '是否涉及异地收货',
                dataIndex: 'involveRemote',
                width: 160,
                render: (val: boolean, r: VehicleDetail) => (
                  <Radio.Group
                    value={val}
                    disabled={readOnly}
                    onChange={e => {
                      const next = e.target.value as boolean
                      patchVehicle(r.key, next ? { involveRemote: true } : { involveRemote: false, allocations: [] })
                      setExpandedKeys(prev => (next ? [...new Set([...prev, r.key])] : prev.filter(k => k !== r.key)))
                    }}
                    options={[
                      { value: true, label: '是' },
                      { value: false, label: '否' },
                    ]}
                  />
                ),
              },
            ]}
            expandable={{
              expandedRowKeys: expandedKeys,
              onExpandedRowsChange: keys => setExpandedKeys(keys as string[]),
              rowExpandable: (r: VehicleDetail) => r.involveRemote,
              expandedRowRender: (r: VehicleDetail) => (
                <div
                  className="annot-filingform-field-remoteallocation"
                  style={{
                    margin: '4px 0 12px 48px',
                    padding: '10px 12px 12px',
                    background: '#f5f7fa',
                    border: '1px solid #d6e0f0',
                    borderLeft: '3px solid #1677ff',
                    borderRadius: 4,
                  }}
                >
                  <div className="app-section-bar" style={{ margin: '0 0 8px' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#5a6b87' }}>
                      异地收货分配 · 车型「{r.model || '未命名'}」
                      <span style={{ fontWeight: 400, marginLeft: 6 }}>
                        （从地址簿选地址，各地址核定数之和不超过车型数量 {r.quantity}）
                      </span>
                    </div>
                    {!readOnly && (
                      <Button className="app-btn-tertiary" size="small" icon={<PlusOutlined />} onClick={() => addAllocation(r.key)}>
                        添加
                      </Button>
                    )}
                  </div>
                  <Table
                    className="app-subtable annot-filingform-rule-remoteallocation"
                    rowKey="key"
                    size="small"
                    pagination={false}
                    dataSource={r.allocations}
                    locale={{ emptyText: '暂无数据' }}
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
                        title: '已用数量',
                        dataIndex: 'usedQty',
                        width: 90,
                        render: (val: number) => val ?? 0,
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

          {/* 签批表：与附件一致，用上传附件链接 */}
          <div className="app-section-title">签批表</div>
          <div className="app-attach-row annot-filingform-field-attachments">
            <Upload beforeUpload={() => false} disabled={readOnly}>
              <a className="app-upload-link"><CloudUploadOutlined /> 上传附件</a>
            </Upload>
            <span style={{ color: semanticTokens.color.filterLabelText, fontSize: 12 }}>仅大客户区域经理审批节点可上传，随备案单归档</span>
          </div>

          {/* 审批记录：新增时也展示空表 */}
          <div id="approvals" className="app-section-title">审批记录</div>
          <Table
            className="annot-filingform-field-approvals"
            rowKey="key"
            size="small"
            pagination={false}
            dataSource={existing?.approvals ?? []}
            locale={{ emptyText: '暂无数据' }}
            columns={[
              { title: '序号', width: 64, align: 'center', render: (_: unknown, __: unknown, index: number) => index + 1 },
              { title: '审批人', dataIndex: 'approver' },
              { title: '审批节点', dataIndex: 'node' },
              { title: '审批时间', dataIndex: 'approvedAt' },
              { title: '审批意见', dataIndex: 'opinion' },
              { title: '下一审批节点', dataIndex: 'nextNode' },
              { title: '下一节点审批人', dataIndex: 'nextApprover' },
            ]}
          />
        </Form>
      </Card>
    </Space>
  )
}
