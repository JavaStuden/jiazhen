const app = getApp();
const { request } = require('../../utils/request');

const PACKAGE_MAP = {
  '2小时': {
    name: '2小时基础保洁',
    price: 118,
    area: '50㎡以内',
    includedItems: [
      '客厅、卧室地面日常清扫与拖洗',
      '家具与常用台面表面除尘',
      '厨房台面与水槽表面清理',
      '卫生间台盆与洁具表面除污',
      '厨房、卫生间地面基础清洁',
      '生活垃圾归集与简单归位'
    ]
  },
  '3小时': {
    name: '3小时深度保洁',
    price: 168,
    area: '50-80㎡',
    includedItems: [
      '客厅、卧室地面清扫拖洗',
      '家具及常用台面表面除尘',
      '厨房台面、水槽、灶台表面清洁',
      '卫生间洁具、镜面、台盆清洁',
      '厨房、卫生间地面清洁',
      '垃圾归集与物品简单归位'
    ]
  },
  '4小时': {
    name: '4小时全屋保洁',
    price: 228,
    area: '80-120㎡',
    includedItems: [
      '全屋门窗框内侧及踢脚线精细除尘',
      '客厅、主次卧地面深度清扫拖洗',
      '厨房台面、水槽、油烟机表面去油污',
      '卫生间洁具、淋浴隔断镜面深层清洁',
      '全屋地面深层拖拭与消毒',
      '垃圾分类归集清运与物品收纳归位'
    ]
  }
};

Page({
  data: {
    categories: ['家政保洁', '养老护理', '维修'],
    currentCategory: '家政保洁',
    areaOptions: ['50㎡以内', '50-80㎡', '80-120㎡'],
    selectedArea: '50-80㎡',
    durationOptions: ['2小时', '3小时', '4小时'],
    selectedDuration: '3小时',
    scheduledDisplayTime: '8月10日 15:00',
    scheduledDate: '2026-08-10',
    address: '重庆市渝北区金开大道',
    customerName: '陈女士',
    phone: '13800002068',
    currentPackage: PACKAGE_MAP['3小时'],
    totalAmount: 168,
    isRecording: false
  },

  onLoad(options) {
    const pkg = wx.getStorageSync('selectedPackage');
    if (pkg) {
      if (pkg.duration && PACKAGE_MAP[pkg.duration]) {
        this.setData({
          currentPackage: PACKAGE_MAP[pkg.duration],
          selectedDuration: pkg.duration,
          selectedArea: pkg.area || '50-80㎡',
          totalAmount: pkg.price || 168,
          currentCategory: pkg.category || '家政保洁'
        });
      } else {
        this.setData({
          currentPackage: {
            name: pkg.name,
            price: pkg.price,
            area: pkg.area,
            includedItems: pkg.includedItems || PACKAGE_MAP['3小时'].includedItems
          },
          totalAmount: pkg.price || 168,
          currentCategory: pkg.category || '家政保洁'
        });
      }
    }
  },

  selectCategory(e) {
    const cat = e.currentTarget.dataset.cat;
    this.setData({ currentCategory: cat });
    if (cat === '养老护理') {
      this.setData({
        currentPackage: {
          name: '居家养老照护·4小时',
          price: 220,
          area: '全屋照护',
          includedItems: [
            '协助老人起居日常洗漱清洁',
            '遵医嘱定时提醒服药与体征监测',
            '卧房环境整理与餐具清洁',
            '心理沟通倾听与室内适度慢走照护'
          ]
        },
        selectedDuration: '4小时',
        totalAmount: 220
      });
    } else if (cat === '维修') {
      this.setData({
        currentPackage: {
          name: '上门维修·水电检修',
          price: 220,
          area: '全屋排查',
          includedItems: [
            '上门水电路系统基础检测诊断',
            '水龙头/角阀/软管更换安装调试',
            '现场安全通水通电测试与完工清洁'
          ]
        },
        selectedDuration: '2小时',
        totalAmount: 220
      });
    } else {
      this.syncPackage('3小时', '50-80㎡');
    }
  },

  selectArea(e) {
    const area = e.currentTarget.dataset.area;
    this.setData({ selectedArea: area });
    if (area === '50㎡以内') {
      this.syncPackage('2小时', area);
    } else if (area === '50-80㎡') {
      this.syncPackage('3小时', area);
    } else {
      this.syncPackage('4小时', area);
    }
  },

  selectDuration(e) {
    const dur = e.currentTarget.dataset.dur;
    let area = '50-80㎡';
    if (dur === '2小时') area = '50㎡以内';
    if (dur === '4小时') area = '80-120㎡';
    this.syncPackage(dur, area);
  },

  syncPackage(dur, area) {
    const target = PACKAGE_MAP[dur] || PACKAGE_MAP['3小时'];
    this.setData({
      selectedDuration: dur,
      selectedArea: area,
      currentPackage: target,
      totalAmount: target.price
    });
  },

  openPackagePicker() {
    wx.showActionSheet({
      itemList: ['2小时基础保洁（¥118）', '3小时深度保洁（¥168）', '4小时全屋保洁（¥228）'],
      success: (res) => {
        if (res.tapIndex === 0) this.syncPackage('2小时', '50㎡以内');
        if (res.tapIndex === 1) this.syncPackage('3小时', '50-80㎡');
        if (res.tapIndex === 2) this.syncPackage('4小时', '80-120㎡');
      }
    });
  },

  onDateChange(e) {
    const dateStr = e.detail.value;
    const parts = dateStr.split('-');
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    this.setData({
      scheduledDate: dateStr,
      scheduledDisplayTime: `${m}月${d}日 15:00`
    });
  },

  editAddress() {
    wx.showModal({
      title: '修改服务地址',
      editable: true,
      placeholderText: '请输入服务详细地址',
      content: this.data.address,
      success: (res) => {
        if (res.confirm && res.content) {
          this.setData({ address: res.content.trim() });
        }
      }
    });
  },

  startVoiceRecord() {
    this.setData({ isRecording: true });
    wx.showToast({ title: '正在倾听...', icon: 'loading', duration: 10000 });
  },

  stopVoiceRecord() {
    this.setData({ isRecording: false });
    wx.hideToast();
    wx.showToast({
      title: '识别成功：3小时保洁',
      icon: 'success'
    });
    this.syncPackage('3小时', '50-80㎡');
  },

  viewPriceDetails() {
    wx.showModal({
      title: '服务价格明细',
      content: `标准服务金额：¥${this.data.totalAmount}.00\n技术服务费：¥0.00（平台优惠减免）\n合计应付：¥${this.data.totalAmount}.00\n\n提示：费用将在服务完成后结算给服务人员。`,
      showCancel: false
    });
  },

  submitOrder() {
    const { currentPackage, address, scheduledDisplayTime, totalAmount, customerName, phone } = this.data;

    wx.showLoading({ title: '提交需求中...' });

    // 尝试调用后端创建订单接口，若后端未启动则在前端本地生成订单
    request('/orders', {
      method: 'POST',
      data: {
        serviceId: 2,
        customerName: customerName,
        phone: phone,
        address: address,
        scheduledAt: scheduledDisplayTime,
        note: `套餐：${currentPackage.name}，预算：¥${totalAmount}`
      }
    }).then((res) => {
      wx.hideLoading();
      this.afterOrderCreated(res);
    }).catch(() => {
      wx.hideLoading();
      // 本地 mock 生成
      const mockOrder = {
        id: Date.now(),
        orderNo: 'TH' + Date.now().toString().slice(-8),
        serviceName: currentPackage.name,
        amount: totalAmount,
        status: '待匹配',
        scheduledAt: scheduledDisplayTime,
        address: address,
        customerName: customerName
      };
      const existing = wx.getStorageSync('local_orders') || [];
      existing.unshift(mockOrder);
      wx.setStorageSync('local_orders', existing);
      this.afterOrderCreated(mockOrder);
    });
  },

  afterOrderCreated(order) {
    wx.showToast({
      title: '需求已发布！',
      icon: 'success',
      duration: 1500
    });

    setTimeout(() => {
      wx.switchTab({
        url: '/pages/orders/orders'
      });
    }, 1200);
  }
});
