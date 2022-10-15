const axios = require('axios')

// 配置信息

const requestConfig = {
  timeout: 30000,
};

const request = axios.create(requestConfig);

// 请求拦截
request.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// 响应拦截
request.interceptors.response.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const get = (
  url,
  params,
  config
) => {
  return request({
    url: url,
    method: 'GET',
    params: params,
    ...config,
  });
};


module.exports = {
  get
}