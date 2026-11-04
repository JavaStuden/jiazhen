const app = getApp();

Page({
  data: {
    phone: '13800002068',
    code: '123456',
    selectedRole: 'customer', // 'customer' | 'worker'
    agreed: true,
    counting: false,
    countdown: 60,
    countdownText: '获取验证码'
  },

  onLoad() {
    const savedRole = wx.getStorageSync('role');
    if (savedRole) {
      this.setData({ selectedRole: savedRole });
    }
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value.trim() });
  },

  clearPhone() {
    this.setData({ phone: '' });
  },

  onCodeInput(e) {
    this.setData({ code: e.detail.value.trim() });
  },

  selectRole(e) {
    const role = e.currentTarget.dataset.role;
    this.setData({ selectedRole: role });
  },

  toggleAgreement() {
    this.setData({ agreed: !this.data.agreed });
  },

  getSmsCode() {
    if (!this.data.phone || this.data.phone.length !== 11) {
      wx.showToast({ title: '请输入正确的11位手机号', icon: 'none' });
      return;
    }

    if (this.data.counting) return;

    this.setData({
      counting: true,
      countdown: 60,
      countdownText: '60s后重试'
    });

    wx.showToast({ title: '验证码已发送至手机', icon: 'success' });

    this.timer = setInterval(() => {
      let count = this.data.countdown - 1;
      if (count <= 0) {
        clearInterval(this.timer);
        this.setData({
          counting: false,
          countdown: 60,
          countdownText: '重新获取'
        });
      } else {
        this.setData({
          countdown: count,
          countdownText: `${count}s后重试`
        });
      }
    }, 1000);
  },

  handleLogin() {
    if (!this.data.agreed) {
      wx.showToast({ title: '请先勾选并同意用户协议', icon: 'none' });
      return;
    }

    if (!this.data.phone || this.data.phone.length !== 11) {
      wx.showToast({ title: '请输入11位手机号', icon: 'none' });
      return;
    }

    const { selectedRole, phone } = this.data;
    wx.setStorageSync('role', selectedRole);
    wx.setStorageSync('phone', phone);
    wx.setStorageSync('isLoggedIn', true);
    if (app && app.globalData) {
      app.globalData.role = selectedRole;
    }

    wx.showToast({
      title: selectedRole === 'customer' ? '雇主登录成功' : '服务人员登录成功',
      icon: 'success'
    });

    setTimeout(() => {
      if (selectedRole === 'customer') {
        wx.switchTab({ url: '/pages/index/index' });
      } else {
        wx.navigateTo({ url: '/pages/worker/worker' });
      }
    }, 800);
  },

  enterDirectly() {
    wx.setStorageSync('role', 'customer');
    if (app && app.globalData) {
      app.globalData.role = 'customer';
    }
    wx.switchTab({ url: '/pages/index/index' });
  },

  viewAgreement() {
    wx.showModal({
      title: '太禾行平台用户协议',
      content: '太禾行到家作为专业家政与养老服务平台，严格遵循实名认证、平台担保、全程留痕原则，为广大雇主与服务人员提供安全、放心的到家生活服务。',
      showCancel: false
    });
  },

  viewPrivacy() {
    wx.showModal({
      title: '太禾行隐私保护政策',
      content: '平台严格保障个人隐私安全，接单前双方地址与门牌号进行加密保护，所有通话与三方协商均在线存证。',
      showCancel: false
    });
  },

  onUnload() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
});
