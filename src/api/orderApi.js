import requestHttp from '@/utils/request'
export default {
  async createOrder(data){
    return await requestHttp.post('/rental/order',data)
  },
  async searchUnfinishedOrder(start, size, data){
    return await requestHttp.post(`/rental/order/unfinished/${start}/${size}`,data)
  },
  async returnAuto( data){
    return await requestHttp.put(`/rental/order`, data)
  },
  async searchOrders(start, size, data){
    return await requestHttp.post(`/rental/order/${start}/${size}`,data)
  },
  async checkViolation(autoId){
    return await requestHttp.get(`/rental/order/check/${autoId}`)
  },
  async returnDeposit(orderId){
    return await requestHttp.get(`/rental/order/returnDeposit/${orderId}`)
  },
}
