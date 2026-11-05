const { fetchServices } = require('../../utils/store');

Page({
  data: {
    currentCity: '重庆 · 渝北',
    unreadCount: 0,
    categories: [
      { name: '日常保洁', img: '/images/cat_1.png' },
      { name: '养老照护', img: '/images/cat_2.png' },
      { name: '上门维修', img: '/images/cat_3.png' },
      { name: '陪医陪诊', img: '/images/cat_4.png' },
      { name: '家电清洗', img: '/images/cat_5.png' },
      { name: '营养餐食', img: '/images/cat_6.png' },
      { name: '社区养老', img: '/images/cat_7.png' },
      { name: '全部服务', img: '/images/cat_8.png' }
    ],
    recommendList: []
  },

  onShow() {
    this.syncBackendServices();
  },

  syncBackendServices() {
    fetchServices().then((pkgs) => {
      if (Array.isArray(pkgs) && pkgs.length > 0) {
        const featured = pkgs.slice(0, 4).map((p, index) => ({
          id: p.id,
          name: p.name,
          subtitle: `${p.area || '标准规格'} · ${p.typeTag || p.duration || '平台标准'}`,
          tags: (p.tags && p.tags.length >= 2) ? p.tags.slice(-2) : ['平台标准', '履约保障'],
          price: p.price,
          thumb: p.category === '养老护理' ? '/images/thumb_care.jpg' : (p.category === '上门维修' ? '/images/ord_repair.png' : (index === 0 ? '/images/ord_clean.png' : '/images/package_thumb.jpg'))
        }));
        this.setData({ recommendList: featured });
      }
    }).catch((error) => wx.showToast({ title: error.message || '服务暂不可用', icon: 'none' }));
  },

  goToLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  },

  switchCity() {
    wx.showActionSheet({
      itemList: ['重庆 · 渝北', '重庆 · 江北', '成都 · 金牛', '成都 · 武侯'],
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

  goMessages() {
    wx.navigateTo({
      url: '/pages/messages/messages'
    });
  },

  goCoupons() {
    wx.navigateTo({
      url: '/pages/user-center/user-center?section=coupons'
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
    wx.showToast({ title: '新人优惠券活动暂未配置', icon: 'none' });
  },

  goPackageDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/services/services?serviceId=${id}`
    });
  }
});
