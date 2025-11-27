import requestHttp from '@/utils/request'

export default {
  async selectTree(){
    return await requestHttp.get('/rental/permission/tree')
  },
  async search(params) {
    return await requestHttp.get('/rental/permission')
  },
  async save(params) {
    return await requestHttp.post('/rental/permission', params)
  },
  async update(params) {
    return await requestHttp.put('/rental/permission', params)
  },
  async delete(params) {
    return await requestHttp.delete(`/rental/permission/${params}`)
  },
  async hasChildren(params){
    return await requestHttp.get(`/rental/permission/hasChildren/${params}`)
  }
}
