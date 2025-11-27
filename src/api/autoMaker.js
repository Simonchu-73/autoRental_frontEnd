import requestHttp from '@/utils/request'

export default {
  // 分页查询
  async search(start, size, data) {
    return await requestHttp.post(`/rental/autoMaker/${start}/${size}`, data)
  },
  // 获取全部数据
  async list() {
    return await requestHttp.get(`/rental/autoMaker`)
  },

  async delete(id) {
    return await requestHttp.delete(`/rental/autoMaker/${id}`)
  },
  async save(data) {
    return await requestHttp.post(`/rental/autoMaker`, data)
  },
  async update(data) {
    return await requestHttp.put(`/rental/autoMaker`, data)
  }

}
