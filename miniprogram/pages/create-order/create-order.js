const app = getApp();
const { fetchServices, getLocalPackages } = require('../../utils/store');
const { request } = require('../../utils/request');

Page({
  data: {
    categories: ['家政保洁', '养老护理', '维修'],
    currentCategory: '家政保洁',
    areaOptions: ['50㎡以内', '50-80㎡', '80-120㎡'],
    selectedArea: '50-80㎡',
    durationOptions: ['2小时', '3小时', '4小时'],
    selectedDuration: '3小时',
    scheduledDisplayTime: '',
    scheduledDate: '',
    address: '',
    customerName: '',
    phone: '',
    allPackages: [],
    currentPackage: null,
    totalAmount: 168,
    isRecording: false
  },

  onLoad(options) {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const date = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
    this.setData({
      scheduledDate: date,
      scheduledDisplayTime: `${tomorrow.getMonth() + 1}月${tomorrow.getDate()}日 15:00`,
      phone: wx.getStorageSync('phone') || ''
    });
    const list = getLocalPackages();
    this.setData({ allPackages: list });
    this.initFromStorageOrOptions(list, options);

    // 同步后台最新配置的套餐及 6 项“本次上门服务内容”
    fetchServices().then((remoteList) => {
      this.setData({ allPackages: remoteList });
      this.initFromStorageOrOptions(remoteList, options);
    }).catch((error) => wx.showModal({ title: '服务加载失败', content: error.message || '请检查网络后重试', showCancel: false }));
  },

  onShow() {
    const selectedAddr = wx.getStorageSync('selected_order_address');
    if (selectedAddr && selectedAddr.fullAddress) {
      this.setData({
        address: selectedAddr.fullAddress,
        customerName: selectedAddr.contact || this.data.customerName,
        phone: selectedAddr.rawPhone || this.data.phone
      });
      wx.removeStorageSync('selected_order_address');
    } else {
      request('/auth/account').then(account => {
        const address = (account.addresses || []).find(item => item.isDefault);
        if (address && !this.data.address) this.setData({
          address: address.fullAddress, customerName: address.contact, phone: address.rawPhone || this.data.phone
        });
      }).catch(() => {});
    }
  },

  initFromStorageOrOptions(list, options = {}) {
    const savedPkg = wx.getStorageSync('selectedPackage');
    let target = null;
    if (options && options.packageId) {
      const pid = parseInt(options.packageId, 10);
      target = list.find((p) => p.id === pid);
    }
    if (!target && savedPkg) {
      target = list.find((p) => p.id === savedPkg.id || p.name === savedPkg.name) || savedPkg;
    }
    if (!target) {
      target = list.find((p) => p.name.includes('3小时深度保洁')) || list[0];
    }
    this.applyPackage(target);
  },

  applyPackage(pkg) {
    if (!pkg) return;
    let displayCat = '家政保洁';
    if (pkg.category && pkg.category.includes('养老')) displayCat = '养老护理';
    else if (pkg.category && pkg.category.includes('维修')) displayCat = '维修';

    const dur = pkg.duration || (pkg.durationHours ? `${pkg.durationHours}小时` : '3小时');
    let area = pkg.area || '50-80㎡';
    if (displayCat === '家政保洁' && !this.data.areaOptions.includes(area)) {
      area = dur === '2小时' ? '50㎡以内' : dur === '4小时' ? '80-120㎡' : '50-80㎡';
    }

    this.setData({
      currentCategory: displayCat,
      currentPackage: pkg,
      selectedDuration: this.data.durationOptions.includes(dur) ? dur : '3小时',
      selectedArea: this.data.areaOptions.includes(area) ? area : '50-80㎡',
      totalAmount: pkg.price || 168
    });
  },

  selectCategory(e) {
    const cat = e.currentTarget.dataset.cat;
    this.setData({ currentCategory: cat });
    const { allPackages } = this.data;

    if (cat === '养老护理') {
      const found = allPackages.find((p) => p.category === '养老护理') || allPackages[3];
      this.applyPackage(found);
    } else if (cat === '维修') {
      const found = allPackages.find((p) => p.category === '上门维修') || allPackages[4];
      this.applyPackage(found);
    } else {
      this.syncCleaningByDuration('3小时', '50-80㎡');
    }
  },

  selectArea(e) {
    const area = e.currentTarget.dataset.area;
    if (area === '50㎡以内') {
      this.syncCleaningByDuration('2小时', area);
    } else if (area === '50-80㎡') {
      this.syncCleaningByDuration('3小时', area);
    } else {
      this.syncCleaningByDuration('4小时', area);
    }
  },

  selectDuration(e) {
    const dur = e.currentTarget.dataset.dur;
    let area = '50-80㎡';
    if (dur === '2小时') area = '50㎡以内';
    if (dur === '4小时') area = '80-120㎡';
    this.syncCleaningByDuration(dur, area);
  },

  syncCleaningByDuration(dur, area) {
    const { allPackages } = this.data;
    const found =
      allPackages.find((p) => p.category === '家政保洁' && (p.duration === dur || p.name.includes(dur))) ||
      allPackages[1];
    this.setData({
      currentCategory: '家政保洁',
      selectedDuration: dur,
      selectedArea: area,
      currentPackage: found,
      totalAmount: found ? found.price : 168
    });
  },

  openPackagePicker() {
    const { allPackages } = this.data;
    const itemList = allPackages.slice(0, 6).map((p) => `${p.name}（¥${p.price}）`);
    wx.showActionSheet({
      itemList,
      success: (res) => {
        const picked = allPackages[res.tapIndex];
        if (picked) {
          this.applyPackage(picked);
        }
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
    request('/auth/account').then(account => {
      const addresses = account.addresses || [];
      this.showAddressPicker(addresses);
    }).catch(error => wx.showToast({ title: error.message || '地址加载失败', icon: 'none' }));
  },

  showAddressPicker(addresses) {
    const items = addresses.map((a) => `${a.tag}：${a.title} (${a.doorplate})`);
    items.push('手动输入 / 管理常用地址');
    if (!addresses.length) {
      wx.navigateTo({ url: '/pages/user-center/user-center?section=addresses&from=order' });
      return;
    }
    wx.showActionSheet({
      itemList: items,
      success: (res) => {
        if (res.tapIndex < addresses.length) {
          const chosen = addresses[res.tapIndex];
          this.setData({
            address: chosen.fullAddress,
            customerName: chosen.contact,
            phone: chosen.rawPhone || this.data.phone
          });
        } else {
          wx.navigateTo({
            url: '/pages/user-center/user-center?section=addresses&from=order'
          });
        }
      }
    });
  },

  startVoiceRecord() {
    this.setData({ isRecording: true });
    wx.showToast({ title: '正在倾听需求...', icon: 'loading', duration: 10000 });
  },

  stopVoiceRecord() {
    this.setData({ isRecording: false });
    wx.hideToast();
    wx.showToast({ title: '语音识别暂不可用，请手动选择服务', icon: 'none' });
  },

  viewPriceDetails() {
    const techFee = (this.data.currentPackage && this.data.currentPackage.technicalFee) || 9.9;
    wx.showModal({
      title: '服务价格明细',
      content: `标准服务金额：¥${this.data.totalAmount}.00\n技术服务费：¥${techFee.toFixed(2)}\n\n支付渠道：微信支付（以支付确认页及商户配置为准）。`,
      showCancel: false
    });
  },

  submitOrder() {
    const {
      currentPackage,
      selectedArea,
      selectedDuration,
      address,
      scheduledDisplayTime,
      totalAmount,
      customerName,
      phone
    } = this.data;

    if (!currentPackage || !address || !scheduledDisplayTime) {
      wx.showToast({ title: '请先选择服务、填写地址和时间', icon: 'none' });
      return;
    }

    const draftOrder = {
      serviceId: (currentPackage && currentPackage.id) || 2,
      serviceName: (currentPackage && currentPackage.name) || '3小时深度保洁',
      category: (currentPackage && currentPackage.category) || '家政保洁',
      area: selectedArea,
      durationLabel: selectedDuration,
      scheduledAt: scheduledDisplayTime,
      address,
      customerName,
      phone,
      amount: totalAmount,
      technicalFee: (currentPackage && currentPackage.technicalFee) || 9.9,
      includedItems: (currentPackage && currentPackage.includedItems) || []
    };

    wx.setStorageSync('draft_order', draftOrder);
    if (app && app.globalData) {
      app.globalData.draftOrder = draftOrder;
    }

    wx.navigateTo({
      url: '/pages/order-confirm/order-confirm'
    });
  }
});
