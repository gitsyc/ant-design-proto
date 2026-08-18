// 整车采购配置基础数据：选配置名称后带出配置代码、车系、车型、轮毂、时空光翼、选装
export interface VehicleConfig {
  name: string
  code: string
  seriesCode: string
  seriesName: string
  modelCode: string
  modelName: string
  hub: string
  lightWing: string
  tire: string
  interior: string
  exterior: string
  origin: string
  options: [string, string, string, string, string, string, string, string, string]
}

export const VEHICLE_CONFIGS: VehicleConfig[] = [
  {
    name: '豹5 标准版 智驾配置',
    code: 'BAO5-STD-ZJ',
    seriesCode: 'BAO5',
    seriesName: '豹5',
    modelCode: 'BAO5-STD',
    modelName: '豹5 标准版',
    hub: '20寸铝合金轮毂',
    lightWing: '无',
    tire: '255/55 R20',
    interior: '玄黑内饰',
    exterior: '苍穹灰',
    origin: '深圳',
    options: ['全景天窗', '电动尾门', '前排座椅加热', '无线充电', '无', '无', '无', '无', '无'],
  },
  {
    name: '豹5 长续航版 旗舰配置',
    code: 'BAO5-LR-QJ',
    seriesCode: 'BAO5',
    seriesName: '豹5',
    modelCode: 'BAO5-LR',
    modelName: '豹5 长续航版',
    hub: '21寸运动轮毂',
    lightWing: '有',
    tire: '265/45 R21',
    interior: '暖沙棕内饰',
    exterior: '极光绿',
    origin: '深圳',
    options: ['全景天窗', '电动尾门', '座椅通风', 'HUD', '空气悬架', '无', '无', '无', '无'],
  },
  {
    name: '豹8 旗舰版 尊享配置',
    code: 'BAO8-FLAG-ZX',
    seriesCode: 'BAO8',
    seriesName: '豹8',
    modelCode: 'BAO8-FLAG',
    modelName: '豹8 旗舰版',
    hub: '22寸豪华轮毂',
    lightWing: '有',
    tire: '275/40 R22',
    interior: '墨玉黑内饰',
    exterior: '星空银',
    origin: '西安',
    options: ['全景天窗', '电动侧踏板', '座椅按摩', '冰箱', '空气悬架', '娱乐屏', '无', '无', '无'],
  },
]

export function findVehicleConfig(name: string): VehicleConfig | undefined {
  return VEHICLE_CONFIGS.find(c => c.name === name)
}

export function emptyConfigFields() {
  return {
    configCode: '',
    seriesCode: '',
    seriesName: '',
    modelCode: '',
    model: '',
    hub: '',
    lightWing: '',
    tire: '',
    interior: '',
    exterior: '',
    origin: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    option5: '',
    option6: '',
    option7: '',
    option8: '',
    option9: '',
  }
}

export function configToFormFields(c: VehicleConfig) {
  return {
    configCode: c.code,
    seriesCode: c.seriesCode,
    seriesName: c.seriesName,
    modelCode: c.modelCode,
    model: c.modelName,
    hub: c.hub,
    lightWing: c.lightWing,
    tire: c.tire,
    interior: c.interior,
    exterior: c.exterior,
    origin: c.origin,
    option1: c.options[0],
    option2: c.options[1],
    option3: c.options[2],
    option4: c.options[3],
    option5: c.options[4],
    option6: c.options[5],
    option7: c.options[6],
    option8: c.options[7],
    option9: c.options[8],
  }
}
