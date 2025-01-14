import deepseek from './deepseek'

class WordAnalyzer {
  // 分析单词
  async analyzeWord(word) {
    try {
      // 构造消息格式符合 Deepseek API 要求
      const messages = [
        {
          role: "system",
          content: `你是一个专门分析英语单词的助手。请分析单词"${word}"，并返回一个适合动画场景展示的描述。
                   描述应包含：场景类型、场景元素、可能的交互方式。`
        },
        {
          role: "user",
          content: word
        }
      ]
      
      const result = await deepseek.request(messages)
      return this.processAnalysisResult(result, word)
    } catch (error) {
      console.error('单词分析失败', error)
      throw error
    }
  }

  // 处理分析结果
  processAnalysisResult(result, word) {
    try {
      // 尝试解析AI返回的场景描述
      const sceneDescription = JSON.parse(result.content)
      return {
        word,
        scene: {
          type: sceneDescription.type || 'basic',
          elements: this.processElements(sceneDescription.elements || []),
          interactions: this.processInteractions(sceneDescription.interactions || [])
        }
      }
    } catch (error) {
      // 如果解析失败，返回基础场景
      console.error('场景描述解析失败', error)
      return {
        word,
        scene: {
          type: 'basic',
          elements: [{
            id: 'text',
            type: 'text',
            properties: {
              content: word,
              position: { x: 0, y: 0 },
              style: { fontSize: '24px' }
            }
          }],
          interactions: []
        }
      }
    }
  }

  // 处理场景元素
  processElements(elements = []) {
    return elements.map(element => ({
      id: element.id,
      type: element.type,
      properties: {
        position: element.position,
        size: element.size,
        style: element.style
      }
    }))
  }

  // 处理交互定义
  processInteractions(interactions = []) {
    return interactions.map(interaction => ({
      type: interaction.type, // click, drag, select
      target: interaction.targetId,
      action: interaction.action,
      feedback: interaction.feedback
    }))
  }
}

export default new WordAnalyzer() 