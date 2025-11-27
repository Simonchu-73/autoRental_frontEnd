<template>
  <div>
    <el-main>
      <el-form
        :model="orderModel"
        size="mini"
        label-width="100px"
        :inline="true"
      >
        <el-form-item label="订单编号">
          <el-input v-model.trim="orderModel.orderNum" placeholder="请输入订单编号"></el-input>
        </el-form-item>
        <el-form-item label="车牌号码">
          <el-input v-model.trim="orderModel.autoNum" placeholder="请输入车牌号码"></el-input>
        </el-form-item>
        <el-form-item label="客户姓名">
          <el-input v-model="orderModel.customerName" placeholder="请输入客户姓名"></el-input>
        </el-form-item>
        <el-form-item label="客户电话">
          <el-input v-model.trim="orderModel.customerTel" placeholder="请输入客户电话"></el-input>
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="orderModel.orderStatus">
            <el-option label="全部" value=""></el-option>
            <el-option label="车辆还未归还" value="0"></el-option>
            <el-option label="押金还未返还" value="1"></el-option>
            <el-option label="已完成" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button type="warning" @click="resetForm">重置</el-button>
        <el-button type="primary" @click="exportExcel">导出全部订单数据</el-button>
      </el-form>
      <el-divider></el-divider>
      <!--数据表单-->
      <el-table
        :data="tableData"
        stripe
        border
        style="width: 100%"
        size="mini"
      >
        <el-table-column type="index" label="序号" width="50"></el-table-column>
        <el-table-column label="订单编号" prop="orderNum"></el-table-column>
        <el-table-column label="车牌号码" prop="autoNum"></el-table-column>
        <el-table-column label="客户姓名" prop="customerName"></el-table-column>
        <el-table-column label="客户电话" prop="customerTel"></el-table-column>
        <el-table-column label="出租时间" prop="rentalTime"></el-table-column>
        <el-table-column label="出租类型" prop="typeName"></el-table-column>
        <el-table-column label="享受折扣" prop="typeDiscount"></el-table-column>
        "
        <el-table-column label="押金" prop="deposit"></el-table-column>
        <el-table-column label="订单状态" prop="orderStatus">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.orderStatus == 0" type="danger">车辆还未归还</el-tag>
            <el-tag v-if="scope.row.orderStatus == 1" type="warning">押金还未返还</el-tag>
            <el-tag v-if="scope.row.orderStatus == 2" type="success">已完成</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button type="success" @click="getDetailInfo(scope.row)" icon="el-icon-search" size="mini">详情
            </el-button>
            <el-button type="warning" v-if="scope.row.orderStatus == 1 " @click="checkConditions(scope.row)"
                       size="mini"
            >归还押金
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <el-pagination
        :current-page="start"
        :page-size="size"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="search"
        background
      ></el-pagination>
      <!-- 展示订单详细信息抽屉-->
      <el-drawer
        title="订单详情"
        :visible.sync="drawer"
        :direction="direction"
      >
        <div class="infoItem">
          订单编号:<span>{{ orderInfo.orderNum }}</span>
        </div>
        <div class="infoItem">
          车牌号码:<span>{{ orderInfo.autoNum }}</span>
        </div>
        <div class="infoItem">
          客户姓名:<span>{{ orderInfo.customerName }}</span>
        </div>
        <div class="infoItem">
          客户电话:<span>{{ orderInfo.customerTel }}</span>
        </div>
        <div class="infoItem">
          出租时间:<span>{{ orderInfo.rentalTime }}</span>
        </div>
        <div class="infoItem">
          出租类型:<span>{{ orderInfo.typeName }}</span>
        </div>
        <div class="infoItem">
          享受折扣:<span>{{ orderInfo.typeDiscount }}</span>
        </div>
        <div class="infoItem">
          日租金额:<span>{{ orderInfo.rent }}</span>
        </div>
        <div class="infoItem">
          车辆押金:<span>{{ orderInfo.deposit }}</span>
        </div>
        <div class="infoItem">
          起租里程:<span>{{ orderInfo.mileage }}</span>
        </div>
        <div class="infoItem">
          归还时间:<span>{{ orderInfo.returnTime }}</span>
        </div>
        <div class="infoItem">
          归还里程:<span>{{ orderInfo.returnMileage }}</span>
        </div>
        <div class="infoItem">
          应付金额:<span>{{ orderInfo.rentPayable }}</span>
        </div>
        <div class="infoItem">
          实付金额:<span>{{ orderInfo.rentActual }}</span>
        </div>
        <div>
          <el-button type="primary" icon="el-icon-close"
                     @click="drawer = false"
                     style="margin: 10px;"
          >
            关闭
          </el-button>
        </div>

      </el-drawer>
    </el-main>
  </div>
</template>
<script>
import orderApi from '@/api/orderApi'
import { getToken } from '@/utils/auth'

export default {
  data() {
    return {
      orderModel: {
        orderStatus: ''
      },
      orderInfo: {},
      tableData: [],
      start: 1,
      size: 5,
      total: 0,
      drawer: false,
      direction: 'rtl'
    }
  },
  created() {
    this.search()
  },
  methods: {
    async search(start = 1) {
      this.start = start
      let res = await orderApi.searchOrders(this.start, this.size, this.orderModel)
      if (res.success) {
        this.tableData = res.data.records
        this.total = res.data.total
      }
    },
    handleSearch() {
      this.search()
    },
    resetForm() {
      this.orderModel = {
        orderStatus: ''
      }
      this.search()

    },
    async getDetailInfo(row) {
      this.orderInfo = Object.assign({}, row)
      this.drawer = true
    },
    async checkConditions(row) {
      let autoId = row.autoId
      let res = await orderApi.checkViolation(autoId)
      try {
        if (res.success) {
          let count = res.data
          if (count > 0) {
            //说明有租车订单所涉及的车辆有违章记录
            const h = this.$createElement
            this.$notify({
              title: '无法退还',
              message: h('i', { style: 'color: red' }, '该订单涉及车辆\n' +
                '有未处理违章记录,请前往违章管理处理')
              ,
              duration: 3000
            })
          } else {
            let resDeposit = await orderApi.returnDeposit(row.id)
            if (resDeposit.success) {
              this.$message({
                message: '押金已退回,详情请查看订单列表',
                type: 'success'
              })
              this.search()
            }

          }
        }
      } catch (e) {
        console.log(e)
      }
    },
    exportExcel() {
      let url = `${process.env.VUE_APP_BASE_API}rental/order/exportExcel?token=${getToken()}`
      window.open(url)
    }
  }
}

</script>
<style>
.infoItem {
  padding-left: 20px;
  line-height: 40px;
  color: #777;
  border-bottom: 1px dotted #cdcdcd;
}

.infoItem span {
  margin-left: 15px;
  color: tomato
}

</style>

