// 大客户备案 - 异地收货地址簿维护表（从 MajorCustomerFilingFormPage 抽出，保持行数约束与职责聚焦）
import { Button, Cascader, Input, Table } from '../../ui'
import { semanticTokens } from '../../theme/tokens'
import { regionOptions } from '../../data/regions'
import type { AddressBookEntry } from '../../data/majorCustomerFilings'

interface AddressBookTableProps {
  addressBook: AddressBookEntry[]
  readOnly: boolean
  patchAddressEntry: (id: string, patch: Partial<AddressBookEntry>) => void
  removeAddressEntry: (id: string) => void
  addAddressEntry: () => void
}

export default function AddressBookTable({
  addressBook,
  readOnly,
  patchAddressEntry,
  removeAddressEntry,
  addAddressEntry,
}: AddressBookTableProps) {
  return (
    <>
      <div style={{ margin: '16px 0 12px', fontWeight: 600, borderLeft: '3px solid #1677ff', paddingLeft: 8 }}>异地收货地址簿</div>
      <div style={{ marginBottom: 8, color: semanticTokens.color.filterLabelText, fontSize: 12 }}>
        每个异地收货地址在此录入一次；车型的异地发运从这里选择地址，避免同一地址被多个车型重复录入。
      </div>
      <Table
        rowKey="id"
        size="small"
        pagination={false}
        dataSource={addressBook}
        locale={{ emptyText: '暂无异地收货地址，点击下方「添加地址」录入' }}
        columns={[
          {
            title: '省市区',
            width: 260,
            render: (_: unknown, r: AddressBookEntry) => (
              <Cascader
                style={{ width: '100%' }}
                placeholder="请选择省/市/区"
                disabled={readOnly}
                options={regionOptions}
                value={r.province ? [r.province, r.city, r.district] : undefined}
                onChange={val => {
                  const [province = '', city = '', district = ''] = (val as string[]) ?? []
                  patchAddressEntry(r.id, { province, city, district })
                }}
              />
            ),
          },
          {
            title: '详细地址',
            dataIndex: 'detailAddress',
            render: (val: string, r: AddressBookEntry) => (
              <Input value={val} placeholder="详细地址（街道、门牌号等）" disabled={readOnly}
                onChange={e => patchAddressEntry(r.id, { detailAddress: e.target.value })} />
            ),
          },
          {
            title: '联系人',
            dataIndex: 'contact',
            width: 120,
            render: (val: string, r: AddressBookEntry) => (
              <Input value={val} placeholder="联系人" disabled={readOnly}
                onChange={e => patchAddressEntry(r.id, { contact: e.target.value })} />
            ),
          },
          {
            title: '手机号',
            dataIndex: 'mobile',
            width: 140,
            render: (val: string, r: AddressBookEntry) => (
              <Input value={val} placeholder="手机号" disabled={readOnly}
                onChange={e => patchAddressEntry(r.id, { mobile: e.target.value })} />
            ),
          },
          {
            title: '固定电话',
            dataIndex: 'landline',
            width: 140,
            render: (val: string, r: AddressBookEntry) => (
              <Input value={val} placeholder="区号-号码" disabled={readOnly}
                onChange={e => patchAddressEntry(r.id, { landline: e.target.value })} />
            ),
          },
          {
            title: '操作',
            width: 70,
            render: (_: unknown, r: AddressBookEntry) => (
              readOnly ? '-' : (
                <a onClick={() => removeAddressEntry(r.id)} style={{ color: semanticTokens.color.buttonDangerBg }}>删除</a>
              )
            ),
          },
        ]}
      />
      {!readOnly && (
        <Button className="app-btn-tertiary" style={{ marginTop: 8, marginBottom: 16 }} onClick={addAddressEntry}>
          + 添加地址
        </Button>
      )}
    </>
  )
}
