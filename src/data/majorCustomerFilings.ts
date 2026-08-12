// 大客户备案共享数据（静态原型：模块级数组，供备案列表 / 表单 / 采购订单读取）
// 说明：车型只在车辆明细录一次；异地收货地址明细挂在车型下（主从结构）。

export type FilingStatus = '草稿' | '待审批' | '审批中' | '已通过' | '已驳回' | '已取消'

// 异地收货地址簿条目（备案级，地址录一次并有稳定 id，供车型异地发运分配引用）
export interface AddressBookEntry {
  id: string // 稳定标识（组合/校验/采购匹配均以此为键）
  province: string // 省
  city: string // 市
  district: string // 区
  detailAddress: string // 详细地址（手工填写；同一备案内 省市区+详细地址 不可重复）
  contact?: string // 联系人
  mobile?: string // 手机号
  landline?: string // 固定电话
}

// 拼接省市区+详细地址为完整地址文本（展示/去重用）
export function formatFullAddress(a: {
  province?: string
  city?: string
  district?: string
  detailAddress?: string
}): string {
  return `${a.province ?? ''}${a.city ?? ''}${a.district ?? ''}${a.detailAddress ?? ''}`
}

// 车型异地发运分配（挂在车辆明细车型下，引用地址簿地址 + 核定发车数量）
export interface RemoteAllocation {
  key: string
  addressId: string // 引用地址簿条目 id（不重复录入地址文本）
  approvedQty: number // 核定发车数量（该车型发往该地址的上限）
}

// 车辆明细行（本备案车型与数量的唯一录入处）
export interface VehicleDetail {
  key: string
  series: string // 车系
  seriesCode: string // 车系编码
  modelCode: string // 车型编码
  model: string // 车型
  quantity: number // 需求数量
  usedQty: number // 已用数量（系统统计）
  involveRemote: boolean // 是否涉及异地发运（车型级，逐行标识）
  allocations: RemoteAllocation[] // 异地发运分配（该车型涉及异地发运时录入，引用地址簿）
}

// 审批记录
export interface ApprovalRecord {
  key: string
  approver: string // 审批人
  node: string // 审批节点
  approvedAt: string // 审批时间
  opinion: string // 审批意见
  nextNode: string // 下一审批节点
  nextApprover: string // 下一节点审批人
}

// 大客户备案单
export interface MajorCustomerFiling {
  key: string
  projectName: string // 大客户项目
  customerNo: string // 大客户编号
  dealerName: string // 经销商名称
  dealerCode: string // 经销商编码
  deadline: string // 交期截止
  network: string // 网络
  remark?: string // 备注
  crmNo?: string // CRM单据编号
  status: FilingStatus // 备案状态
  createdBy: string // 创建人
  createdAt: string // 创建时间
  addressBook: AddressBookEntry[] // 异地收货地址簿（备案级，供车型分配引用）
  vehicleDetails: VehicleDetail[] // 车辆明细（含车型异地发运分配）
  approvals: ApprovalRecord[] // 审批记录
}

// 备案状态枚举（全项目统一）
export const FILING_STATUS_OPTIONS: { value: FilingStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: '草稿', label: '草稿' },
  { value: '待审批', label: '待审批' },
  { value: '审批中', label: '审批中' },
  { value: '已通过', label: '已通过' },
  { value: '已驳回', label: '已驳回' },
  { value: '已取消', label: '已取消' },
]

// 状态标签颜色映射
export const FILING_STATUS_COLOR: Record<FilingStatus, string> = {
  草稿: 'default',
  待审批: 'processing',
  审批中: 'processing',
  已通过: 'success',
  已驳回: 'error',
  已取消: 'default',
}

// 模块级持久化数据（原型内存态）
export const majorCustomerFilings: MajorCustomerFiling[] = [
  {
    key: 'MCF-20260801-0001',
    projectName: '成渝物流集团采购项目',
    customerNo: 'KH-CQ-0001',
    dealerName: '杭州方程豹汽车销售有限公司',
    dealerCode: 'DLR-HZ-001',
    deadline: '2026-09-30',
    network: '方程豹',
    remark: '分批发往成都、重庆两地',
    crmNo: 'CRM-20260801-8801',
    status: '已通过',
    createdBy: '张磊',
    createdAt: '2026-08-01 10:20',
    addressBook: [
      { id: 'addr-cd', province: '四川省', city: '成都市', district: '双流区', detailAddress: '东升街道商都路611号', contact: '王成', mobile: '13800000001', landline: '028-88886666' },
      { id: 'addr-cq', province: '重庆市', city: '重庆市', district: '渝北区', detailAddress: '龙溪街道龙溪路22号', contact: '李渝', mobile: '13800000002', landline: '023-66668888' },
    ],
    vehicleDetails: [
      {
        key: 'v1',
        series: '豹5',
        seriesCode: 'BAO5',
        modelCode: 'BAO5-STD',
        model: '豹5 标准版',
        quantity: 12,
        usedQty: 3,
        involveRemote: true,
        // 豹5 发往成都、重庆两地；核定异地 6+4=10 < 需求 12 → 部分异地（采购页「是否异地发车」可选）
        allocations: [
          { key: 'al1', addressId: 'addr-cd', approvedQty: 6 },
          { key: 'al2', addressId: 'addr-cq', approvedQty: 4 },
        ],
      },
      {
        key: 'v2',
        series: '豹8',
        seriesCode: 'BAO8',
        modelCode: 'BAO8-FLAG',
        model: '豹8 旗舰版',
        quantity: 5,
        usedQty: 0,
        involveRemote: true,
        // 豹8 复用成都地址（地址簿只录一次）
        allocations: [
          { key: 'al3', addressId: 'addr-cd', approvedQty: 5 },
        ],
      },
    ],
    approvals: [
      { key: 'r1', approver: '陈区域', node: '大客户区域经理', approvedAt: '2026-08-01 14:00', opinion: '同意，已上传签批表', nextNode: '战区总', nextApprover: '赵战区' },
      { key: 'r2', approver: '赵战区', node: '战区总', approvedAt: '2026-08-02 09:30', opinion: '同意', nextNode: '大客户部经理', nextApprover: '孙部长' },
      { key: 'r3', approver: '孙部长', node: '大客户部经理', approvedAt: '2026-08-02 16:10', opinion: '同意', nextNode: '三方科', nextApprover: '周三方' },
      { key: 'r4', approver: '周三方', node: '三方科', approvedAt: '2026-08-03 10:05', opinion: '异地发运核定通过', nextNode: '-', nextApprover: '-' },
    ],
  },
  {
    key: 'MCF-20260805-0002',
    projectName: '西部租赁大客户项目',
    customerNo: 'KH-XB-0002',
    dealerName: '杭州方程豹汽车销售有限公司',
    dealerCode: 'DLR-HZ-001',
    deadline: '2026-10-15',
    network: '方程豹',
    remark: '',
    crmNo: 'CRM-20260805-8815',
    status: '待审批',
    createdBy: '张磊',
    createdAt: '2026-08-05 11:00',
    addressBook: [],
    vehicleDetails: [
      { key: 'v1', series: '豹5', seriesCode: 'BAO5', modelCode: 'BAO5-STD', model: '豹5 标准版', quantity: 8, usedQty: 0, involveRemote: false, allocations: [] },
    ],
    approvals: [],
  },
  {
    key: 'MCF-20260806-0003',
    projectName: '云南文旅接驳项目',
    customerNo: 'KH-YN-0003',
    dealerName: '杭州方程豹汽车销售有限公司',
    dealerCode: 'DLR-HZ-001',
    deadline: '2026-11-01',
    network: '方程豹',
    remark: '需异地发往昆明',
    crmNo: '',
    status: '已驳回',
    createdBy: '张磊',
    createdAt: '2026-08-06 15:40',
    addressBook: [
      { id: 'addr-km', province: '云南省', city: '昆明市', district: '五华区', detailAddress: '华山街道龙泉路88号', contact: '钱昆', mobile: '13800000003', landline: '0871-63636363' },
    ],
    vehicleDetails: [
      {
        key: 'v1',
        series: '豹8',
        seriesCode: 'BAO8',
        modelCode: 'BAO8-FLAG',
        model: '豹8 旗舰版',
        quantity: 6,
        usedQty: 0,
        involveRemote: true,
        allocations: [
          { key: 'al1', addressId: 'addr-km', approvedQty: 6 },
        ],
      },
    ],
    approvals: [
      { key: 'r1', approver: '陈区域', node: '大客户区域经理', approvedAt: '2026-08-07 09:15', opinion: '合同金额与备案数量不符，退回补充', nextNode: '-', nextApprover: '-' },
    ],
  },
]

// 备案是否涉及异地发运：派生自车辆明细（任一车型涉及即为是）
export function isFilingRemote(filing: MajorCustomerFiling): boolean {
  return filing.vehicleDetails.some(v => v.involveRemote)
}

// 已通过备案的大客户项目（供采购订单关联选择）
export function getApprovedProjects(): { value: string; label: string; customerNo: string }[] {
  return majorCustomerFilings
    .filter(f => f.status === '已通过')
    .map(f => ({ value: f.projectName, label: `${f.projectName}（${f.customerNo}）`, customerNo: f.customerNo }))
}

// 采购订单「是否异地发车」判定：
// - optional：该车型有异地分配且核定数之和 < 备案需求数量（部分异地）→ 用户可选是/否
// - forced-yes：该车型有异地分配且核定数之和 ≥ 需求数量（全部异地）→ 固定为是，不可选
// - forced-no：该车型无异地分配 → 固定为否，不可选
export type RemoteMode = 'optional' | 'forced-yes' | 'forced-no'

// 采购订单可选异地收货地址（源于某车型在备案中的一条分配）
export interface RemoteAddressOption {
  addressId: string
  province: string
  city: string
  district: string
  detailAddress: string
  address: string
  contact?: string
  mobile?: string
  landline?: string
  approvedQty: number
  usedQty: number
  remain: number // 剩余可发 = max(approvedQty - usedQty, 0)
}

// 某大客户项目下每个车型的异地发运信息（供采购订单车型选择后判定是否异地发车与加载地址）
export interface ProjectModelInfo {
  model: string
  totalQty: number // 备案需求数量
  remoteApprovedSum: number // 各异地地址核定发车数量之和
  remoteMode: RemoteMode
  addresses: RemoteAddressOption[] // 该车型的异地收货地址（forced-no 时为空）
}

// 提取某已通过备案大客户项目下的车型异地发运信息（按 projectName 匹配）
export function getProjectModels(projectName: string): ProjectModelInfo[] {
  const filing = majorCustomerFilings.find(f => f.status === '已通过' && f.projectName === projectName)
  if (!filing) return []
  const addrMap = new Map(filing.addressBook.map(a => [a.id, a]))
  return filing.vehicleDetails.map(v => {
    const addresses: RemoteAddressOption[] = []
    if (v.involveRemote) {
      // 原型：以车型已用数量作为「首条有效分配」的累计发车近似值（按过滤掉失效地址引用后的首条，避免下标错位导致 remain 偏高）
      const firstValidKey = v.allocations.find(al => addrMap.has(al.addressId))?.key
      for (const al of v.allocations) {
        const addr = addrMap.get(al.addressId)
        if (!addr) continue // 引用的地址已不存在则跳过
        const usedQty = al.key === firstValidKey ? v.usedQty : 0
        addresses.push({
          addressId: addr.id,
          province: addr.province,
          city: addr.city,
          district: addr.district,
          detailAddress: addr.detailAddress,
          address: formatFullAddress(addr),
          contact: addr.contact,
          mobile: addr.mobile,
          landline: addr.landline,
          approvedQty: al.approvedQty,
          usedQty,
          remain: Math.max(al.approvedQty - usedQty, 0),
        })
      }
    }
    const remoteApprovedSum = addresses.reduce((s, a) => s + a.approvedQty, 0)
    let remoteMode: RemoteMode
    if (addresses.length === 0) remoteMode = 'forced-no'
    else if (remoteApprovedSum >= v.quantity) remoteMode = 'forced-yes'
    else remoteMode = 'optional'
    return { model: v.model, totalQty: v.quantity, remoteApprovedSum, remoteMode, addresses }
  })
}
