const app = getApp();

Page({
  data: {
    userInfo: {
      name: '陈女士',
      phone: '138****2068',
      role: 'customer'
    }
  },

  onShow() {
    const role = wx.getStorageSync('role') || 'customer';
    this.setData({ ['userInfo.role']: role });
  },

  goOrders() {
    wx.switchTab({ url: '/pages/orders/orders' });
  },

  goToLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  },

  switchWorker() {
    wx.setStorageSync('role', 'worker');
    if (app && app.globalData) {
      app.globalData.role = 'worker';
    }
    wx.navigateTo({ url: '/pages/worker/worker' });
  },

  contactService() {
    wx.showModal({
      title: '太禾行客服中心',
      content: '7x24小时官方客服热线：18980779943\n如遇紧急人身或财产安全，平台提供紧急绿色通道。',
      showCancel: false
    });
  },

  showFeatureToast(e) {
    const name = e.currentTarget.dataset.name;
    wx.showToast({
      title: `${name}模块已就绪`,
      icon: 'none'
    });
  }
});
