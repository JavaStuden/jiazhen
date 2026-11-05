const { request } = require('../../utils/request');

Page({
  data: {
    tab: 'list', // 'list' (P14) | 'chat' (P15)
    orderNo: '', categories: [], messageList: [],
    anomalyHandled: false,
    anomalyStatusText: '待雇主确认',
    chatInput: '',
    chatMessages: [], orderId: '', order: null
  },

  onLoad(options) {
    if (options && options.tab === 'chat') this.openChat(options.orderNo || '', options.orderId || '');
    else this.loadOrderNotifications();
  },

  onHide() { if (this.messageTimer) clearInterval(this.messageTimer); },

  loadOrderNotifications() {
    request('/orders').then(orders => this.setData({ messageList: orders.map(order => ({
      id: order.id, type: 'order', icon: '📋', bg: '#ff8b2b', title: `订单${order.status}`,
      desc: `${order.serviceName} · ${order.scheduledAt || ''}`, time: order.updatedAt || order.createdAt || '', orderNo: order.orderNo
    })) })).catch(error => this.setData({ chatError: error.message || '订单消息加载失败' }));
  },

  openChat(orderNo, orderId) {
    if (typeof orderNo !== 'string') orderNo = '';
    wx.setNavigationBarTitle({ title: '平台三方沟通' });
    this.setData({ anomalyHandled: false, anomalyStatusText: '待雇主确认', chatMessages: [] });
    this.setData({ tab: 'chat', orderNo: orderNo || '', orderId: orderId || '' });
    const resolveOrder = orderId ? Promise.resolve({ id: orderId }) : request('/orders').then(orders => {
      const exact = orderNo && orders.find(item => item.orderNo === orderNo);
      return exact || (!orderNo && orders[0]);
    });
    resolveOrder.then(order => {
      if (!order) throw new Error('没有找到对应订单');
      return request(`/orders/${order.id}`).then(detail => {
        this.setData({ orderId: String(detail.id), orderNo: detail.orderNo || orderNo, order: detail });
      });
    }).then(() => {
      this.loadMessages();
      if (this.messageTimer) clearInterval(this.messageTimer);
      this.messageTimer = setInterval(() => this.loadMessages(), 5000);
    }).catch(error => wx.showToast({ title: error.message || '无法打开订单沟通', icon: 'none' }));
  },

  loadMessages() {
    if (!this.data.orderId) return;
    Promise.all([request(`/orders/${this.data.orderId}/messages`), request(`/orders/${this.data.orderId}`)]).then(([chatMessages, order]) => this.setData({
      order, chatMessages: chatMessages.map((message, index) => ({
        ...message, sender: message.senderRole, name: message.senderName, text: message.content,
        hasAnomalyCard: index === chatMessages.length - 1 && order.anomalyStatus === '待确认'
      }))
    }))
      .catch(error => this.setData({ chatError: error.message || '消息加载失败' }));
  },

  backToList() {
    wx.setNavigationBarTitle({ title: '消息中心' });
    this.setData({ tab: 'list' });
  },

  markAllRead() {
    wx.showToast({ title: '订单状态通知暂不支持标记已读', icon: 'none' });
  },

  onMessageClick(e) {
    const item = e.currentTarget.dataset.item;
    if (item.type === 'chat') {
      this.openChat(item.orderNo, String(item.id));
    } else {
      wx.showToast({ title: '暂无该消息', icon: 'none' });
    }
  },

  handleAnomalyInChat(e) {
    const agreed = e.currentTarget.dataset.agreed === 'true';
    if (!this.data.orderId) return wx.showToast({ title: '缺少订单信息', icon: 'none' });
    request(`/orders/${this.data.orderId}/anomaly-confirm`, { method: 'POST', data: { agreed } })
      .then(order => {
        this.setData({ order, anomalyHandled: true, anomalyStatusText: order.anomalyStatus });
        this.loadMessages();
        wx.showToast({ title: agreed ? '已同意调整' : '已拒绝调整', icon: 'success' });
      }).catch(error => wx.showToast({ title: error.message || '处理失败', icon: 'none' }));
  },

  onChatInput(e) {
    this.setData({ chatInput: e.detail.value });
  },

  sendChatMessage() {
    const txt = this.data.chatInput.trim();
    if (!txt) return;
    if (!this.data.orderId) return wx.showToast({ title: '请从订单进入沟通', icon: 'none' });
    request(`/orders/${this.data.orderId}/messages`, { method: 'POST', data: { content: txt } })
      .then(() => { this.setData({ chatInput: '' }); this.loadMessages(); })
      .catch(error => wx.showToast({ title: error.message || '消息发送失败', icon: 'none' }));
  }
});
