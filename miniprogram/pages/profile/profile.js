const app = getApp();
const { request } = require('../../utils/request');

Page({
  data: {
    userInfo: {
      name: '微信用户', phone: '', role: 'customer', orderCount: 0,
      pendingAmount: '-', invoiceAmount: '-'
    }, loadError: ''
  },

  onShow() {
    const role = wx.getStorageSync('role') || 'customer';
    this.setData({ ['userInfo.role']: role });
    Promise.all([request('/auth/me'), request('/orders')]).then(([me, orders]) => {
      const pending = orders.filter(order => ['待支付', '待接单', '待上门', '服务中'].includes(order.status));
      this.setData({ userInfo: {
        ...this.data.userInfo, name: me.displayName || '微信用户', phone: me.phone || '',
        orderCount: orders.length,
        pendingAmount: pending.reduce((sum, order) => sum + Number(order.payableAmount || 0), 0).toFixed(2),
        invoiceAmount: '-'
      }, loadError: '' });
    }).catch(error => this.setData({ loadError: error.message || '账户信息加载失败' }));
  },

  goOrders() {
    wx.switchTab({ url: '/pages/orders/orders' });
  },

  goToLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  },

  switchWorker() {
    wx.setStorageSync('role', 'worker');
    wx.removeStorageSync('accessToken');
    wx.removeStorageSync('isLoggedIn');
    if (app && app.globalData) app.globalData.accessToken = '';
    if (app && app.globalData) {
      app.globalData.role = 'worker';
    }
    wx.navigateTo({ url: '/pages/login/login?role=worker' });
  },

  goUserSection(e) {
    const sec = e.currentTarget.dataset.sec;
    wx.navigateTo({
      url: `/pages/user-center/user-center?section=${sec}`
    });
  },

  goAfterSales(e) {
    const mode = e.currentTarget.dataset.mode || 'progress';
    wx.navigateTo({
      url: `/pages/after-sales/after-sales?mode=${mode}`
    });
  },

  goMessages() {
    wx.navigateTo({
      url: '/pages/messages/messages'
    });
  }
});
