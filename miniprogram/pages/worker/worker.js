const app = getApp();
const { request } = require('../../utils/request');

Page({
  data: {
    bottomTab: 'hall', // 'hall' (P3) | 'orders' (P9) | 'mine' (P4)
    filterChip: '智能匹配',
    orderStatusTab: '待上门',
    grabOrders: [],
    serviceOrders: [],
    workerName: '服务人员',
    activeOrder: null,
    currentLocation: '尚未获取定位',
    loadError: ''
  },

  onShow() { this.loadWorkerOrders(); },

  loadWorkerOrders() {
    Promise.all([request('/orders/available'), request('/orders'), request('/auth/me')]).then(([available, assigned, me]) => {
      this.setData({
        loadError: '', workerName: me.displayName || '服务人员',
        grabOrders: available.map(order => ({
          ...order, title: order.serviceName, price: order.amount, time: order.scheduledAt,
          distance: order.addressLabel, matchType: '公共订单', matchClass: 'blue-tag', tags: [],
          footNote: '接单后查看完整地址和联系方式', btnText: '查看并抢单'
        })),
        serviceOrders: assigned.map(order => ({
          ...order, title: order.serviceName, time: order.scheduledAt, address: order.address,
          customer: order.customerName, incomeLabel: '订单金额', incomeVal: `¥${order.amount || 0}`
        })),
        activeOrder: assigned.find(order => ['待上门', '服务中', '待结算'].includes(order.status)) || null
      });
    }).catch(error => this.setData({ loadError: error.message || '订单加载失败', grabOrders: [], serviceOrders: [] }));
  },

  switchBottomTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === 'messages') {
      wx.navigateTo({ url: '/pages/messages/messages' });
      return;
    }
    const titles = {
      hall: '抢单大厅',
      orders: '服务单',
      mine: '服务工作台 · 我的'
    };
    wx.setNavigationBarTitle({ title: titles[tab] || '服务人员端' });
    this.setData({ bottomTab: tab });
  },

  selectFilterChip(e) {
    this.setData({ filterChip: e.currentTarget.dataset.chip });
  },

  selectOrderStatusTab(e) {
    this.setData({ orderStatusTab: e.currentTarget.dataset.status });
  },

  refreshLocation() {
    wx.getLocation({ type: 'gcj02', success: location => {
      this.setData({ currentLocation: `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` });
    }, fail: () => wx.showToast({ title: '无法获取定位，请检查授权', icon: 'none' }) });
  },

  switchToCustomer() {
    wx.removeStorageSync('accessToken');
    wx.removeStorageSync('isLoggedIn');
    app.globalData.accessToken = '';
    wx.setStorageSync('role', 'customer');
    if (app && app.globalData) {
      app.globalData.role = 'customer';
    }
    wx.navigateTo({ url: '/pages/login/login?role=customer' });
  },

  goWorkerOps(e) {
    const sec = e.currentTarget.dataset.sec;
    const orderId = e.currentTarget.dataset.orderId;
    wx.navigateTo({
      url: `/pages/worker-ops/worker-ops?section=${sec}${orderId ? `&orderId=${orderId}` : ''}`
    });
  },

  goPartnerOrInvite(e) {
    const sec = e.currentTarget.dataset.sec;
    wx.navigateTo({
      url: `/pages/user-center/user-center?section=${sec}&role=worker`
    });
  },

  goChat() {
    if (!this.data.activeOrder) return wx.showToast({ title: '暂无可沟通订单', icon: 'none' });
    wx.navigateTo({ url: `/pages/messages/messages?tab=chat&orderId=${this.data.activeOrder.id}` });
  },

  goComplaint() {
    wx.navigateTo({
      url: '/pages/after-sales/after-sales?mode=complaint'
    });
  },

  callCustomer(e) {
    const phone = e.currentTarget.dataset.order && e.currentTarget.dataset.order.phone;
    if (!phone) return wx.showToast({ title: '该订单暂未提供联系电话', icon: 'none' });
    wx.makePhoneCall({ phoneNumber: phone }).catch(() => {});
  }
});
