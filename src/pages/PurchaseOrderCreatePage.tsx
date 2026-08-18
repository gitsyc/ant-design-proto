// 采购订单 - 新建页（普通采购新增）
// 布局：订单信息 + 收货信息两段。大客户订单增强：关联项目带出大客户编号，
// 按所选车型在备案中的异地发运配置判定「是否异地发车」（可选/固定），异地发车=是时加载异地收货地址（多个可选）并校验发车数量。
import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button, Card, Form, Input, InputNumber, Select, Space, message } from '../ui'
import { semanticTokens } from '../theme/tokens'
import {
  findProjectModel,
  getApprovedProjects,
  getProjectModels,
  type ProjectModelInfo,
  type RemoteMode,
} from '../data/majorCustomerFilings'
import { VEHICLE_CONFIGS, configToFormFields, emptyConfigFields, findVehicleConfig } from '../data/vehicleConfigs'

function useSalesOrderNoFromSearch() {
  const location = useLocation()
  return useMemo(() => new URLSearchParams(location.search).get('salesOrderNo') ?? '', [location.search])
}

// 只读展示型字段（原型：订单信息中沿用现有采购字段，静态展示）
function StaticField({ label, value, required }: { label: string; value?: string; required?: boolean }) {
  return (
    <Form.Item label={label} required={required}>
      <Input value={value ?? ''} placeholder="-" disabled />
    </Form.Item>
  )
}

function AutoField({ name, label, required }: { name: string; label: string; required?: boolean }) {
  return (
    <Form.Item name={name} label={label} required={required}>
      <Input placeholder="自动带出" disabled />
    </Form.Item>
  )
}

export default function PurchaseOrderCreatePage() {
  const navigate = useNavigate()
  const salesOrderNo = useSalesOrderNoFromSearch()
  const [form] = Form.useForm()

  const [isMajor, setIsMajor] = useState<'是' | '否'>('否')
  const [project, setProject] = useState<string>('')
  const [customerNo, setCustomerNo] = useState<string>('')
  const [model, setModel] = useState<string>('')
  const [remoteDispatch, setRemoteDispatch] = useState<'是' | '否'>('否')
  const [addressId, setAddressId] = useState<string>('')
  const [qty, setQty] = useState<number | null>(null)
  const payType = Form.useWatch('payType', form)
  const modelCode = Form.useWatch('modelCode', form) as string | undefined

  const projects = useMemo(() => getApprovedProjects(), [])
  const projectModels = useMemo<ProjectModelInfo[]>(() => (project ? getProjectModels(project) : []), [project])
  const modelInfo = useMemo(
    () => projectModels.find(m => m.model === model || (!!modelCode && m.modelCode === modelCode)),
    [projectModels, model, modelCode],
  )
  const remoteMode: RemoteMode | undefined = modelInfo?.remoteMode
  const addresses = modelInfo?.addresses ?? []
  const remoteEditable = remoteMode === 'optional'
  const remoteValueFor = (mode: RemoteMode | undefined): '是' | '否' => (mode === 'forced-yes' ? '是' : '否')
  const remoteDisplay: '是' | '否' = remoteMode === 'forced-yes' ? '是' : remoteMode === 'optional' ? remoteDispatch : '否'
  const showRemote = isMajor === '是' && remoteDisplay === '是'
  const effectiveAddressId =
    remoteDisplay !== '是' ? '' : addressId || (addresses.length === 1 ? addresses[0].addressId : '')
  const selectedAddr = addresses.find(a => a.addressId === effectiveAddressId)
  const remain = selectedAddr ? selectedAddr.remain : 0

  const applyRemoteFromFiling = (projectName: string, modelName: string, code?: string) => {
    setModel(modelName)
    const info = findProjectModel(projectName, modelName, code)
    const rd = remoteValueFor(info?.remoteMode)
    setRemoteDispatch(rd)
    const addrs = info?.addresses ?? []
    setAddressId(rd === '是' && addrs.length === 1 ? addrs[0].addressId : '')
  }

  // 切换是否大客户
  const onMajorChange = (val: '是' | '否') => {
    setIsMajor(val)
    if (val === '否') {
      setProject('')
      setCustomerNo('')
      setRemoteDispatch('否')
      setAddressId('')
      form.setFieldsValue({ projectName: undefined, customerNo: undefined })
      return
    }
    const currentModel = (form.getFieldValue('model') as string) || ''
    if (currentModel) applyRemoteFromFiling(project, currentModel, form.getFieldValue('modelCode'))
  }

  // 选中大客户项目：带出大客户编号；按备案中该车型重算是否异地发车（须传入新项目名，避免闭包旧值）
  const onProjectChange = (val: string) => {
    setProject(val)
    const p = projects.find(item => item.value === val)
    setCustomerNo(p?.customerNo ?? '')
    form.setFieldsValue({ customerNo: p?.customerNo })
    const currentModel = (form.getFieldValue('model') as string) || ''
    if (currentModel) applyRemoteFromFiling(val, currentModel, form.getFieldValue('modelCode'))
    else {
      setRemoteDispatch('否')
      setAddressId('')
    }
  }

  const onRemoteDispatchChange = (val: '是' | '否') => {
    setRemoteDispatch(val)
    setAddressId(val === '是' && addresses.length === 1 ? addresses[0].addressId : '')
  }

  // 选配置名称：带出配置代码、车系、车型、内饰/外饰/产地、轮毂、时空光翼、选装（只读）
  const onConfigChange = (name: string | undefined) => {
    const cfg = name ? findVehicleConfig(name) : undefined
    form.setFieldsValue(cfg ? configToFormFields(cfg) : emptyConfigFields())
    const nextModel = cfg?.modelName ?? ''
    if (isMajor === '是' && nextModel) applyRemoteFromFiling(project, nextModel, cfg?.modelCode)
    else {
      setModel(nextModel)
      if (isMajor === '是') {
        setRemoteDispatch('否')
        setAddressId('')
      }
    }
  }

  const handleSubmit = async () => {
    try {
      await form.validateFields()
    } catch {
      return
    }
    if (!qty || qty <= 0) {
      message.error('请录入有效的正整数采购数量')
      return
    }
    if (isMajor === '是') {
      if (!project) {
        message.error('请先选择已审核通过的大客户项目备案')
        return
      }
      if (!model) {
        message.error('请选择车型')
        return
      }
      if (remoteDisplay === '是') {
        if (!selectedAddr) {
          message.error('请选择异地收货地址')
          return
        }
        if (qty > remain) {
          message.error(`发往该收货地址的发车数量已超过备案核定数量，剩余可发 ${remain} 台`)
          return
        }
      }
    }
    message.success('提交成功')
    navigate('/vehicle/purchase/orders')
  }

  const remoteHint =
    !project || !model
      ? '请先选择大客户项目和配置名称，系统按该车型在备案中是否涉及异地收货判定'
      : remoteMode === 'optional'
        ? `该车型部分异地收货（备案核定异地 ${modelInfo?.remoteApprovedSum}／需求 ${modelInfo?.totalQty}），可选择本单是否异地发车`
        : remoteMode === 'forced-yes'
          ? '该车型备案全部异地收货，本单固定为异地发车'
          : '该车型备案未涉及异地收货，本单不异地发车'

  const grid4 = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 } as const

  return (
    <Space direction="vertical" size={semanticTokens.size.buttonGap} style={{ width: '100%' }}>
      <Card
        title="普通采购新增"
        extra={
          <Space size={semanticTokens.size.buttonGap}>
            <Button type="primary" onClick={handleSubmit}>保存</Button>
            <Button className="app-btn-tertiary">
              <Link to="/vehicle/purchase/orders">退出</Link>
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          colon={false}
          initialValues={{ salesOrderNo, isMajor: '否' }}
        >
          {/* 订单信息 */}
          <div style={{ margin: '4px 0 12px', fontWeight: 600, borderLeft: '3px solid #1677ff', paddingLeft: 8 }}>订单信息</div>
          <div style={grid4} className="annot-ordercreate-field-order-info">
            <StaticField label="经销商代码" value="FCBTEST004" required />
            <StaticField label="经销商名称" value="杭州方程豹汽车销售有限公司" required />
            <Form.Item name="orderMode" label="订单方式" required initialValue="普通">
              <Select options={[{ value: '普通', label: '普通' }, { value: '紧急', label: '紧急' }]} />
            </Form.Item>
            <Form.Item name="orderPurpose" label="订单用途" required initialValue="普通用车">
              <Select options={[{ value: '普通用车', label: '普通用车' }, { value: '大客户用车', label: '大客户用车' }]} />
            </Form.Item>
            <Form.Item name="orderType" label="订单类型" required rules={[{ required: true, message: '请选择订单类型' }]}>
              <Select placeholder="请选择" options={[{ value: '现货采购', label: '现货采购' }, { value: '订单采购', label: '订单采购' }]} />
            </Form.Item>
            <Form.Item name="configName" label="配置名称" required rules={[{ required: true, message: '请选择配置名称' }]}>
              <Select
                placeholder="请选择配置名称"
                showSearch
                allowClear
                optionFilterProp="label"
                options={VEHICLE_CONFIGS.map(c => ({ value: c.name, label: c.name }))}
                onChange={v => onConfigChange(v as string | undefined)}
              />
            </Form.Item>
            <AutoField name="configCode" label="配置代码" />
            <AutoField name="seriesCode" label="车系代码" />
            <AutoField name="seriesName" label="车系名称" />
            <AutoField name="modelCode" label="车型代码" />
            <AutoField name="model" label="车型名称" required />
            <Form.Item name="qty" label="采购数量" required rules={[{ required: true, message: '请录入采购数量' }]}>
              <InputNumber
                min={1}
                precision={0}
                style={{ width: '100%' }}
                placeholder="请输入采购数量"
                onChange={n => setQty(n as number | null)}
              />
            </Form.Item>
            <AutoField name="interior" label="内饰" />
            <AutoField name="exterior" label="外饰" />
            <AutoField name="origin" label="产地" />
            <Form.Item name="payType" label="付款类型" required rules={[{ required: true, message: '请选择付款类型' }]}>
              <Select
                placeholder="请选择"
                allowClear
                options={[{ value: '三方', label: '三方' }, { value: '全款', label: '全款' }]}
                onChange={v => {
                  if (v !== '三方') form.setFieldsValue({ invoiceBank: undefined, bankDirect: undefined, draftNo: undefined })
                }}
              />
            </Form.Item>
            {payType === '三方' && (
              <>
                <Form.Item name="invoiceBank" label="开票银行" required rules={[{ required: true, message: '请输入开票银行' }]}>
                  <Input placeholder="请输入" />
                </Form.Item>
                <Form.Item name="bankDirect" label="是否银企直连" required rules={[{ required: true, message: '请选择是否银企直连' }]}>
                  <Select placeholder="请选择" options={[{ value: '是', label: '是' }, { value: '否', label: '否' }]} />
                </Form.Item>
                <Form.Item name="draftNo" label="汇票号">
                  <Input placeholder="请输入" />
                </Form.Item>
              </>
            )}
            <Form.Item name="price" label="采购价" required rules={[{ required: true, message: '请输入采购价' }]}>
              <Input placeholder="请输入" />
            </Form.Item>
            <Form.Item name="amount" label="总金额" required rules={[{ required: true, message: '请输入总金额' }]}>
              <Input placeholder="请输入" />
            </Form.Item>
            <AutoField name="hub" label="轮毂" />
            <AutoField name="lightWing" label="时空光翼" />
            <AutoField name="option1" label="选装1" />
            <AutoField name="tire" label="轮胎" />
            <AutoField name="option3" label="选装3" />
            <AutoField name="option4" label="选装4" />
            <AutoField name="option5" label="选装5" />
            <AutoField name="option2" label="选装2" />
            <AutoField name="option7" label="选装7" />
            <AutoField name="option8" label="选装8" />
            <AutoField name="option9" label="选装9" />
            <AutoField name="option6" label="选装6" />
            <Form.Item name="isMajor" label="是否大客户" required className="annot-ordercreate-rule-major-customer">
              <Select
                options={[{ value: '是', label: '是' }, { value: '否', label: '否' }]}
                onChange={v => onMajorChange(v as '是' | '否')}
              />
            </Form.Item>
            {isMajor === '是' && (
              <>
                <Form.Item name="projectName" label="大客户项目" required rules={[{ required: true, message: '请先选择已审核通过的大客户项目备案' }]}>
                  <Select
                    placeholder={projects.length ? '请选择已审核备案的大客户项目' : '暂无已审核备案的大客户项目'}
                    options={projects}
                    onChange={v => onProjectChange(v as string)}
                    showSearch
                    optionFilterProp="label"
                  />
                </Form.Item>
                <Form.Item name="customerNo" label="大客户编号" required>
                  <Input value={customerNo} placeholder="选择项目后自动带出" disabled />
                </Form.Item>
                <Form.Item label="是否异地发车" required extra={remoteHint} className="annot-ordercreate-rule-remote-dispatch">
                  <Select
                    value={remoteDisplay}
                    disabled={!project || !model || !remoteEditable}
                    options={[{ value: '是', label: '是' }, { value: '否', label: '否' }]}
                    onChange={v => onRemoteDispatchChange(v as '是' | '否')}
                  />
                </Form.Item>
              </>
            )}
            <Form.Item name="remark" label="备注" style={{ gridColumn: 'span 2' }} rules={[{ max: 200 }]}>
              <Input.TextArea placeholder="请输入" maxLength={200} showCount autoSize={{ minRows: 2, maxRows: 4 }} />
            </Form.Item>
          </div>
          {/* 收货信息 */}
          <div style={{ margin: '16px 0 12px', fontWeight: 600, borderLeft: '3px solid #1677ff', paddingLeft: 8 }}>收货信息</div>
          {showRemote ? (
            <div style={grid4} className="annot-ordercreate-field-receiving-info">
              <StaticField label="发货方式" value="船运" required />
              {addresses.length > 1 && (
                <Form.Item label="异地收货地址" required extra="该车型备案有多个收货地址，请选择">
                  <Select
                    value={effectiveAddressId || undefined}
                    placeholder="请选择异地收货地址"
                    options={addresses.map(a => ({ value: a.addressId, label: a.address }))}
                    onChange={v => setAddressId(v as string)}
                  />
                </Form.Item>
              )}
              <StaticField label="省市区" value={selectedAddr ? `${selectedAddr.province}/${selectedAddr.city}/${selectedAddr.district}` : ''} />
              <StaticField label="详细地址" value={selectedAddr?.detailAddress} required />
              <StaticField label="联系人" value={selectedAddr?.contact} />
              <StaticField label="手机号" value={selectedAddr?.mobile} />
              <StaticField label="固定电话" value={selectedAddr?.landline} />
              {selectedAddr && (
                <Form.Item label="发车数量校验" extra={`本组合剩余可发 ${remain} 台`} className="annot-ordercreate-rule-qty-check">
                  <Input value={`本单采购 ${qty ?? 0} 台`} disabled />
                </Form.Item>
              )}
            </div>
          ) : (
            <div style={grid4} className="annot-ordercreate-field-receiving-info">
              <Form.Item name="deliveryType" label="发货方式" required>
                <Select placeholder="请选择" options={[{ value: '船运', label: '船运' }, { value: '陆运', label: '陆运' }]} />
              </Form.Item>
              <Form.Item name="regionText" label="省市区">
                <Input placeholder="省/市/区" />
              </Form.Item>
              <Form.Item name="detailAddress" label="详细地址" required rules={[{ required: true, message: '请输入详细地址' }]}>
                <Input placeholder="请输入详细地址" />
              </Form.Item>
              <Form.Item name="contact" label="联系人">
                <Input placeholder="请输入联系人" />
              </Form.Item>
              <Form.Item name="mobile" label="手机号">
                <Input placeholder="请输入手机号" />
              </Form.Item>
              <Form.Item name="landline" label="固定电话">
                <Input placeholder="区号-号码" />
              </Form.Item>
            </div>
          )}
        </Form>
      </Card>
    </Space>
  )
}
