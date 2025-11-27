import requestHttp from '@/utils/request'

export default {
  async list(){
    return await requestHttp.get(`/rental/role`)
  },
  async getRoleList(start,size,data){
    return await requestHttp.post(`/rental/role/${start}/${size}`,data)
  } ,
  async save(data){
    return await requestHttp.post(`/rental/role`,data)
  },
  async update(data){
    return await requestHttp.put(`/rental/role`,data)
  },
  async delete(ids){
    return await requestHttp.delete(`/rental/role/${ids}`)
  },
  async hasUser(roleId){
    return await requestHttp.get(`/rental/role/hasUser/${roleId}`)
  },
  async selectPermissionTree(params){
    return await requestHttp.get(`/rental/role/permissionTree`,params)
  },
  async assignPermission(roleId,permissionIds){
    return await requestHttp.get(`/rental/role/assignPermission/${roleId}/${permissionIds}`)
  }
}
