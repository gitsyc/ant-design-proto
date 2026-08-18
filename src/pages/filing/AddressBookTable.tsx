// 大客户备案 - 异地收货地址维护表（标题左、添加/删除右，勾选后删除）
import { useState } from 'react'
import { Button, Cascader, Input, Modal, Space, Table, message } from '../../ui'
import { DeleteOutlined, PlusOutlined } from '../../ui/icons'
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
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])

  const handleDelete = () => {
    if (selectedKeys.length === 0) {
      message.warning('请先勾选要删除的异地收货地址')
      return
    }
    Modal.confirm({
      title: '删除异地收货地址',
      content: `确认删除已选 ${selectedKeys.length} 条地址？`,
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        selectedKeys.forEach(id => removeAddressEntry(id))
        setSelectedKeys([])
      },
    })
  }

  return (
    <div className="annot-filingform-field-addressbook">
      <div className="app-section-bar">
        <div className="app-section-title">异地收货地址</div>
        {!readOnly && (
          <Space size={8}>
            <Button className="app-btn-tertiary" icon={<PlusOutlined />} onClick={addAddressEntry}>
              添加
            </Button>
            <Button className="app-icon-btn-danger" icon={<DeleteOutlined />} onClick={handleDelete} />
          </Space>
        )}
      </div>
      <Table
        className="annot-filingform-rule-addressbook"
        rowKey="id"
        size="small"
        pagination={false}
        dataSource={addressBook}
        locale={{ emptyText: '暂无数据' }}
        rowSelection={readOnly ? undefined : {
          selectedRowKeys: selectedKeys,
          onChange: keys => setSelectedKeys(keys as string[]),
        }}
        columns={[
          {
            title: '序号',
            width: 64,
            align: 'center',
            render: (_: unknown, __: AddressBookEntry, index: number) => index + 1,
          },
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
        ]}
      />
    </div>
  )
}
