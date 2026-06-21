import Mock from 'mockjs'

export default function () {
  // 获取地块列表
  Mock.get('/mock/api/plot/list', () => {
    return {
      code: 200,
      msg: 'success',
      data: [
        { plotId: 1, plotNum: 'P001', area: 120, soilType: '黑土', sunlightHours: 8, status: 1 },
        { plotId: 2, plotNum: 'P002', area: 80, soilType: '褐土', sunlightHours: 7, status: 0 },
        { plotId: 3, plotNum: 'P003', area: 150, soilType: '红土', sunlightHours: 9, status: 1 }
      ]
    }
  })

  // 新增地块
  Mock.post('/mock/api/plot/add', (req) => {
    const body = JSON.parse(req.body)
    if (!body.plotNum || !body.area) {
      return { code: 400, msg: '地块编号、面积不能为空' }
    }
    return {
      code: 200,
      msg: '地块创建成功',
      data: { plotId: Mock.Random.increment() }
    }
  })
}