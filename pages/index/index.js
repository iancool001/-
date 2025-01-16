import { deepseekService } from '../../services/ai/deepseek'

Page({
  data: {
    word: '',
    loading: false,
    testResult: ''
  },

  // 输入单词
  onInput(e) {
    this.setData({
      word: e.detail.value
    })
  },

  // 提交学习
  async onSubmit() {
    if (!this.data.word) {
      wx.showToast({
        title: '请输入单词',
        icon: 'none'
      })
      return
    }

    this.setData({ loading: true })

    try {
      // 调用AI服务
      const result = await this.analyzeWord(this.data.word)
      
      // 跳转到学习页
      wx.navigateTo({
        url: `/pages/learning/learning?scene=${JSON.stringify(result)}`
      })
    } catch (err) {
      wx.showToast({
        title: '分析失败，请重试',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 调用AI分析服务
  async analyzeWord(word) {
    try {
      const sceneData = await deepseekService.analyzeWord(word)
      return JSON.parse(sceneData)
    } catch (error) {
      console.error('AI analysis failed:', error)
      throw error
    }
  },

  // 添加测试函数
  async testAIService() {
    this.setData({ 
      loading: true,
      testResult: '测试中...'
    })

    try {
      // 测试简单单词
      const testWord = 'run'
      const result = await deepseekService.analyzeWord(testWord)
      
      this.setData({
        testResult: JSON.stringify(result, null, 2)
      })
      
      console.log('API测试成功:', result)
      
      wx.showToast({
        title: 'API测试成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('API测试失败:', error)
      
      this.setData({
        testResult: `测试失败: ${error.message}`
      })
      
      wx.showToast({
        title: '测试失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  }
}) 