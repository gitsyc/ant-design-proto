// 省/市/区三级级联选择数据（原型用精简数据集，覆盖种子备案涉及的城市 + 常用一线城市）
export interface RegionNode {
  value: string
  label: string
  children?: RegionNode[]
}

export const regionOptions: RegionNode[] = [
  {
    value: '四川省', label: '四川省',
    children: [
      { value: '成都市', label: '成都市', children: [
        { value: '双流区', label: '双流区' },
        { value: '武侯区', label: '武侯区' },
        { value: '锦江区', label: '锦江区' },
        { value: '高新区', label: '高新区' },
      ] },
      { value: '绵阳市', label: '绵阳市', children: [
        { value: '涪城区', label: '涪城区' },
        { value: '游仙区', label: '游仙区' },
      ] },
    ],
  },
  {
    value: '重庆市', label: '重庆市',
    children: [
      { value: '重庆市', label: '重庆市', children: [
        { value: '渝北区', label: '渝北区' },
        { value: '江北区', label: '江北区' },
        { value: '渝中区', label: '渝中区' },
        { value: '九龙坡区', label: '九龙坡区' },
      ] },
    ],
  },
  {
    value: '云南省', label: '云南省',
    children: [
      { value: '昆明市', label: '昆明市', children: [
        { value: '五华区', label: '五华区' },
        { value: '盘龙区', label: '盘龙区' },
        { value: '官渡区', label: '官渡区' },
      ] },
      { value: '大理白族自治州', label: '大理白族自治州', children: [
        { value: '大理市', label: '大理市' },
      ] },
    ],
  },
  {
    value: '广东省', label: '广东省',
    children: [
      { value: '深圳市', label: '深圳市', children: [
        { value: '南山区', label: '南山区' },
        { value: '福田区', label: '福田区' },
        { value: '宝安区', label: '宝安区' },
      ] },
      { value: '广州市', label: '广州市', children: [
        { value: '天河区', label: '天河区' },
        { value: '越秀区', label: '越秀区' },
        { value: '番禺区', label: '番禺区' },
      ] },
    ],
  },
  {
    value: '浙江省', label: '浙江省',
    children: [
      { value: '杭州市', label: '杭州市', children: [
        { value: '西湖区', label: '西湖区' },
        { value: '滨江区', label: '滨江区' },
        { value: '余杭区', label: '余杭区' },
      ] },
      { value: '宁波市', label: '宁波市', children: [
        { value: '海曙区', label: '海曙区' },
        { value: '鄞州区', label: '鄞州区' },
      ] },
    ],
  },
  {
    value: '上海市', label: '上海市',
    children: [
      { value: '上海市', label: '上海市', children: [
        { value: '浦东新区', label: '浦东新区' },
        { value: '闵行区', label: '闵行区' },
        { value: '徐汇区', label: '徐汇区' },
      ] },
    ],
  },
  {
    value: '北京市', label: '北京市',
    children: [
      { value: '北京市', label: '北京市', children: [
        { value: '朝阳区', label: '朝阳区' },
        { value: '海淀区', label: '海淀区' },
        { value: '大兴区', label: '大兴区' },
      ] },
    ],
  },
]
