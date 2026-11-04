App({
  globalData: {
    apiBaseUrl: 'https://voice.yourunshi.online/taihexing/api/public',
    role: 'customer',
    selectedPackage: null,
    userInfo: {
      name: '陈女士',
      phone: '13800002068',
      city: '重庆市渝北区'
    }
  },

  onLaunch() {
    const savedRole = wx.getStorageSync('role');
    if (!savedRole) {
      wx.setStorageSync('role', 'customer');
    } else {
      this.globalData.role = savedRole;
    }
  }
});
