const { request } = require('../../utils/request');

const DEFAULT_ORDERS = [
  {
    id: 101,
    orderNo: 'TH202608100018',
    serviceName: '3小时深度保洁',
    amount: 168,
    status: '服务中',
    scheduledAt: '今天 15:00 - 18:00',
    address: '重庆市渝北区金开大道',
    providerName: '李阿姨'
  },
  {
    id: 102,
    orderNo: 'TH202608110002',
    serviceName: '居家养老照护·4小时',
    amount: 220,
    status: '待接单',
    scheduledAt: '明天 13:00 - 17:00',
    address: '重庆市渝北区金开大道'
  },
  {
    id: 103,
    orderNo: 'TH202608090003',
    serviceName: '上门维修·水龙头检修',
    amount: 98,
    status: '已完成',
    scheduledAt: '8月9日 10:00',
    address: '重庆市渝北区金开大道',
    providerName: '王师傅'
  }
];

Page({
  data: {
    tabs: ['全部', '待匹配', '服务中', '待评价', '已完成'],
    currentTab: '全部',
    orders: [],
    filteredOrders: []
  },

  onShow() {
    this.loadOrders();
  },

  loadOrders() {
    const local = wx.getStorageSync('local_orders') || [];
    request('/orders')
      .then((serverOrders) => {
        const combined = [...local, ...serverOrders];
        this.setData({ orders: combined.length ? combined : DEFAULT_ORDERS });
        this.applyFilter();
      })
      .catch(() => {
        const combined = [...local, ...DEFAULT_ORDERS];
        this.setData({ orders: combined });
        this.applyFilter();
      });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    this.applyFilter();
  },

  applyFilter() {
    const { currentTab, orders } = this.data;
    if (currentTab === '全部') {
      this.setData({ filteredOrders: orders });
    } else if (currentTab === '待匹配') {
      this.setData({
        filteredOrders: orders.filter(o => o.status === '待匹配' || o.status === '待接单')
      });
    } else {
      this.setData({
        filteredOrders: orders.filter(o => o.status === currentTab)
      });
    }
  },

  contactWorker(e) {
    const name = e.currentTarget.dataset.name;
    wx.showModal({
      title: '联系服务人员',
      content: `服务人员：${name}（已开启双向虚拟号保护）\n工作手机：18980779943`,
      confirmText: '呼叫',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({ phoneNumber: '18980779943' }).catch(() => {});
        }
      }
    });
  },

  viewOrderDetail(e) {
    const order = e.currentTarget.dataset.order;
    wx.showModal({
      title: `订单进度 · ${order.orderNo}`,
      content: `项目：${order.serviceName}\n状态：${order.status}\n时间：${order.scheduledAt}\n地址：${order.address}\n\n已开启平台担保与全程留痕存证。`,
      showCancel: false
    });
  },

  handleOrderAction(e) {
    const order = e.currentTarget.dataset.order;
    if (order.status === '待匹配' || order.status === '待接单') {
      wx.showToast({ title: '已提高派单优先级', icon: 'success' });
    } else if (order.status === '服务中') {
      wx.showModal({
        title: '平台三方沟通室',
        content: `订单号：${order.orderNo}\n参与人：雇主、${order.providerName || '服务人员'}、平台客服小禾\n\n如需加时或增减项目，双方在线确认后生效，严禁线下私自交易。`,
        showCancel: false
      });
    } else {
      wx.navigateTo({ url: '/pages/services/services' });
    }
  },

  goServices() {
    wx.navigateTo({ url: '/pages/services/services' });
  }
});
