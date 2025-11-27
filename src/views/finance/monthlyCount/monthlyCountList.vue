<template>
  <div>
    <el-card :style="{ width: '90%'}">
      <div>
        当月应收金额：
        <el-tag type="success">
          {{ payableRent }}
        </el-tag>
        当月实收金额：
        <el-tag type="warning">
          {{ actualRent }}
        </el-tag>
        当月押金金额：
        <el-tag type="danger">
          {{ deposit }}
        </el-tag>
        当月归还押金金额：
        <el-tag type="primary">
          {{ returnDeposit }}
        </el-tag>
      </div>
    </el-card>
    <el-card>
      <div ref="rentalChart" :style="{ width: '90%', height: '400px'}">
      </div>
    </el-card>
    <el-card>
      <div ref="returnChart" :style="{ width: '90%', height: '400px'}">
      </div>
    </el-card>
  </div>
</template>
<script>
import * as echarts from 'echarts'
import financeApi from '@/api/financeManager'

export default {
  data() {
    return {
      rentalChart: null,
      rentalDays: [],
      rentalCount: [],
      returnChart: null,
      returnCount: [],
      returnDays: [],
      payableRent: 0,
      actualRent: 0,
      deposit: 0,
      returnDeposit: 0
    }
  },
  created() {
    this.getData()
    this.getMonthAmount()
  },

  mounted() {
    this.initRentalChart()
    this.initReturnChart()
  },
  methods: {
    async getMonthAmount() {
      let res = await financeApi.getMonthAmount()
      if (res.success && res.data != null) {
        this.payableRent = res.data.payableRent
        this.actualRent = res.data.actualRent
        this.deposit = res.data.deposit
        this.returnDeposit = res.data.returnDeposit
      }
    },
    async getData() {
      let res = await financeApi.getMonthRentalData()
      if (res.success && res.data != null) {
        this.rentalDays = res.data[0]
        this.rentalCount = res.data[1]
        this.updateRentalChart()
      }
      let resReturn = await financeApi.getMonthReturnData()
      if (resReturn.success && resReturn.data != null) {
        this.returnDays = resReturn.data[0]
        this.returnCount = resReturn.data[1]
        this.updateReturnChart()
      }

    },
    updateRentalChart() {
      this.rentalChart.setOption({
        xAxis: {
          data: this.rentalDays
        },
        series: [
          {
            data: this.rentalCount
          }
        ]
      })
    },
    initRentalChart() {
      this.rentalChart = echarts.init(this.$refs.rentalChart)
      this.rentalChart.setOption({
        title: {
          text: '当月出租车辆数据统计',
          subtext: new Date().toLocaleDateString()
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['出租数量']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        toolbox: {
          show: true,
          orient: 'vertical',
          left: 'right',
          top: 'center',
          feature: {
            mark: { show: true },
            dataView: { readonly: false, show: true },
            saveAsImage: { show: true },
            magicType: {
              show: true,
              type: ['line', 'bar']
            },
            restore: { show: true }

          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          axisTick: {
            show: false
          },
          data: this.rentalDays
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '出租数量',
            type: 'line',
            emphasis: {
              focus: 'series'
            },
            data: this.rentalCount
          }

        ]
      })
    },
    updateReturnChart() {
      this.returnChart.setOption({
        xAxis: {
          data: this.returnDays
        },
        series: [
          {
            data: this.returnCount
          }
        ]
      })
    },
    initReturnChart() {
      this.returnChart = echarts.init(this.$refs.returnChart)
      this.returnChart.setOption({
        title: {
          text: '当月归还车辆数据统计',
          subtext: new Date().getMonth()+1+'月'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['还车数量']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        toolbox: {
          show: true,
          orient: 'vertical',
          left: 'right',
          top: 'center',
          feature: {
            mark: { show: true },
            dataView: { readonly: false, show: true },
            saveAsImage: { show: true },
            magicType: {
              show: true,
              type: ['line', 'bar']
            },
            restore: { show: true }

          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          axisTick: {
            show: false
          },
          data: this.returnDays
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: `还车数量`,
            type: 'line',
            emphasis: {
              focus: 'series'
            },
            data: this.returnCount
          }

        ]
      })
    }
  }

}

</script>
<style>

</style>



