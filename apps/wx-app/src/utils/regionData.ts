/**
 * 中国省市区数据工具
 * 数据来源：modood/Administrative-divisions-of-China (2023年官方数据)
 */

export interface RegionItem {
  code: string;
  name: string;
  children?: RegionItem[];
}

// 完整的中国省市区数据（2023年国家统计局官方数据）
// 数据来源：https://github.com/modood/Administrative-divisions-of-China
let CHINA_REGION_DATA: RegionItem[] | null = null;

/**
 * 加载完整的省市区数据
 * 首次调用时从本地JSON文件加载，后续调用直接返回缓存数据
 */
export async function loadRegionData(): Promise<RegionItem[]> {
  if (CHINA_REGION_DATA) {
    return CHINA_REGION_DATA;
  }

  try {
    // 使用uni.request加载数据，兼容H5和小程序
    const result = await new Promise<RegionItem[]>((resolve, reject) => {
      uni.request({
        url: '/static/china-region-data.json',
        method: 'GET',
        success: res => {
          if (res.statusCode === 200 && res.data) {
            console.log(
              '[RegionData] 数据加载成功，共',
              (res.data as RegionItem[]).length,
              '个省份'
            );
            resolve(res.data as RegionItem[]);
          } else {
            console.error('[RegionData] 加载失败，状态码:', res.statusCode);
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        },
        fail: err => {
          console.error('[RegionData] 请求失败:', err);
          reject(new Error(err.errMsg || 'Request failed'));
        },
      });
    });

    CHINA_REGION_DATA = result;
    return result;
  } catch (error) {
    console.error('[RegionData] 加载省市区数据失败:', error);
    console.log('[RegionData] 使用备用数据');
    // 返回备用数据（北京、上海、广东）
    return getFallbackData();
  }
}

/**
 * 获取备用数据（当加载失败时使用）
 */
function getFallbackData(): RegionItem[] {
  return [
    {
      code: '11',
      name: '北京市',
      children: [
        {
          code: '1101',
          name: '市辖区',
          children: [
            { code: '110101', name: '东城区' },
            { code: '110102', name: '西城区' },
            { code: '110105', name: '朝阳区' },
            { code: '110106', name: '丰台区' },
            { code: '110107', name: '石景山区' },
            { code: '110108', name: '海淀区' },
          ],
        },
      ],
    },
    {
      code: '31',
      name: '上海市',
      children: [
        {
          code: '3101',
          name: '市辖区',
          children: [
            { code: '310101', name: '黄浦区' },
            { code: '310104', name: '徐汇区' },
            { code: '310105', name: '长宁区' },
            { code: '310106', name: '静安区' },
            { code: '310107', name: '普陀区' },
            { code: '310109', name: '虹口区' },
          ],
        },
      ],
    },
    {
      code: '44',
      name: '广东省',
      children: [
        {
          code: '4401',
          name: '广州市',
          children: [
            { code: '440103', name: '荔湾区' },
            { code: '440104', name: '越秀区' },
            { code: '440105', name: '海珠区' },
            { code: '440106', name: '天河区' },
            { code: '440111', name: '白云区' },
            { code: '440112', name: '黄埔区' },
          ],
        },
        {
          code: '4403',
          name: '深圳市',
          children: [
            { code: '440303', name: '罗湖区' },
            { code: '440304', name: '福田区' },
            { code: '440305', name: '南山区' },
            { code: '440306', name: '宝安区' },
            { code: '440307', name: '龙岗区' },
            { code: '440308', name: '盐田区' },
          ],
        },
      ],
    },
  ];
}

/**
 * 初始化地区选择器数据
 * 将完整的省市区数据转换为uni-app picker组件需要的格式
 */
export function initRegionPickerData(regionData: RegionItem[]) {
  const provinceList: string[] = [];
  const cityMap: Record<number, string[]> = {};
  const districtMap: Record<string, string[]> = {};

  regionData.forEach((province, provinceIndex) => {
    provinceList.push(province.name);

    if (province.children && province.children.length > 0) {
      cityMap[provinceIndex] = province.children.map(city => city.name);

      province.children.forEach((city, cityIndex) => {
        const key = `${provinceIndex}-${cityIndex}`;
        if (city.children && city.children.length > 0) {
          districtMap[key] = city.children.map(district => district.name);
        } else {
          districtMap[key] = [];
        }
      });
    } else {
      cityMap[provinceIndex] = [];
    }
  });

  return {
    provinceList,
    cityMap,
    districtMap,
    fullData: regionData,
  };
}

/**
 * 根据索引获取完整地址
 */
export function getFullAddress(
  regionData: RegionItem[],
  provinceIndex: number,
  cityIndex: number,
  districtIndex: number
): string {
  const province = regionData[provinceIndex];
  if (!province) return '';

  const city = province.children?.[cityIndex];
  if (!city) return province.name;

  const district = city.children?.[districtIndex];
  if (!district) return `${province.name} ${city.name}`;

  return `${province.name} ${city.name} ${district.name}`;
}
