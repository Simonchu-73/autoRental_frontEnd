import requestHttp from '@/utils/request'

export default {
  // 分页查询
  async search(start, size, data) {
    return await requestHttp.post(`/rental/maintain/${start}/${size}`, data)
  },
  async save(data) {
    return await requestHttp.post(`/rental/maintain`, data)
  },
  async delete(ids) {
    return await requestHttp.delete(`/rental/maintain/${ids}`)
  },
  async update(data) {
    return await requestHttp.put(`/rental/maintain`, data)
  }
}
