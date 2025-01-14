import { initConfig } from './utils/config'

App({
  globalData: {
    userInfo: null,
    // 全局配置
    config: {
      aiApiTimeout: 3000, // AI响应超时时间
      animationDuration: 300 // 基础动画持续时间
    }
  },
  onLaunch() {
    // 初始化配置
    initConfig()

    // 初始化云开发
    if (wx.cloud) {
      wx.cloud.init({
        env: 'your-env-id',
        traceUser: true
      })
    }
  }
}) 