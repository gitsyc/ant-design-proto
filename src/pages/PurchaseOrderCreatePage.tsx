// 采购订单 - 新建页（普通采购新增）
// 布局：订单信息 + 收货信息两段。大客户订单增强：关联项目带出大客户编号，
// 按所选车型在备案中的异地发运配置判定「是否异地发车」（可选/固定），异地发车=是时加载异地收货地址（多个可选）并校验发车数量。
import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button, Card, Form, Input, InputNumber, Select, Space, message } from '../ui'
import { semanticTokens } from '../theme/tokens'
import {
  getApprovedProjects,
  getProjectModels,
  type ProjectModelInfo,
  type RemoteMode,
} from '../data/majorCustomerFilings'

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

  const projects = useMemo(() => getApprovedProjects(), [])
  const projectModels = useMemo<ProjectModelInfo[]>(() => (project ? getProjectModels(project) : []), [project])
  const modelOptions = useMemo(() => projectModels.map(m => ({ value: m.model, label: m.model })), [projectModels])
  const modelInfo = useMemo(() => projectModels.find(m => m.model === model), [projectModels, model])
  const remoteMode: RemoteMode | undefined = modelInfo?.remoteMode
  const addresses = modelInfo?.addresses ?? []
  const selectedAddr = addresses.find(a => a.addressId === addressId)
  const remain = selectedAddr ? selectedAddr.remain : 0
  const showRemote = isMajor === '是' && remoteDispatch === '是'

  // 依据车型的异地发运模式推导「是否异地发车」取值与是否可选
  const remoteEditable = remoteMode === 'optional'
  const remoteValueFor = (mode: RemoteMode | undefined): '是' | '否' => (mode === 'forced-yes' ? '是' : '否')

  // 切换是否大客户
  const onMajorChange = (val: '是' | '否') => {
    setIsMajor(val)
    if (val === '否') {
      setProject('')
      setCustomerNo('')
      setModel('')
      setRemoteDispatch('否')
      setAddressId('')
      form.setFieldsValue({ projectName: undefined, customerNo: undefined, model: undefined })
    }
  }

  // 选中大客户项目：带出大客户编号，重置车型及下级
  const onProjectChange = (val: string) => {
    setProject(val)
    const p = projects.find(p => p.value === val)
    setCustomerNo(p?.customerNo ?? '')
    setModel('')
    setRemoteDispatch('否')
    setAddressId('')
    form.setFieldsValue({ customerNo: p?.customerNo, model: undefined })
  }

  // 选中车型：按备案配置定「是否异地发车」，异地时若唯一地址自动带出
  const onModelChange = (val: string) => {
    setModel(val)
    const info = getProjectModels(project).find(m => m.model === val)
    const rd = remoteValueFor(info?.remoteMode)
    setRemoteDispatch(rd)
    const addrs = info?.addresses ?? []
    setAddressId(rd === '是' && addrs.length === 1 ? addrs[0].addressId : '')
  }

  const onRemoteDispatchChange = (val: '是' | '否') => {
    setRemoteDispatch(val)
    setAddressId(val === '是' && addresses.length === 1 ? addresses[0].addressId : '')
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
        message.error('请先选择已完成备案的大客户项目')
        return
      }
      if (!model) {
        message.error('请选择车型')
        return
      }
      if (remoteDispatch === '是') {
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
    remoteMode === 'optional'
      ? `该车型部分异地发运（备案核定异地 ${modelInfo?.remoteApprovedSum}／需求 ${modelInfo?.totalQty}），可选择本单是否异地发车`
      : remoteMode === 'forced-yes'
        ? '该车型备案全部异地发运，本单固定为异地发车'
        : model
          ? '该车型备案未涉及异地发运，本单不异地发车'
          : ''

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
          <div style={grid4}>
            <StaticField label="经销商代码" value="FCBTEST004" required />
            <StaticField label="经销商名称" value="杭州方程豹汽车销售有限公司" required />
            <StaticField label="订单方式" value="普通" required />
            <StaticField label="订单用途" value="普通用车" required />
            <StaticField label="订单类型" value="请选择" required />
            <StaticField label="配置名称" value="zdh40551085车型" required />
            <StaticField label="配置代码" value="zdh40551085" />
            <StaticField label="车系代码" value="HJF001" />
            <StaticField label="车系名称" value="测试专属车系001" />
            <StaticField label="车型代码" value="zdh40551085" />
            {/* 车型名称：大客户订单下从备案项目车型选择（驱动是否异地发车）；非大客户静态展示 */}
            {isMajor === '是' ? (
              <Form.Item name="model" label="车型名称" required extra="选择备案项目中的车型">
                <Select
                  placeholder={project ? (modelOptions.length ? '请选择车型' : '该项目无车型') : '请先选择大客户项目'}
                  disabled={!project}
                  options={modelOptions}
                  onChange={onModelChange}
                />
              </Form.Item>
            ) : (
              <StaticField label="车型名称" value="zdh40551085" required />
            )}
            <Form.Item name="qty" label="采购数量" required rules={[{ required: true, message: '请录入采购数量' }]}>
              <InputNumber
                min={1}
                precision={0}
                style={{ width: '100%' }}
                placeholder="请输入采购数量"
                onChange={n => setQty(n as number | null)}
              />
            </Form.Item>
            <StaticField label="内饰" />
            <StaticField label="外饰" />
            <StaticField label="产地" />
            <StaticField label="付款类型" value="三方" required />
            <StaticField label="采购价" value="-" required />
            <StaticField label="总金额" value="-" required />
            <StaticField label="开票银行" value="兴业银行股份有限公司深圳分行" required />
            <StaticField label="是否银企直连" value="否" required />
            <StaticField label="汇票号" value="2030404044004" />
          </div>

          {/* 大客户信息（是否大客户=是时展示项目/编号/是否异地发车） */}
          <div style={{ ...grid4, marginTop: 4 }}>
            <Form.Item name="isMajor" label="是否大客户" required>
              <Select
                options={[{ value: '是', label: '是' }, { value: '否', label: '否' }]}
                onChange={v => onMajorChange(v as '是' | '否')}
              />
            </Form.Item>
            {isMajor === '是' && (
              <>
                <Form.Item name="projectName" label="大客户项目" required rules={[{ required: true, message: '请先选择已完成备案的大客户项目' }]}>
                  <Select
                    placeholder={projects.length ? '请选择已通过备案的大客户项目' : '暂无已完成备案的大客户项目'}
                    options={projects}
                    onChange={v => onProjectChange(v as string)}
                    showSearch
                    optionFilterProp="label"
                  />
                </Form.Item>
                <Form.Item name="customerNo" label="大客户编号" required>
                  <Input value={customerNo} placeholder="选择项目后自动带出" disabled />
                </Form.Item>
                <Form.Item label="是否异地发车" required extra={remoteHint}>
                  <Select
                    value={remoteDispatch}
                    disabled={!model || !remoteEditable}
                    options={[{ value: '是', label: '是' }, { value: '否', label: '否' }]}
                    onChange={v => onRemoteDispatchChange(v as '是' | '否')}
                  />
                </Form.Item>
              </>
            )}
          </div>
          {/* 收货信息 */}
          <div style={{ margin: '16px 0 12px', fontWeight: 600, borderLeft: '3px solid #1677ff', paddingLeft: 8 }}>收货信息</div>
          {showRemote ? (
            <div style={grid4}>
              <StaticField label="发货方式" value="船运" required />
              {addresses.length > 1 && (
                <Form.Item label="异地收货地址" required extra="该车型备案有多个收货地址，请选择">
                  <Select
                    value={addressId || undefined}
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
                <Form.Item label="发车数量校验" extra={`本组合剩余可发 ${remain} 台`}>
                  <Input value={`本单采购 ${qty ?? 0} 台`} disabled />
                </Form.Item>
              )}
            </div>
          ) : (
            <div style={grid4}>
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
