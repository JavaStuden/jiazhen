const app = getApp();
const { request } = require('../../utils/request');

Page({
  data: {
    selectedRole: 'customer', // 'customer' | 'worker'
    agreed: false,
    busy: false,
    showAgreementSheet: false,
    sheetConfirmed: false
  },

  onLoad(options) {
    const savedRole = (options && options.role) || wx.getStorageSync('role');
    if (savedRole) {
      this.setData({ selectedRole: savedRole, agreed: Boolean(wx.getStorageSync(`agreement_confirmed_${savedRole}`)) });
    }
  },

  selectRole(e) {
    const role = e.currentTarget.dataset.role;
    this.setData({ selectedRole: role, agreed: Boolean(wx.getStorageSync(`agreement_confirmed_${role}`)) });
  },

  toggleAgreement() {
    this.setData({ agreed: !this.data.agreed });
  },

  toggleSheetConfirm() {
    this.setData({ sheetConfirmed: !this.data.sheetConfirmed });
  },

  handleLogin() {
    if (!this.data.agreed) {
      wx.showToast({ title: '请先勾选并同意用户协议', icon: 'none' });
      return;
    }

    const { selectedRole } = this.data;
    const confirmedKey = `agreement_confirmed_${selectedRole}`;
    if (!wx.getStorageSync(confirmedKey)) {
      this.setData({ showAgreementSheet: true, sheetConfirmed: false });
      return;
    }

  },

  confirmAgreementAndContinue() {
    if (!this.data.sheetConfirmed) {
      wx.showToast({ title: '请先勾选同意全部协议', icon: 'none' });
      return;
    }
    const { selectedRole } = this.data;
    wx.setStorageSync(`agreement_confirmed_${selectedRole}`, true);
    this.setData({ showAgreementSheet: false, agreed: true });
  },

  closeAgreementSheet() {
    this.setData({ showAgreementSheet: false });
  },

  async handleWechatLogin(event) {
    if (!this.data.agreed || !wx.getStorageSync(`agreement_confirmed_${this.data.selectedRole}`)) {
      wx.showToast({ title: '请先阅读并确认平台协议', icon: 'none' });
      return;
    }
    if (event.detail.errMsg !== 'getPhoneNumber:ok' || !event.detail.code || this.data.busy) {
      if (event.detail.errMsg !== 'getPhoneNumber:ok') wx.showToast({ title: '需要授权手机号才能登录', icon: 'none' });
      return;
    }
    this.setData({ busy: true });
    wx.showLoading({ title: '正在验证身份' });
    try {
      const login = await new Promise((resolve, reject) => wx.login({ success: resolve, fail: reject }));
      const session = await request('/auth/wechat', { method: 'POST', data: { code: login.code, role: this.data.selectedRole } });
      app.globalData.accessToken = session.accessToken;
      app.globalData.role = session.role;
      wx.setStorageSync('accessToken', session.accessToken);
      wx.setStorageSync('role', session.role);
      const profile = await request('/auth/phone', { method: 'POST', data: { code: event.detail.code } });
      wx.setStorageSync('phone', profile.phone);
      wx.setStorageSync('isLoggedIn', true);
      wx.hideLoading();
      if (session.role === 'worker' && session.accountStatus !== '在线' && session.accountStatus !== '待机') {
        wx.showToast({ title: '服务人员资料待审核', icon: 'none' });
      } else {
        wx.showToast({ title: '登录成功', icon: 'success' });
      }
      setTimeout(() => {
        if (session.role === 'customer') wx.switchTab({ url: '/pages/index/index' });
        else if (session.accountStatus === '在线' || session.accountStatus === '待机') wx.navigateTo({ url: '/pages/worker/worker' });
        else wx.navigateTo({ url: '/pages/worker-ops/worker-ops?section=onboarding' });
      }, 500);
    } catch (error) {
      wx.hideLoading();
      wx.showModal({ title: '登录失败', content: error.message || '请稍后重试', showCancel: false });
    } finally {
      this.setData({ busy: false });
    }
  },

  openAgreementSheetPreview() {
    this.setData({ showAgreementSheet: true, sheetConfirmed: false });
  },

  enterDirectly() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  viewAgreement() {
    this.setData({ showAgreementSheet: true });
  },

  viewPrivacy() {
    wx.showModal({
      title: '太禾行隐私保护政策',
      content: '平台严格保障个人隐私安全，接单前双方地址与门牌号进行加密保护，所有通话与三方协商均在线存证。',
      showCancel: false
    });
  },

  viewRuleDetail(e) {
    const title = e.currentTarget.dataset.title;
    wx.showModal({
      title,
      content: '太禾行到家严格执行实名认证、平台担保交易与全程服务留痕规则。严禁私下交换联系方式或跳单交易，保障雇主与服务人员双方合法权益。',
      showCancel: false
    });
  },

});
