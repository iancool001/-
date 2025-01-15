Page({
  data: {
    word: '',
    loading: false
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
  analyzeWord(word) {
    // TODO: 实现AI服务调用
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          word,
          scene: {
            type: 'basic',
            elements: [],
            interactions: []
          }
        })
      }, 1000)
    })
  }
}) 