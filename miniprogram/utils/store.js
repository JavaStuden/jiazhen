const { request } = require('./request');

function normalizeBackendService(item) {
  return {
    ...item,
    duration: item.durationLabel || `${item.durationHours || ''}小时`,
    serviceSections: Array.isArray(item.serviceSections) ? item.serviceSections : [],
    includedItems: Array.isArray(item.includedItems) ? item.includedItems : [],
    tags: Array.isArray(item.tags) ? item.tags : []
  };
}

function fetchServices() {
  return request('/services').then(list => {
    if (!Array.isArray(list)) throw new Error('服务数据格式错误');
    const normalized = list.map(normalizeBackendService);
    wx.setStorageSync('cached_packages', normalized);
    return normalized;
  });
}

function getLocalPackages() { return wx.getStorageSync('cached_packages') || []; }

function getAddresses() {
  const saved = wx.getStorageSync('user_addresses');
  return Array.isArray(saved) ? saved : [];
}

function getOrders() {
  return request('/orders').then(list => {
    if (!Array.isArray(list)) throw new Error('订单数据格式错误');
    return list;
  });
}

module.exports = { fetchServices, getLocalPackages, getAddresses, getOrders };
