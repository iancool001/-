// Deepseek API 配置和基础封装
const config = {
  baseURL: 'https://api.deepseek.com',
  timeout: 3000,
  maxRetries: 2,
  model: 'deepseek-chat' // 使用最新的 DeepSeek-V3 模型
}

class DeepseekService {
  constructor() {
    this.retryCount = 0
  }

  // 基础请求方法
  async request(messages) {
    try {
      const response = await wx.request({
        url: `${config.baseURL}/chat/completions`, // 修正为正确的 endpoint
        data: {
          model: config.model,
          messages,
          stream: false // MVP阶段先不使用流式输出
        },
        timeout: config.timeout,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wx.getStorageSync('DEEPSEEK_API_KEY')}` // 从存储中获取
        }
      })
      
      return this.handleResponse(response)
    } catch (error) {
      return this.handleError(error, messages)
    }
  }

  // 响应处理
  handleResponse(response) {
    if (response.statusCode === 200) {
      this.retryCount = 0
      return response.data.choices[0].message.content // 按照官方文档格式解析响应
    }
    throw new Error(`API请求失败: ${response.statusCode}`)
  }

  // 错误处理
  async handleError(error, messages) {
    if (this.retryCount < config.maxRetries) {
      this.retryCount++
      console.log(`重试第${this.retryCount}次`)
      return await this.request(messages)
    }
    return this.fallback(error)
  }

  // 降级处理
  fallback(error) {
    console.error('API调用失败，启用降级策略', error)
    return {
      content: '暂时无法分析单词，请稍后重试'
    }
  }
}

export default new DeepseekService() 