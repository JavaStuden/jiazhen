const { request } = require('../../utils/request');

Page({
  data: {
    step: 'confirm',
    draft: null,
    publishMode: 'standard',
    urgentFee: 19.9,
    payableTotal: '0.00',
    createdOrder: null,
    recommendProviders: []
  },

  onLoad() {
    const draft = wx.getStorageSync('draft_order');
    const pendingOrder = wx.getStorageSync('pending_payment_order');
    this.setData({ draft: draft || null, createdOrder: pendingOrder || null });
    if (!draft) wx.showToast({ title: '请先填写服务需求', icon: 'none' });
    this.recalcTotal();
  },

  recalcTotal() {
    const base = Number(this.data.draft && this.data.draft.amount) || 0;
    const fee = Number(this.data.draft && this.data.draft.technicalFee) || 0;
    const urgent = this.data.publishMode === 'urgent' ? this.data.urgentFee : 0;
    this.setData({ payableTotal: (base + fee + urgent).toFixed(2) });
  },

  selectPublishMode(e) {
    this.setData({ publishMode: e.currentTarget.dataset.mode });
    this.recalcTotal();
  },

  async payAndPublish() {
    const { draft, publishMode, urgentFee } = this.data;
    if (!draft || !draft.address || !draft.scheduledAt) {
      wx.showToast({ title: '请补充服务地址和上门时间', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '正在创建订单' });
    try {
      let order = this.data.createdOrder || wx.getStorageSync('pending_payment_order');
      if (!order) {
        order = await request('/orders', {
          method: 'POST',
          data: {
            serviceId: draft.serviceId,
            customerName: draft.customerName || '微信用户',
            address: draft.address,
            scheduledAt: draft.scheduledAt,
            note: draft.note || '',
            urgentFee: publishMode === 'urgent' ? urgentFee : 0
          }
        });
        wx.setStorageSync('pending_payment_order', order);
        this.setData({ createdOrder: order });
      }

      const payment = await request(`/orders/${order.id}/payment-params`, { method: 'POST' });
      wx.hideLoading();
      await new Promise((resolve, reject) => wx.requestPayment({ ...payment, success: resolve, fail: reject }));
      wx.showLoading({ title: '正在核实支付' });
      const paidOrder = await request(`/orders/${order.id}/confirm-payment`, { method: 'POST' });
      wx.hideLoading();
      wx.removeStorageSync('pending_payment_order');
      this.onOrderSuccess(paidOrder);
    } catch (error) {
      wx.hideLoading();
      wx.showModal({ title: '暂未完成支付', content: error.message || '请稍后重试', showCancel: false });
    }
  },

  onOrderSuccess(order) {
    wx.setNavigationBarTitle({ title: '发布成功' });
    this.setData({ step: 'success', createdOrder: order });
  },

  goProviderDetail(e) {
    wx.navigateTo({ url: `/pages/provider-detail/provider-detail?id=${e.currentTarget.dataset.id}` });
  },

  cancelPublishedOrder() {
    const order = this.data.createdOrder;
    if (!order) return;
    wx.showModal({
      title: '取消需求',
      content: '确定取消该订单吗？',
      confirmColor: '#ff6a00',
      success: (res) => {
        if (!res.confirm) return;
        request(`/orders/${order.id}/status`, { method: 'PATCH', data: { status: '已取消' } })
          .then(() => {
            wx.removeStorageSync('pending_payment_order');
            wx.showToast({ title: '订单已取消', icon: 'success' });
            setTimeout(() => wx.switchTab({ url: '/pages/orders/orders' }), 600);
          })
          .catch((error) => wx.showToast({ title: error.message || '取消失败', icon: 'none' }));
      }
    });
  },

  goOrderDetail() {
    const order = this.data.createdOrder;
    if (!order) return wx.switchTab({ url: '/pages/orders/orders' });
    wx.navigateTo({ url: `/pages/order-detail/order-detail?id=${order.id}` });
  }
});
