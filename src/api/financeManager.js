import requestHttp from '@/utils/request'
export default {
  async getDayRentalData(){
    return await requestHttp.get(`/rental/finance/countDayRental`)
  },
  async getDayReturnData(){
    return await requestHttp.get(`/rental/finance/countDayReturn`)
  },
  async gatDayAmount(){
    return await requestHttp.get(`/rental/finance/countDayAmount`)
  },
  async getMonthRentalData(){
    return await requestHttp.get(`/rental/finance/countMonthRental`)
  },
  async getMonthReturnData(){
    return await requestHttp.get(`/rental/finance/countMonthReturn`)
  },
  async getMonthAmount(){
    return await requestHttp.get(`/rental/finance/countMonthAmount`)
  },
}
