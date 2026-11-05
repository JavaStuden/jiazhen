const { request } = require('../../utils/request');

Page({
  data: { order: null, isPendingMode: false, loading: true },

  onLoad(options) {
    this.orderId = options && options.id;
    if (!this.orderId) return this.failLoad('缺少订单编号');
    this.loadOrder();
  },

  onShow() {
    if (this.orderId) this.loadOrder();
  },

  loadOrder() {
    this.setData({ loading: true });
    request(`/orders/${this.orderId}`).then(order => this.applyOrder(order)).catch(error => this.failLoad(error.message || '订单加载失败'));
  },

  failLoad(message) {
    this.setData({ loading: false });
    wx.showModal({ title: '无法打开订单', content: message, showCancel: false, success: () => wx.navigateBack() });
  },

  applyOrder(order) {
    const pending = order.status === '待支付' || order.status === '待匹配' || order.status === '待接单';
    wx.setNavigationBarTitle({ title: pending ? '订单详情' : '订单履约' });
    this.setData({ order, isPendingMode: pending, loading: false });
  },

  goProviderDetail() {
    if (!this.data.order.providerId) return wx.showToast({ title: '服务人员尚未接单', icon: 'none' });
    wx.navigateTo({ url: `/pages/provider-detail/provider-detail?id=${this.data.order.providerId}` });
  },

  goThreePartyChat() {
    wx.navigateTo({ url: `/pages/messages/messages?tab=chat&orderId=${this.data.order.id}` });
  },

  callProvider() { this.goThreePartyChat(); },

  async handleAnomalyDecision(e) {
    const agreed = e.currentTarget.dataset.agreed === 'true';
    try {
      const updated = await request(`/orders/${this.data.order.id}/anomaly-confirm`, { method: 'POST', data: { agreed } });
      this.applyOrder(updated);
      wx.showToast({ title: agreed ? '已同意时长调整' : '已拒绝调整申请', icon: 'success' });
    } catch (error) {
      wx.showToast({ title: error.message || '操作失败', icon: 'none' });
    }
  },

  urgeMatching() { wx.showToast({ title: '加急服务需重新发布并支付加急费', icon: 'none' }); },

  cancelOrder() {
    wx.showModal({
      title: '取消订单', content: '确定取消该订单吗？', confirmColor: '#ff6a00',
      success: (res) => {
        if (!res.confirm) return;
        request(`/orders/${this.data.order.id}/status`, { method: 'PATCH', data: { status: '已取消' } })
          .then(order => { this.applyOrder(order); wx.showToast({ title: '订单已取消', icon: 'success' }); })
          .catch(error => wx.showToast({ title: error.message || '取消失败', icon: 'none' }));
      }
    });
  },

  goAfterSales() {
    const order = this.data.order;
    wx.navigateTo({ url: `/pages/after-sales/after-sales?mode=apply&orderId=${order.id}&orderNo=${order.orderNo}` });
  },

  goComplaint() {
    const order = this.data.order;
    wx.navigateTo({ url: `/pages/after-sales/after-sales?mode=complaint&orderId=${order.id}&orderNo=${order.orderNo}` });
  },

  confirmCompleteService() {
    wx.showModal({
      title: '确认完成服务', content: '确认服务人员已按清单完成全部服务内容？', confirmText: '确认完成', confirmColor: '#ff6a00',
      success: (res) => {
        if (!res.confirm) return;
        request(`/orders/${this.data.order.id}/complete`, { method: 'POST' })
          .then(() => wx.navigateTo({ url: `/pages/after-sales/after-sales?mode=review&orderId=${this.data.order.id}&orderNo=${this.data.order.orderNo}` }))
          .catch(error => wx.showToast({ title: error.message || '确认失败', icon: 'none' }));
      }
    });
  }
});
