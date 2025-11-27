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
          <el-input v-model="orderModel.orderNum"
                    placeholder="请输入订单编号"
          ></el-input>
        </el-form-item>
        <el-form-item label="车牌号码">
          <el-input v-model="orderModel.autoNum"
                    placeholder="请输入车牌号码"
          ></el-input>
        </el-form-item>
        <el-form-item label="客户姓名">
          <el-input v-model="orderModel.customerName"
                    placeholder="请输入客户姓名"
          ></el-input>
        </el-form-item>
        <el-form-item label="客户电话">
          <el-input v-model="orderModel.customerTel"
                    placeholder="请输入客户电话"
          ></el-input>
        </el-form-item>
        <!--操作-->
        <el-form-item size="medium">
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button type="warning" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
      <el-divider></el-divider>
      <!--数据表格-->
      <el-table :data="tableData" border stripe>
        <el-table-column label="序号" width="50">
          <template slot-scope="scope">
            {{ (start - 1) * size + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="订单编号" prop="orderNum"></el-table-column>
        <el-table-column label="车牌号" prop="autoNum"></el-table-column>
        <el-table-column label="客户姓名" prop="customerName"></el-table-column>
        <el-table-column label="客户手机" prop="customerTel"></el-table-column>
        <el-table-column label="出租时间" prop="rentalTime"></el-table-column>
        <el-table-column label="出租类型" prop="typeName"></el-table-column>
        <el-table-column label="享受折扣" prop="typeDiscount"></el-table-column>
        <el-table-column label="日租金额" prop="rent"></el-table-column>
        <el-table-column label="车辆押金" prop="deposit"></el-table-column>
        <el-table-column label="行驶里程" prop="mileage"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="handleReturn(scope.row)">归还</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <el-pagination
        background
        @size-change="search"
        :current-page="start"
        :page-size="size"
        layout="total, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
      <!--归还对话框-->
      <el-dialog title="归还" :visible.sync="returnDialogVisible">
        <el-form ref="returnForm" :model="returnOrder" label-width="80px" :rules="rules">
          <el-form-item label="订单编号">
            <el-input v-model="returnOrder.orderNum" readonly></el-input>
          </el-form-item>
          <el-form-item label="车牌号码">
            <el-input v-model="returnOrder.autoNum" readonly></el-input>
          </el-form-item>
          <el-form-item label="客户名称">
            <el-input v-model="returnOrder.customerName" readonly></el-input>
          </el-form-item>
          <el-form-item label="客户电话">
            <el-input v-model="returnOrder.customerTel" readonly></el-input>
          </el-form-item>
          <el-form-item label="起租里程">
            <el-input v-model="returnOrder.mileage" readonly></el-input>
          </el-form-item>
          <el-form-item label="起租时间">
            <el-input v-model="returnOrder.rentalTime" readonly></el-input>
          </el-form-item>
          <el-form-item label="出租类型">
            <el-input v-model="returnOrder.typeName" readonly></el-input>
          </el-form-item>
          <el-form-item label="享受折扣">
            <el-input v-model="returnOrder.typeDiscount" readonly></el-input>
          </el-form-item>
          <el-form-item label="日租金额">
            <el-input v-model="returnOrder.rent" readonly></el-input>
          </el-form-item>
          <el-form-item label="车辆押金">
            <el-input v-model="returnOrder.deposit" readonly></el-input>
          </el-form-item>
          <el-form-item label="归还里程" prop="returnMileage">
            <el-input-number :min="0" v-model="returnOrder.returnMileage" @change="checkReturnMileage"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="归还时间" prop="returnTime">
            <el-date-picker
              v-model="returnOrder.returnTime"
              type="datetime"
              placeholder="选择日期时间"
              value-format="yyyy-MM-dd HH:mm:ss"
              @change="handleChange"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="应付金额">
            <el-input v-model="returnOrder.rentPayable" readonly></el-input>
          </el-form-item>
          <el-form-item label="实付金额">
            <el-input v-model="returnOrder.rentActual" readonly></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="rentDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="doReturn">确 定</el-button>
        </div>
      </el-dialog>
    </el-main>
  </div>
</template>
<script>
import orderApi from '@/api/orderApi'

export default {
  data() {
    return {
      orderModel: {},
      start: 1,
      size: 5,
      total: 0,
      tableData: [],
      returnOrder: {},
      returnDialogVisible: false,
      rules: {
        returnMileage: [
          { required: true, message: '请输入还车里程数', trigger: 'blur' }
        ],
        returnTime: [
          { required: true, message: '请输入还车时间', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.search()
  },
  methods: {
    async search(start = 1) {
      this.start = start
      try {
        const res = await orderApi.searchUnfinishedOrder(this.start, this.size, this.orderModel)
        if (res.success) {
          this.tableData = res.data.records
          this.total = res.data.total
        }
      } catch (e) {
      }
    },
    handleSearch() {
      this.search()
    },
    resetForm() {
      this.orderModel = {}
      this.search()
    },
    handleReturn(row) {
      this.returnDialogVisible = true
      this.returnOrder = Object.assign({}, row)
    },
    checkReturnMileage(val) {
      if (val <= this.returnOrder.mileage) {
        this.$message.error('还车里程数不能低于出借车辆里程数')
        return false
      }
    },
    handleChange(val) {
      let beginTime = new Date(this.returnOrder.rentalTime)
      let endTime = new Date(val)
      if (endTime < beginTime) {
        this.$message.error('还车时间不能早于借车时间')
        return false
      }
      this.returnOrder.returnTime = val
      let rentalDays = Math.ceil((endTime - beginTime) / (1000 * 60 * 60 * 24))
      //计算应付款金额
      this.returnOrder.rentPayable = rentalDays * this.returnOrder.rent
      //计算实际金额
      this.returnOrder.rentActual = this.returnOrder.rentPayable * this.returnOrder.typeDiscount

    },
    doReturn() {
      this.$refs['returnForm'].validate(async valid => {
        if (!valid) {
          return false
        } else {
          let res = await orderApi.returnAuto(this.returnOrder)
          if (res.success) {
            this.$message({
              message: '还车成功,详情请查看订单列表',
              type: 'success'
            })
           await this.search()
            this.returnDialogVisible = false
          }
        }
      })

    }

  }
}
</script>
<style>

</style>

