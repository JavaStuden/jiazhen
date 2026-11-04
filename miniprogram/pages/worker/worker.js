const app = getApp();

Page({
  data: {
    bellEnabled: true,
    grabOrders: [
      {
        id: 201,
        title: '3小时深度保洁',
        category: '家政保洁',
        netIncome: 156,
        totalPrice: 168,
        platformFee: 12,
        distance: '1.2km',
        time: '今天 14:30 - 17:30',
        address: '渝北区新月路（接单后显示门牌号）',
        employerCredit: 98,
        orderCount: 32
      },
      {
        id: 202,
        title: '居家养老照护·4小时',
        category: '养老护理',
        netIncome: 209,
        totalPrice: 220,
        platformFee: 11,
        distance: '2.1km',
        time: '今天 13:00 - 17:00',
        address: '渝北区金开大道（接单后显示门牌号）',
        employerCredit: 96,
        orderCount: 15
      },
      {
        id: 203,
        title: '三甲医院尊享陪诊·4小时',
        category: '陪医陪诊',
        netIncome: 368,
        totalPrice: 399,
        platformFee: 31,
        distance: '3.5km',
        time: '明天 08:30 - 12:30',
        address: '两江新区第一人民医院（院内陪同）',
        employerCredit: 100,
        orderCount: 8
      }
    ]
  },

  toggleBell() {
    this.setData({ bellEnabled: !this.data.bellEnabled });
    wx.showToast({
      title: this.data.bellEnabled ? '听单提醒已开启' : '听单已静音',
      icon: 'none'
    });
  },

  switchToCustomer() {
    wx.setStorageSync('role', 'customer');
    if (app && app.globalData) {
      app.globalData.role = 'customer';
    }
    wx.switchTab({ url: '/pages/index/index' });
  },

  grabOrder(e) {
    const order = e.currentTarget.dataset.order;
    wx.showModal({
      title: '抢单确认',
      content: `项目：${order.title}\n预计到手收入：¥${order.netIncome}\n服务地址：${order.address}\n\n抢单成功后，请按时到达并完成定位打卡与现场拍照存证。`,
      confirmText: '确认抢单',
      confirmColor: '#ff6a00',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '抢单成功！请准时履约',
            icon: 'success'
          });
        }
      }
    });
  }
});
