import Mock from 'mockjs'
import plotMock from './plot'
import orderMock from './order'
import chatMock from './chat'
import taskMock from './task'
import fileMock from './file'

Mock.setup({
  timeout: '100-300'
})

plotMock()
orderMock()
chatMock()
taskMock()
fileMock()

export default Mock