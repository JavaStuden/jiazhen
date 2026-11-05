const { request } = require('../../utils/request');

const SECTION_TITLES = {
  coupons: '优惠券中心',
  addresses: '常用地址',
  'address-edit': '新增地址',
  wallet: '预算账户',
  invoices: '发票管理',
  'invoice-apply': '申请开票',
  favorites: '我的关注',
  enterprise: '企业认证',
  security: '账号与安全',
  partner: '城市合伙人',
  invite: '邀请好友',
  help: '帮助与客服'
};

Page({
  data: {
    section: 'coupons',
    fromOrder: false,
    // P16 优惠券中心
    couponTab: '可领取',
    coupons: [],
    // P20-21 常用地址与新增地址
    addresses: [],
    addrForm: {
      contact: '',
      phone: '',
      region: '',
      detail: '',
      doorplate: '',
      tag: '家',
      isDefault: true
    },
    // P22 预算账户
    walletBills: [],
    // P23-24 发票管理与申请开票
    invoiceTab: '待开票',
    invoiceOrders: [],
    selectedInvoiceAmount: '0.00',
    invoiceType: '电子普通发票',
    invoiceHeaderType: '企业单位',
    invoiceEmail: 'finance@taihehang.cn',
    // P28 我的关注
    favTab: '关注人员',
    favProviders: [],
    // P31 城市合伙人
    partnerRole: '雇主',
    partnerDirections: ['城市代理', '社区养老', '家政服务', '其他'],
    selectedPartnerDir: '城市代理',
    // P32 邀请好友
    inviteLink: 'taihehang.cn/i/TH8628',
    // P33 帮助与客服
    faqList: [
      '如何修改或取消订单？',
      '发布需求后多久有人接单？',
      '服务费用如何结算？',
      '如何申请退款与售后？',
      '履约保证金何时解冻？'
    ]
  },

  onLoad(options) {
    const sec = (options && options.section) || 'coupons';
    const fromOrder = Boolean(options && options.from === 'order');
    const role = (options && options.role) === 'worker' ? '服务人员' : '雇主';
    this.setData({
      fromOrder,
      partnerRole: role,
    });
    this.loadAccount();
    this.switchSection(sec);
  },

  loadAccount() {
    request('/auth/account').then(account => {
      const ids = (account.favorites || []).map(Number);
      this.setData({ addresses: account.addresses || [], favProviderIds: ids });
      return Promise.all(ids.map(id => request(`/providers/${id}`).catch(() => null)));
    }).then(providers => this.setData({ favProviders: providers.filter(Boolean) }))
      .catch(error => this.setData({ accountError: error.message || '账户数据加载失败' }));
  },

  persistAccount(patch) {
    return request('/auth/account', { method: 'PUT', data: patch });
  },

  switchSection(sec) {
    wx.setNavigationBarTitle({ title: SECTION_TITLES[sec] || '服务中心' });
    this.setData({ section: sec });
  },

  goSection(e) {
    this.switchSection(e.currentTarget.dataset.sec);
  },

  // P16 优惠券交互
  switchCouponTab(e) {
    this.setData({ couponTab: e.currentTarget.dataset.tab });
  },

  claimCouponItem(e) {
    const idx = e.currentTarget.dataset.index;
    wx.showToast({ title: '当前暂无可领取优惠券', icon: 'none' });
  },

  goSelectService() {
    wx.navigateTo({ url: '/pages/services/services' });
  },

  // P20-21 地址交互
  selectAddressForOrder(e) {
    const item = e.currentTarget.dataset.item;
    wx.setStorageSync('selected_order_address', item);
    if (this.data.fromOrder) {
      wx.navigateBack();
    } else {
      wx.showToast({ title: '已设为下单地址', icon: 'success' });
    }
  },

  setDefaultAddress(e) {
    const id = e.currentTarget.dataset.id;
    const list = this.data.addresses.map((a) => ({
      ...a,
      isDefault: a.id === id
    }));
    this.persistAccount({ addresses: list }).then(() => {
      this.setData({ addresses: list });
      wx.showToast({ title: '默认地址已更新', icon: 'success' });
    }).catch(error => wx.showToast({ title: error.message || '保存失败', icon: 'none' }));
  },

  deleteAddress(e) {
    const id = e.currentTarget.dataset.id;
    const list = this.data.addresses.filter((a) => a.id !== id);
    this.persistAccount({ addresses: list }).then(() => {
      this.setData({ addresses: list });
      wx.showToast({ title: '已删除地址', icon: 'success' });
    }).catch(error => wx.showToast({ title: error.message || '删除失败', icon: 'none' }));
  },

  onAddrInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`addrForm.${field}`]: e.detail.value });
  },

  selectAddrTag(e) {
    this.setData({ 'addrForm.tag': e.currentTarget.dataset.tag });
  },

  toggleAddrDefault() {
    this.setData({ 'addrForm.isDefault': !this.data.addrForm.isDefault });
  },

  async saveNewAddress() {
    const f = this.data.addrForm;
    const newItem = {
      id: Date.now(),
      title: f.detail.split(' ')[1] || f.detail,
      region: f.region,
      detail: f.detail,
      doorplate: f.doorplate,
      fullAddress: `${f.region.replace(/\s*\/\s*/g, '')}${f.detail} ${f.doorplate}`,
      contact: f.contact,
      phone: f.phone.replace(/\s+/g, '').replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
      rawPhone: f.phone.replace(/\s+/g, ''),
      tag: f.tag,
      isDefault: f.isDefault
    };
    let list = [...this.data.addresses];
    if (f.isDefault) {
      list = list.map((a) => ({ ...a, isDefault: false }));
    }
    list.unshift(newItem);
    try {
      await this.persistAccount({ addresses: list });
      this.setData({ addresses: list });
      wx.showToast({ title: '地址已保存', icon: 'success' });
      this.switchSection('addresses');
    } catch (error) { wx.showToast({ title: error.message || '保存失败', icon: 'none' }); }
  },

  // P22 预算账户充值
  rechargeWallet() {
    wx.showToast({ title: '预算账户支付通道尚未开通', icon: 'none' });
  },

  // P23-24 发票管理与开票
  toggleInvoiceOrder(e) {
    const idx = e.currentTarget.dataset.index;
    const list = [...this.data.invoiceOrders];
    list[idx].checked = !list[idx].checked;
    const sum = list.filter((x) => x.checked).reduce((acc, x) => acc + x.amount, 0);
    this.setData({
      invoiceOrders: list,
      selectedInvoiceAmount: sum.toFixed(2)
    });
  },

  selectInvoiceType(e) {
    this.setData({ invoiceType: e.currentTarget.dataset.type });
  },

  selectInvoiceHeaderType(e) {
    this.setData({ invoiceHeaderType: e.currentTarget.dataset.type });
  },

  submitInvoiceApply() { wx.showToast({ title: '暂无可开票订单', icon: 'none' }); },

  // P28 我的关注
  goProviderDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/provider-detail/provider-detail?id=${id}` });
  },

  // P29 企业认证
  submitEnterpriseCert() { wx.showToast({ title: '企业认证接口尚未开通，未提交', icon: 'none' }); },

  // P31 城市合伙人
  selectPartnerDir(e) {
    this.setData({ selectedPartnerDir: e.currentTarget.dataset.dir });
  },

  submitPartnerApply() {
    wx.showToast({ title: '合作申请接口尚未开通，未提交', icon: 'none' });
  },

  // P32 邀请好友
  copyInviteLink() {
    wx.setClipboardData({
      data: `https://${this.data.inviteLink}`,
      success: () => {
        wx.showToast({ title: '邀请链接已复制', icon: 'success' });
      }
    });
  },

  // P33 客服与帮助
  callHotLine() { wx.showToast({ title: '平台客服电话尚未配置', icon: 'none' }); },

  openOnlineChat() {
    wx.showToast({ title: '请从具体订单进入沟通', icon: 'none' });
  },

  goAfterSalesPage(e) {
    const mode = e.currentTarget.dataset.mode;
    wx.navigateTo({ url: `/pages/after-sales/after-sales?mode=${mode}` });
  },

  showFaqAnswer(e) {
    const q = e.currentTarget.dataset.q;
    wx.showModal({
      title: q,
      content: '平台提供全流程担保：接单前可免费修改或取消；服务完成后经雇主确认再进入结算；如遇异常可随时发起三方沟通或售后介入。',
      showCancel: false,
      confirmColor: '#ff6a00'
    });
  }
});
