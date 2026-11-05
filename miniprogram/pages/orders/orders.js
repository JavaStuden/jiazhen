const { getOrders } = require('../../utils/store');
const { request } = require('../../utils/request');

Page({
  data: {
    tabs: ['全部', '待支付', '待接单', '待上门', '服务中', '待评价', '已完成'],
    currentTab: '全部',
    orders: [],
    filteredOrders: [],
    loadError: ''
  },

  onShow() { this.loadOrders(); },

  loadOrders() {
    getOrders().then((orders) => {
      this.setData({ orders, loadError: '' });
      this.applyFilter();
    }).catch((error) => this.setData({ loadError: error.message || '订单加载失败', orders: [], filteredOrders: [] }));
  },

  switchTab(e) {
    this.setData({ currentTab: e.currentTarget.dataset.tab });
    this.applyFilter();
  },

  applyFilter() {
    const { currentTab, orders } = this.data;
    this.setData({ filteredOrders: currentTab === '全部' ? orders : orders.filter(order => order.status === currentTab) });
  },

  contactWorker(e) {
    const order = e.currentTarget.dataset.order;
    wx.navigateTo({ url: `/pages/messages/messages?tab=chat&orderId=${order.id}&orderNo=${order.orderNo}` });
  },

  viewOrderDetail(e) {
    const order = e.currentTarget.dataset.order;
    wx.navigateTo({ url: `/pages/order-detail/order-detail?id=${order.id}` });
  },

  handleSecondaryAction(e) {
    const order = e.currentTarget.dataset.order;
    if (order.status === '服务中') return this.contactWorker(e);
    if (order.status !== '待支付' && order.status !== '待接单' && order.status !== '待匹配') {
      return wx.navigateTo({ url: `/pages/after-sales/after-sales?mode=apply&orderId=${order.id}&orderNo=${order.orderNo}` });
    }
    wx.showModal({
      title: '取消订单',
      content: '确定取消该订单吗？',
      confirmColor: '#ff6a00',
      success: (res) => {
        if (!res.confirm) return;
        request(`/orders/${order.id}/status`, { method: 'PATCH', data: { status: '已取消' } })
          .then(() => { wx.showToast({ title: '订单已取消', icon: 'success' }); this.loadOrders(); })
          .catch((error) => wx.showToast({ title: error.message || '取消失败', icon: 'none' }));
      }
    });
  },

  handleOrderAction(e) {
    const order = e.currentTarget.dataset.order;
    if (order.status === '待评价') {
      return wx.navigateTo({ url: `/pages/after-sales/after-sales?mode=review&orderId=${order.id}&orderNo=${order.orderNo}` });
    }
    if (order.status === '待支付') {
      wx.setStorageSync('pending_payment_order', order);
      return wx.navigateTo({ url: '/pages/order-confirm/order-confirm' });
    }
    this.viewOrderDetail(e);
  },

  goServices() { wx.navigateTo({ url: '/pages/services/services' }); }
});
