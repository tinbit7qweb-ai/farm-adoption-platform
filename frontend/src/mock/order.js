import Mock from 'mockjs'
const orderData = [
  { orderId: 'OD2026060101', userName: '张先生', plotNum: 'P001', cycle: '6个月', expireTime: '2026-12-01', status: '进行中', logisticsNo: '' },
  { orderId: 'OD2026060202', userName: '李女士', plotNum: 'P003', cycle: '3个月', expireTime: '2026-09-02', status: '即将到期', logisticsNo: '' }
]

export default function () {
  // 获取订单列表
  Mock.get('/mock/api/order/list', () => {
    return { code: 200, msg: 'success', data: orderData }
  })
  // 录入物流单号
  Mock.post('/mock/api/order/logistics', (req) => {
    const body = JSON.parse(req.body)
    const target = orderData.find(item => item.orderId === body.orderId)
    if(target) target.logisticsNo = body.logisticsNo
    return { code: 200, msg: '物流单号录入成功' }
  })
}