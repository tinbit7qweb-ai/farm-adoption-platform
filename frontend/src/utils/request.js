import axios from 'axios'

const baseURL = '/mock/api'

const service = axios.create({
  baseURL,
  timeout: 6000
})

// 请求拦截器 自动携带token
service.interceptors.request.use(config => {
  const token = localStorage.getItem('farmToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器 统一捕获报错
service.interceptors.response.use(
  res => res.data,
  err => {
    console.error('接口请求错误：', err)
    alert('接口异常：' + err.message)
    return Promise.reject(err)
  }
)

export default service