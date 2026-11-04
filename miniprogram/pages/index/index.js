const app = getApp();
const { request } = require('../../utils/request');

Page({
  data: {
    currentCity: '重庆 · 渝北',
    categories: [
      { name: '日常保洁', icon: '🧹', bg: '#fff2e8' },
      { name: '养老照护', icon: '👵', bg: '#eef8f2' },
      { name: '上门维修', icon: '🔧', bg: '#edf4fc' },
      { name: '陪医陪诊', icon: '🏥', bg: '#fbf0fa' },
      { name: '家电清洗', icon: '🫧', bg: '#eefaf7' },
      { name: '营养餐食', icon: '🍲', bg: '#fdf3ea' },
      { name: '社区养老', icon: '🏡', bg: '#f2f1fc' },
      { name: '全部服务', icon: '▦', bg: '#f5f6f8' }
    ],
    recommendList: [
      {
        id: 2,
        name: '3小时深度保洁',
        tags: ['≤80㎡', '客厅/卧/厨/卫', '平台标准', '可开发票'],
        price: 168
      },
      {
        id: 4,
        name: '居家养老照护·4小时',
        tags: ['4小时', '陪伴/用药/整理', '实名认证', '履约保障'],
        price: 220
      },
      {
        id: 5,
        name: '上门维修·水电检修',
        tags: ['排查漏水', '电路安全', '自带工具', '明码标价'],
        price: 220
      }
    ]
  },

  onLoad() {
    request('/services')
      .then((res) => {
        if (res && res.length) {
          // 如果后端有数据可动态融合
        }
      })
      .catch(() => {});
  },

  goToLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  },

  switchCity() {
    wx.showActionSheet({
      itemList: ['重庆 · 渝北区', '重庆 · 江北区', '成都 · 金牛区', '成都 · 武侯区'],
      success: (res) => {
        const cities = ['重庆 · 渝北', '重庆 · 江北', '成都 · 金牛', '成都 · 武侯'];
        this.setData({ currentCity: cities[res.tapIndex] });
      }
    });
  },

  goServices() {
    wx.navigateTo({
      url: '/pages/services/services'
    });
  },

  onCategoryClick(e) {
    const name = e.currentTarget.dataset.name;
    let targetCat = '家政保洁';
    if (name.includes('保洁') || name.includes('清洗')) targetCat = '家政保洁';
    else if (name.includes('养老') || name.includes('餐食')) targetCat = '养老护理';
    else if (name.includes('维修')) targetCat = '上门维修';
    else if (name.includes('陪诊')) targetCat = '陪医陪诊';

    wx.navigateTo({
      url: `/pages/services/services?category=${encodeURIComponent(targetCat)}`
    });
  },

  claimCoupon() {
    wx.showToast({
      title: '¥20优惠券已领取！',
      icon: 'success'
    });
  },

  goPackageDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/services/services?serviceId=${id}`
    });
  }
});
