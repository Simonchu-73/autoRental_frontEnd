import requestHttp from '@/utils/request'

export default {
  async search(start, size, data) {
    return await requestHttp.post(`/rental/autoBrand/${start}/${size}`, data)
  },
  // 获取全部数据
  async list() {
    return await requestHttp.get(`/rental/autoBrand`)
  },
  async delete(id) {
    return await requestHttp.delete(`/rental/autoBrand/${id}`)
  },
  async save(data) {
    return await requestHttp.post(`/rental/autoBrand`, data)
  },
  async update(data) {
    return await requestHttp.put(`/rental/autoBrand`, data)
  },
  async selectBrandByMakerId(mid) {
    return await requestHttp.get(`/rental/autoBrand/${mid}`)
  },

}
