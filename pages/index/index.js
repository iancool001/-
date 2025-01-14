import WordAnalyzer from '../../services/ai/word-analyzer'

Page({
  data: {
    word: '',
    loading: false,
    result: null
  },

  onLoad() {
    console.log('页面加载')
  },

  // 输入单词
  onInput(e) {
    this.setData({
      word: e.detail.value
    })
  },

  // 测试API调用
  async testAPI() {
    if (!this.data.word) {
      wx.showToast({
        title: '请输入单词',
        icon: 'none'
      })
      return
    }

    this.setData({ loading: true })

    try {
      const analyzer = new WordAnalyzer()
      const result = await analyzer.analyzeWord(this.data.word)
      
      console.log('API调用结果：', result)
      
      this.setData({
        result: JSON.stringify(result, null, 2),
        loading: false
      })

    } catch (error) {
      console.error('API调用失败：', error)
      wx.showToast({
        title: '调用失败，请查看控制台',
        icon: 'none'
      })
      this.setData({ loading: false })
    }
  }
}) 