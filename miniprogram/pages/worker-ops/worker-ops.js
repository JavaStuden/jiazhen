const { request } = require('../../utils/request');

const SECTION_TITLES = {
  onboarding: '服务人员入驻',
  remind: '接单提醒设置',
  deposit: '履约保证金',
  income: '收入账单',
  certs: '证书与技能',
  'grab-detail': '抢单详情',
  checkin: '到家打卡',
  anomaly: '服务异常上报',
  complete: '完成服务',
  settlement: '结算明细'
};

Page({
  data: {
    section: 'grab-detail',
    orderId: '',
    activeOrder: null,
    workerName: '',
    phone: '',
    saving: false,
    navTabs: [
      { key: 'grab-detail', label: '抢单详情' },
      { key: 'checkin', label: '到家打卡' },
      { key: 'anomaly', label: '异常上报' },
      { key: 'complete', label: '完成服务' },
      { key: 'settlement', label: '结算明细' },
      { key: 'onboarding', label: '服务入驻' },
      { key: 'certs', label: '证书技能' },
      { key: 'deposit', label: '履约保证金' },
      { key: 'income', label: '收入账单' },
      { key: 'remind', label: '提醒设置' }
    ],
    // P2 & P8 技能多选
    workerSkills: [
      { name: '保洁员', active: true },
      { name: '养老护理员', active: true },
      { name: '维修师傅', active: false },
      { name: '陪诊员', active: false },
      { name: '营养师', active: false }
    ],
    // P5 提醒设置
    remindMaster: true,
    vibrateOn: true,
    repeatOn: false,
    bgNotifyOn: true,
    depositLogs: [], incomeTrend: [], incomeBills: [],
    reminderLoading: false,
    // P11 打卡确认
    checkinConfirmed: true,
    // P12 异常上报
    anomalyTypes: ['服务时长调整', '雇主暂时无法联系', '地址异常', '服务范围变更', '现场安全风险', '其他问题'],
    selectedAnomalyType: '服务时长调整',
    extendOption: '延长30分钟',
    anomalyReasonText: '',
    // P13 完成服务
    checklistItems: [
      { name: '客厅除尘', done: true },
      { name: '卧室整理', done: true },
      { name: '厨卫清洁', done: true },
      { name: '地面清洁', done: true }
    ],
    completeRemark: '',
    employerConfirmSwitch: true
  },

  onLoad(options) {
    const sec = (options && options.section) || 'grab-detail';
    const orderId = options && options.orderId;
    this.orderId = orderId || '';
    this.setData({ orderId: this.orderId, workerName: wx.getStorageSync('workerName') || '', phone: wx.getStorageSync('phone') || '' });
    this.switchSection(sec);
    request('/auth/account').then(account => {
      if (account.reminders) this.setData(account.reminders);
    }).catch(() => {});
    if (this.orderId) this.loadOrder();
  },

  loadOrder() {
    const path = this.data.section === 'grab-detail' ? `/orders/available/${this.orderId}` : `/orders/${this.orderId}`;
    request(path).then(order => this.setData({ activeOrder: order }))
      .catch(error => wx.showModal({ title: '订单加载失败', content: error.message || '请返回后重试', showCancel: false }));
  },

  switchSection(sec) {
    wx.setNavigationBarTitle({ title: SECTION_TITLES[sec] || '服务人员工作台' });
    this.setData({ section: sec });
    if (this.orderId && sec !== 'grab-detail') this.loadOrder();
  },

  onNavTabClick(e) {
    this.switchSection(e.currentTarget.dataset.sec);
  },

  toggleSkill(e) {
    const idx = e.currentTarget.dataset.index;
    const list = [...this.data.workerSkills];
    list[idx].active = !list[idx].active;
    this.setData({ workerSkills: list });
  },

  onWorkerNameInput(e) { this.setData({ workerName: e.detail.value.trim() }); },
  onAnomalyReasonInput(e) { this.setData({ anomalyReasonText: e.detail.value }); },
  onCompleteRemarkInput(e) { this.setData({ completeRemark: e.detail.value }); },

  async submitOnboarding() {
    const skills = this.data.workerSkills.filter(skill => skill.active).map(skill => skill.name);
    try {
      const result = await request('/auth/worker-application', {
        method: 'POST', data: { name: this.data.workerName, skills }
      });
      wx.setStorageSync('workerName', this.data.workerName);
      wx.showToast({ title: `资料已提交：${result.status}`, icon: 'success' });
      this.switchSection('certs');
    } catch (error) { wx.showToast({ title: error.message || '提交失败', icon: 'none' }); }
  },

  toggleSwitch(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: !this.data[field] });
    wx.setStorageSync('worker_reminders', {
      remindMaster: this.data.remindMaster,
      vibrateOn: this.data.vibrateOn,
      repeatOn: this.data.repeatOn,
      bgNotifyOn: this.data.bgNotifyOn
    });
  },

  saveRemindSettings() {
    request('/auth/account', { method: 'PUT', data: { reminders: {
      remindMaster: this.data.remindMaster, vibrateOn: this.data.vibrateOn,
      repeatOn: this.data.repeatOn, bgNotifyOn: this.data.bgNotifyOn
    } } }).then(() => wx.showToast({ title: '提醒设置已保存', icon: 'success' }))
      .catch(error => wx.showToast({ title: error.message || '保存失败', icon: 'none' }));
  },

  payDeposit() { wx.showToast({ title: '保证金收款尚未接入，未扣款', icon: 'none' }); },

  withdrawIncome() {
    wx.showModal({
      title: '提现暂不可用',
      content: '提现账户和结算通道尚未配置，本次未提交申请。',
      showCancel: false,
      confirmColor: '#ff6a00'
    });
  },

  async confirmGrabOrder() {
    if (!this.orderId || this.data.saving) return wx.showToast({ title: '订单信息缺失', icon: 'none' });
    this.setData({ saving: true });
    try {
      await request(`/orders/${this.orderId}/grab`, { method: 'POST' });
      wx.showToast({ title: '接单成功', icon: 'success' });
      this.switchSection('checkin');
      this.loadOrder();
    } catch (error) {
      wx.showToast({ title: error.message || '接单失败', icon: 'none' });
    } finally { this.setData({ saving: false }); }
  },

  async confirmCheckin() {
    if (!this.orderId) return wx.showToast({ title: '订单信息缺失', icon: 'none' });
    try {
      const location = await new Promise((resolve, reject) => wx.getLocation({ type: 'gcj02', success: resolve, fail: reject }));
      await request(`/orders/${this.orderId}/checkin`, { method: 'POST', data: { checkinAddress: `${location.latitude},${location.longitude} accuracy=${location.accuracy}m` } });
      wx.showToast({ title: '到家打卡已记录', icon: 'success' });
      this.switchSection('complete');
      this.loadOrder();
    } catch (error) { wx.showToast({ title: error.message || '定位或打卡失败', icon: 'none' }); }
  },

  selectAnomalyType(e) {
    this.setData({ selectedAnomalyType: e.currentTarget.dataset.type });
  },

  selectExtendOption(e) {
    this.setData({ extendOption: e.currentTarget.dataset.opt });
  },

  async submitAnomalyReport() {
    if (!this.orderId) return wx.showToast({ title: '订单信息缺失', icon: 'none' });
    try {
      await request(`/orders/${this.orderId}/anomaly`, {
        method: 'POST',
        data: { anomalyReason: this.data.anomalyReasonText, anomalyTargetDuration: this.data.extendOption }
      });
      wx.showToast({ title: '异常已上报', icon: 'success' });
      this.loadOrder();
    } catch (error) { wx.showToast({ title: error.message || '上报失败', icon: 'none' }); }
  },

  async submitServiceComplete() {
    if (!this.orderId) return wx.showToast({ title: '订单信息缺失', icon: 'none' });
    try {
      const order = await request(`/orders/${this.orderId}/complete`, { method: 'POST', data: { note: this.data.completeRemark } });
      this.setData({ activeOrder: order });
      wx.showToast({ title: '完工状态已提交', icon: 'success' });
      this.switchSection('settlement');
    } catch (error) { wx.showToast({ title: error.message || '完工提交失败', icon: 'none' }); }
  }
});
