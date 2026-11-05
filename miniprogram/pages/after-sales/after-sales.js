const { request } = require('../../utils/request');

Page({
  data: {
    mode: 'apply', // 'apply' (P17) | 'progress' (P26) | 'review' (P25) | 'complaint' (P27)
    orderNo: '',
    orderId: '',
    // P17 售后申请
    issueTypes: ['服务质量问题', '服务未完成', '人员态度问题', '费用争议'],
    selectedIssueType: '服务质量问题',
    issueDesc: '',
    refundAmount: '',
    confirmedTruth: true,
    // P25 评价服务
    starScore: 4,
    reviewTags: [
      { name: '准时到达', active: true },
      { name: '服务专业', active: true },
      { name: '沟通耐心', active: true },
      { name: '工具齐全', active: true },
      { name: '有待改进', active: false },
      { name: '其他', active: false }
    ],
    reviewText: '',
    anonymousReview: true,
    syncReward: false,
    // P27 投诉与廉政举报
    complaintTypes: ['服务态度', '违规收费', '虚假信息', '隐私泄露', '安全风险', '平台人员廉政'],
    selectedComplaintType: '违规收费',
    complaintTargetTab: '服务人员',
    complaintDesc: '服务过程中提出线下加价，请平台核实处理。',
    anonymousComplaint: true
  },

  onLoad(options) {
    const mode = (options && options.mode) || 'apply';
    const orderNo = (options && options.orderNo) || '';
    const orderId = (options && options.orderId) || '';
    this.switchMode(mode, orderNo, orderId);
    if (orderId) this.loadOrder();
  },

  loadOrder() {
    request(`/orders/${this.data.orderId}`).then(order => this.setData({ order, orderNo: order.orderNo }))
      .catch(error => this.setData({ orderError: error.message || '订单加载失败' }));
  },

  switchMode(mode, orderNo, orderId) {
    const titles = {
      apply: '申请售后',
      progress: '售后进度',
      review: '评价服务',
      complaint: '投诉与廉政举报'
    };
    wx.setNavigationBarTitle({ title: titles[mode] || '售后与评价' });
    this.setData({
      mode,
      orderNo: orderNo || this.data.orderNo,
      orderId: orderId || this.data.orderId
    });
  },

  onModeTabClick(e) {
    this.switchMode(e.currentTarget.dataset.mode);
  },

  selectIssueType(e) {
    this.setData({ selectedIssueType: e.currentTarget.dataset.type });
  },

  onIssueDescInput(e) {
    this.setData({ issueDesc: e.detail.value });
  },

  async submitAfterSalesApply() {
    if (!this.data.orderId) return wx.showToast({ title: '缺少订单信息', icon: 'none' });
    try {
      await request(`/orders/${this.data.orderId}/after-sales`, {
        method: 'POST',
        data: { afterSalesReason: `${this.data.selectedIssueType}: ${this.data.issueDesc}` }
      });
      this.loadOrder();
      wx.showToast({ title: '售后申请已提交', icon: 'success' });
      this.switchMode('progress');
    } catch (error) {
      wx.showToast({ title: error.message || '提交失败', icon: 'none' });
    }
  },

  cancelAfterSales() {
    wx.showModal({
      title: '撤销售后申请',
      content: '撤销后订单将恢复正常结算流程，确定撤销吗？',
      confirmColor: '#ff6a00',
      success: (res) => {
        if (res.confirm) request(`/orders/${this.data.orderId}/after-sales`, { method: 'DELETE' })
          .then(() => { wx.showToast({ title: '售后申请已撤销', icon: 'success' }); wx.navigateBack(); })
          .catch(error => wx.showToast({ title: error.message || '撤销失败', icon: 'none' }));
      }
    });
  },

  contactPlatformCS() {
    if (!this.data.orderId) return wx.showToast({ title: '请从具体订单进入沟通', icon: 'none' });
    wx.navigateTo({ url: `/pages/messages/messages?tab=chat&orderId=${this.data.orderId}` });
  },

  setStar(e) {
    this.setData({ starScore: parseInt(e.currentTarget.dataset.score, 10) });
  },

  toggleReviewTag(e) {
    const idx = e.currentTarget.dataset.index;
    const list = [...this.data.reviewTags];
    list[idx].active = !list[idx].active;
    this.setData({ reviewTags: list });
  },

  onReviewInput(e) {
    this.setData({ reviewText: e.detail.value });
  },

  toggleAnonReview() {
    this.setData({ anonymousReview: !this.data.anonymousReview });
  },

  toggleSyncReward() {
    this.setData({ syncReward: !this.data.syncReward });
  },

  async submitReview() {
    if (!this.data.orderId) return wx.showToast({ title: '缺少订单信息', icon: 'none' });
    const tags = this.data.reviewTags.filter(item => item.active).map(item => item.name).join('、');
    try {
      await request(`/orders/${this.data.orderId}/review`, {
        method: 'POST',
        data: { reviewScore: this.data.starScore, reviewContent: [tags, this.data.reviewText].filter(Boolean).join('；') }
      });
      wx.showToast({ title: '评价已提交', icon: 'success' });
      setTimeout(() => wx.switchTab({ url: '/pages/orders/orders' }), 500);
    } catch (error) {
      wx.showToast({ title: error.message || '评价提交失败', icon: 'none' });
    }
  },

  selectComplaintType(e) {
    this.setData({ selectedComplaintType: e.currentTarget.dataset.type });
  },

  selectComplaintTarget(e) {
    this.setData({ complaintTargetTab: e.currentTarget.dataset.target });
  },

  onComplaintInput(e) {
    this.setData({ complaintDesc: e.detail.value });
  },

  toggleAnonComplaint() {
    this.setData({ anonymousComplaint: !this.data.anonymousComplaint });
  },

  async submitComplaint() {
    if (!this.data.orderId) return wx.showToast({ title: '请从订单详情发起投诉', icon: 'none' });
    try {
      await request(`/orders/${this.data.orderId}/after-sales`, {
        method: 'POST', data: { afterSalesReason: `${this.data.selectedComplaintType}（${this.data.complaintTargetTab}）: ${this.data.complaintDesc}` }
      });
      wx.showToast({ title: '投诉已提交', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 500);
    } catch (error) {
      wx.showToast({ title: error.message || '投诉提交失败', icon: 'none' });
    }
  }
});
