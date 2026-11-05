const app = getApp();

function request(path, options = {}) {
  const token = app.globalData.accessToken || wx.getStorageSync('accessToken');
  return new Promise((resolve, reject) => wx.request({
    url: app.globalData.apiBaseUrl + path,
    ...options,
    header: {
      'content-type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.header || {})
    },
    success: (response) => {
      if (response.statusCode >= 200 && response.statusCode < 300) resolve(response.data);
      else reject(Object.assign(new Error(response.data && response.data.message || `请求失败 (${response.statusCode})`), { statusCode: response.statusCode }));
    },
    fail: reject
  }));
}

module.exports = { request };
