const app = getApp();
const { fetchServices, getLocalPackages } = require('../../utils/store');

function groupPackagesByCategory(list) {
  const map = {
    '家政保洁': [],
    '养老护理': [],
    '上门维修': [],
    '陪医陪诊': []
  };
  (list || []).forEach((item) => {
    const cat = map[item.category] ? item.category : '家政保洁';
    map[cat].push(item);
  });
  return map;
}

Page({
  data: {
    categories: ['家政保洁', '养老护理', '上门维修', '陪医陪诊'],
    currentCategory: '家政保洁',
    keyword: '',
    allPackages: {},
    currentPackages: [],
    selectedPackage: null
  },

  onLoad(options) {
    this.pendingOptions = options || {};
    const initialList = getLocalPackages();
    this.applyPackageList(initialList, this.pendingOptions);

    // 实时从后台拉取配置的服务套餐与具体服务内容
    fetchServices().then((remoteList) => {
      this.applyPackageList(remoteList, this.pendingOptions);
    }).catch((error) => wx.showModal({ title: '服务加载失败', content: error.message || '请检查网络后重试', showCancel: false }));
  },

  applyPackageList(list, options = {}) {
    const grouped = groupPackagesByCategory(list);
    let targetCategory = this.data.currentCategory || '家政保洁';
    let targetSelected = null;

    if (options.category) {
      const decoded = decodeURIComponent(options.category);
      if (grouped[decoded]) {
        targetCategory = decoded;
      }
    }

    if (options.serviceId) {
      const sid = parseInt(options.serviceId, 10);
      for (const cat of this.data.categories) {
        const found = (grouped[cat] || []).find((p) => p.id === sid);
        if (found) {
          targetCategory = cat;
          targetSelected = found;
          break;
        }
      }
    }

    const currentPackages = grouped[targetCategory] || [];
    if (!targetSelected) {
      // 家政保洁默认选中“3小时深度保洁”（对应图二 0.jpg）
      targetSelected =
        currentPackages.find((p) => p.name.includes('3小时')) ||
        currentPackages[0] ||
        null;
    }

    this.setData({
      allPackages: grouped,
      currentCategory: targetCategory,
      currentPackages,
      selectedPackage: targetSelected
    });
  },

  onSearchInput(e) {
    const val = e.detail.value.trim().toLowerCase();
    this.setData({ keyword: val });
    const baseList = this.data.allPackages[this.data.currentCategory] || [];
    if (!val) {
      this.setData({ currentPackages: baseList });
      return;
    }
    const filtered = baseList.filter(
      (p) =>
        p.name.toLowerCase().includes(val) ||
        (p.typeTag && p.typeTag.includes(val)) ||
        (p.area && p.area.toLowerCase().includes(val))
    );
    this.setData({ currentPackages: filtered });
  },

  toggleFilter() {
    wx.showActionSheet({
      itemList: ['价格从低到高', '价格从高到低', '服务时长优先', '恢复默认排序'],
      success: (res) => {
        let list = [...(this.data.allPackages[this.data.currentCategory] || [])];
        if (res.tapIndex === 0) list.sort((a, b) => a.price - b.price);
        if (res.tapIndex === 1) list.sort((a, b) => b.price - a.price);
        if (res.tapIndex === 2) list.sort((a, b) => (a.durationHours || 0) - (b.durationHours || 0));
        this.setData({ currentPackages: list });
      }
    });
  },

  switchCategory(e) {
    const cat = e.currentTarget.dataset.cat;
    const pkgs = this.data.allPackages[cat] || [];
    const defaultPkg = pkgs.find((p) => p.name.includes('3小时')) || pkgs[0] || null;
    this.setData({
      currentCategory: cat,
      currentPackages: pkgs,
      selectedPackage: defaultPkg,
      keyword: ''
    });
  },

  selectPackage(e) {
    const id = e.currentTarget.dataset.id;
    const found = this.data.currentPackages.find((p) => p.id === id);
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

    wx.setStorageSync('selectedPackage', selectedPackage);
    if (app && app.globalData) {
      app.globalData.selectedPackage = selectedPackage;
    }

    wx.navigateTo({
      url: `/pages/create-order/create-order?packageId=${selectedPackage.id}`
    });
  }
});
