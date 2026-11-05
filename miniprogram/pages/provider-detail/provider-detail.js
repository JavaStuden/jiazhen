const { request } = require('../../utils/request');

Page({
  data: { provider: null, followed: false, loadError: '' },

  onLoad(options) {
    const id = options && options.id;
    if (!id) return this.setData({ loadError: '缺少服务人员编号' });
    Promise.all([request(`/providers/${id}`), request('/auth/account')]).then(([provider, account]) => this.setData({
      provider, loadError: '', followed: (account.favorites || []).includes(Number(id))
    }))
      .catch(error => this.setData({ loadError: error.message || '服务人员资料加载失败' }));
  },

  async toggleFollow() {
    const ids = await request('/auth/account').then(account => account.favorites || []).catch(() => []);
    const id = Number(this.data.provider && this.data.provider.id);
    const favorites = this.data.followed ? ids.filter(item => Number(item) !== id) : [...ids, id];
    try {
      await request('/auth/account', { method: 'PUT', data: { favorites } });
      this.setData({ followed: !this.data.followed });
      wx.showToast({ title: this.data.followed ? '已关注' : '已取消关注', icon: 'success' });
    } catch (error) { wx.showToast({ title: error.message || '操作失败', icon: 'none' }); }
  },

  viewCertModal(e) {
    const provider = this.data.provider;
    if (!provider) return;
    wx.showModal({
      title: e.currentTarget.dataset.title,
      content: `健康证：${provider.healthCertValid ? '有效' : '未核验'}；技能证书有效期：${provider.skillCertValidUntil || '未提供'}。`,
      showCancel: false
    });
  },

  consultOnline() { wx.navigateTo({ url: '/pages/messages/messages?tab=chat' }); },
  bookProvider() { wx.navigateTo({ url: '/pages/services/services' }); }
});
