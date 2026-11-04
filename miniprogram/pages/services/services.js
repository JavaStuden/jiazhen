const app = getApp();
const { request } = require('../../utils/request');

const PACKAGE_DATA = {
  '家政保洁': [
    {
      id: 1,
      name: '2小时基础保洁',
      category: '家政保洁',
      area: '50㎡以内',
      duration: '2小时',
      typeTag: '日常清洁',
      price: 118,
      serviceSections: [
        { area: '客厅与卧室', detail: '地面清扫拖洗、家具日常表面浮尘擦拭' },
        { area: '厨房', detail: '台面、水槽表面擦拭及地面基础清洁' },
        { area: '卫生间', detail: '洁具、台盆表面清洁及毛发归集' },
        { area: '收尾整理', detail: '生活垃圾归集打包、物品随手归位' }
      ],
      includedItems: [
        '客厅、卧室地面日常清扫与拖拭',
        '家具与常用台面表面日常除尘',
        '厨房台面与水槽表面清理',
        '卫生间台盆与便器表面清洁',
        '垃圾归集并打包带至楼下垃圾桶'
      ],
      disclaimer: '不包含: 高空玻璃、重度除垢、家电拆洗; 超出套餐范围须先与雇主确认。'
    },
    {
      id: 2,
      name: '3小时深度保洁',
      category: '家政保洁',
      area: '50-80㎡',
      duration: '3小时',
      typeTag: '深度清洁',
      price: 168,
      serviceSections: [
        { area: '客厅与卧室', detail: '地面清扫拖洗、家具表面除尘' },
        { area: '厨房', detail: '台面、水槽、灶台表面及地面清洁' },
        { area: '卫生间', detail: '洁具、镜面、台盆及地面清洁' },
        { area: '收尾整理', detail: '垃圾归集、物品简单归位' }
      ],
      includedItems: [
        '客厅、卧室地面清扫拖洗',
        '家具及常用台面表面除尘',
        '厨房台面、水槽、灶台表面清洁',
        '卫生间洁具、镜面、台盆清洁',
        '厨房、卫生间地面清洁',
        '垃圾归集与物品简单归位'
      ],
      disclaimer: '不包含: 高空玻璃、重度除垢、家电拆洗; 超出套餐范围须先与雇主确认。'
    },
    {
      id: 3,
      name: '4小时全屋保洁',
      category: '家政保洁',
      area: '80-120㎡',
      duration: '4小时',
      typeTag: '全屋清洁',
      price: 228,
      serviceSections: [
        { area: '客厅与卧室', detail: '全屋精细除尘、门窗框内侧擦拭、踢脚线清洁' },
        { area: '厨房', detail: '油烟机外壳油污擦拭、灶台水槽深层去污' },
        { area: '卫生间', detail: '淋浴房水垢擦洗、马桶深层消毒除臭' },
        { area: '收尾整理', detail: '全屋废弃物分类清运、杂物规整摆放' }
      ],
      includedItems: [
        '全屋门窗框内侧与踢脚线全方位除尘',
        '客厅、主次卧地面精细拖洗与家具护理',
        '厨房灶具油污擦洗与瓷砖局部去污',
        '卫生间全套洁具与淋浴房镜面去垢',
        '阳台地面清洁与全屋垃圾分类清运'
      ],
      disclaimer: '不包含: 室外高空蜘蛛人作业、大型家电内部深度拆机洗。'
    }
  ],
  '养老护理': [
    {
      id: 4,
      name: '居家养老照护·4小时',
      category: '养老护理',
      area: '全屋照护',
      duration: '4小时',
      typeTag: '生活照料',
      price: 220,
      serviceSections: [
        { area: '日常生活协助', detail: '协助老人穿脱衣物、个人口腔面部清洁' },
        { area: '健康关怀', detail: '日常血压体温监测、遵医嘱定时提醒服药' },
        { area: '居室轻度整理', detail: '老人卧房床单整理、通风换气及简单清洁' },
        { area: '心理陪伴', detail: '读书读报倾听交流、室内轻度慢走活动协助' }
      ],
      includedItems: [
        '协助老人起居、个人洗漱清洁',
        '日常体征辅助测量与用药提醒记录',
        '居室环境整理通风与老人餐具清洁',
        '心理沟通倾听与室内适度散步陪伴'
      ],
      disclaimer: '注: 本服务为非医疗生活照护，不含侵入性医疗处置及特级护理。'
    }
  ],
  '上门维修': [
    {
      id: 5,
      name: '上门维修·水电检修',
      category: '上门维修',
      area: '全屋排查',
      duration: '2小时',
      typeTag: '专业师傅',
      price: 220,
      serviceSections: [
        { area: '漏水排查', detail: '水龙头、角阀、下水管道滴漏水检测维修' },
        { area: '电路检修', detail: '开关插座打火松动检修、短路跳闸排查' },
        { area: '洁具五金', detail: '花洒软管更换、角阀更换及五金紧固' },
        { area: '现场安全测试', detail: '完工水流通畅试验与通电通断安全测试' }
      ],
      includedItems: [
        '上门水电路系统基础检测诊断',
        '常规水龙头/角阀/软管/开关更换安装（不含配件费）',
        '现场安全测试与完工卫生清理'
      ],
      disclaimer: '维修配件材料费用按平台透明材料标准另计，施工前先报价后作业。'
    }
  ],
  '陪医陪诊': [
    {
      id: 6,
      name: '三甲医院尊享陪诊·4小时',
      category: '陪医陪诊',
      area: '院内陪同',
      duration: '4小时',
      typeTag: '就医陪护',
      price: 399,
      serviceSections: [
        { area: '诊前协助', detail: '就诊科室规划、路线规划及提前取号' },
        { area: '院内陪同', detail: '全程排队挂号、护送检查科室、轮椅租借' },
        { area: '取药与医嘱', detail: '协助缴费排队、取送化验报告及拿药' },
        { area: '就诊总结', detail: '详细记录医生医嘱、整理随诊单推送家属' }
      ],
      includedItems: [
        '院内全程一对一陪同导诊与轮椅照护',
        '协助取号、排队、缴费、取药、打印化验单',
        '医嘱复述记录并同步至家属微信'
      ],
      disclaimer: '不代垫医药费，陪诊人员不代作任何医疗决定。'
    }
  ]
};

Page({
  data: {
    categories: ['家政保洁', '养老护理', '上门维修', '陪医陪诊'],
    currentCategory: '家政保洁',
    keyword: '',
    allPackages: PACKAGE_DATA,
    currentPackages: PACKAGE_DATA['家政保洁'],
    selectedPackage: PACKAGE_DATA['家政保洁'][1] // 默认选中 3小时深度保洁
  },

  onLoad(options) {
    if (options && options.serviceId) {
      const sid = parseInt(options.serviceId, 10);
      for (const cat of this.data.categories) {
        const found = PACKAGE_DATA[cat].find(p => p.id === sid);
        if (found) {
          this.setData({
            currentCategory: cat,
            currentPackages: PACKAGE_DATA[cat],
            selectedPackage: found
          });
          return;
        }
      }
    }
  },

  onSearchInput(e) {
    const val = e.detail.value.trim().toLowerCase();
    this.setData({ keyword: val });
    if (!val) {
      this.setData({ currentPackages: this.data.allPackages[this.data.currentCategory] });
      return;
    }
    const filtered = (this.data.allPackages[this.data.currentCategory] || []).filter(
      p => p.name.toLowerCase().includes(val) || p.typeTag.includes(val)
    );
    this.setData({ currentPackages: filtered });
  },

  toggleFilter() {
    wx.showActionSheet({
      itemList: ['价格从低到高', '价格从高到低', '服务时长优先', '热门推荐优先'],
      success: (res) => {
        let list = [...this.data.currentPackages];
        if (res.tapIndex === 0) list.sort((a, b) => a.price - b.price);
        if (res.tapIndex === 1) list.sort((a, b) => b.price - a.price);
        this.setData({ currentPackages: list });
      }
    });
  },

  switchCategory(e) {
    const cat = e.currentTarget.dataset.cat;
    const pkgs = this.data.allPackages[cat] || [];
    this.setData({
      currentCategory: cat,
      currentPackages: pkgs,
      selectedPackage: pkgs[0] || null
    });
  },

  selectPackage(e) {
    const id = e.currentTarget.dataset.id;
    const found = this.data.currentPackages.find(p => p.id === id);
    if (found) {
      this.setData({ selectedPackage: found });
    }
  },

  confirmAndContinue() {
    const { selectedPackage } = this.data;
    if (!selectedPackage) {
      wx.showToast({ title: '请先选择服务套餐', icon: 'none' });
      return;
    }

    // 存储当前所选套餐至全局与本地缓存，供下单页面使用
    wx.setStorageSync('selectedPackage', selectedPackage);
    if (app && app.globalData) {
      app.globalData.selectedPackage = selectedPackage;
    }

    wx.navigateTo({
      url: `/pages/create-order/create-order?packageId=${selectedPackage.id}`
    });
  }
});
