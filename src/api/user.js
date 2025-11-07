import requestHttp from '@/utils/request'

export async function login(data) {
  return await requestHttp.login('/rental/user/login', data)
}
export async function getInfo() {
  return await requestHttp.get('/rental/auth/info')
}

export async function logout(params) {
  return await requestHttp.post('/rental/auth/logout',params)
}

export async function getMenuList() {
  return await requestHttp.get('/rental/auth/menuList')
}