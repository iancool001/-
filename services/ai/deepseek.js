import { AI_CONFIG, SYSTEM_PROMPT } from './config'

class DeepseekService {
  constructor() {
    this.retryCount = 0
    this.apiKey = getApp().globalData.config.deepseekApiKey
  }

  // 计算重试延迟时间
  calculateDelay() {
    const delay = Math.min(
      AI_CONFIG.BASE_DELAY * Math.pow(2, this.retryCount),
      AI_CONFIG.MAX_DELAY
    )
    return delay
  }

  // 检查网络状态
  async checkNetwork() {
    return new Promise((resolve) => {
      wx.getNetworkType({
        success: (res) => {
          if (res.networkType === 'none') {
            throw new Error('无网络连接')
          }
          resolve(true)
        },
        fail: () => {
          throw new Error('网络状态检查失败')
        }
      })
    })
  }

  // 发送API请求
  async sendRequest(messages, isStream = false) {
    await this.checkNetwork()
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    }

    const body = {
      model: AI_CONFIG.MODEL,
      messages,
      stream: isStream,
      response_format: {
        type: 'json_object'
      }
    }

    try {
      // 在请求发送前打印
      console.log('Sending request:', {
        url: AI_CONFIG.API_URL,
        headers,
        body
      })

      // 使用 Promise 包装 wx.request
      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: AI_CONFIG.API_URL,
          method: 'POST',
          header: headers,
          data: body,
          timeout: AI_CONFIG.TIMEOUT,
          success: resolve,
          fail: reject
        })
      })

      // 在收到响应后打印
      console.log('Response received:', response)

      // 添加更详细的错误处理
      if (!response.statusCode) {
        throw new Error('网络请求失败')
      }

      if (response.statusCode !== 200) {
        throw new Error(`API请求失败: ${response.statusCode} - ${response.data?.error?.message || '未知错误'}`)
      }

      return response.data
    } catch (error) {
      console.error('Request failed:', error)
      
      // 恢复重试逻辑
      if (this.retryCount < AI_CONFIG.MAX_RETRIES) {
        this.retryCount++
        const delay = this.calculateDelay()
        console.log(`Retrying request (${this.retryCount}/${AI_CONFIG.MAX_RETRIES}) after ${delay}ms`)
        await new Promise(resolve => setTimeout(resolve, delay))
        return this.sendRequest(messages, isStream)
      }
      
      throw error
    }
  }

  // 分析单词生成场景
  async analyzeWord(word) {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: word }
    ]

    try {
      const response = await this.sendRequest(messages)
      return response.choices[0].message.content
    } catch (error) {
      console.error('Failed to analyze word:', error)
      if (error.errMsg?.includes('timeout')) {
        throw new Error('请求超时，请检查网络连接')
      } else if (error.errMsg?.includes('fail')) {
        throw new Error('网络请求失败，请稍后重试')
      }
      throw new Error('单词分析失败，请稍后重试')
    } finally {
      this.retryCount = 0
    }
  }
}

export const deepseekService = new DeepseekService() 