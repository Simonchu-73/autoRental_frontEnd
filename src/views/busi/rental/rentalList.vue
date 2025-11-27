<template>
  <div>
    <el-main>
      <el-form :inline="true" class="demo-form-inline" size="small" v-model="infoModel">
        <el-form-item label="厂商名称">
          <el-select v-model="infoModel.makerId" placeholder="请选择" @change="handleMakerChange">
            <el-option v-for="item in makerList" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="品牌名称">
          <el-select v-model="infoModel.brandId" placeholder="请选择">
            <el-option v-for="item in brandList" :key="item.id" :label="item.brandName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="车牌号码">
          <el-input v-model="infoModel.autoNum" placeholder="请输入车牌号码"></el-input>
        </el-form-item>
        <el-form-item label="车辆类型">
          <el-select v-model="infoModel.infoType" placeholder="请选择">
            <el-option label="燃油车" value="0"></el-option>
            <el-option label="电动车" value="1"></el-option>
            <el-option label="混动车" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="租金下限">
          <el-input v-model="infoModel.lowRent" placeholder="请输入租金下限"></el-input>
        </el-form-item>
        <el-form-item label="租金上限">
          <el-input v-model="infoModel.highRent" placeholder="请输入租金上限"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" icon="el-icon-search">查询</el-button>
          <el-button type="warning" @click="resetForm" icon="el-icon-refresh">重置</el-button>

        </el-form-item>
      </el-form>
      <!--查询表单结束-->
      <!--数据表格-->
      <el-table :data="tableData" border stripe>

        <el-table-column label="序号" width="50">
          <template slot-scope="scope">{{
              (start - 1) * size +
              scope.$index + 1
            }}
          </template>
        </el-table-column>
        <el-table-column label="车牌号码" prop="autoNum"></el-table-column>
        <el-table-column label="生成厂商" prop="makerName"></el-table-column>
        <el-table-column label="车辆品牌" prop="brandName" width="120"></el-table-column>
        <el-table-column label="车辆类型" prop="infoType">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.infoType==0">燃油车</el-tag>
            <el-tag v-else-if="scope.row.infoType==1">纯电车</el-tag>
            <el-tag v-else-if="scope.row.infoType==2">混动车</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="color" label="颜色" width="100">
          <template slot-scope="scope">
            <span
              :style="{ background: scope.row.color, height:
              '20px', width: '50px', display: 'inline-block' }"
            ></span>
          </template>
        </el-table-column>
        <el-table-column label="汽车排量" prop="displacement" width="100">
          <template slot-scope="scope">
            {{ scope.row.displacement + scope.row.unit }}
          </template>
        </el-table-column>

        <el-table-column label="行驶里程" prop="mileage"></el-table-column>
        <el-table-column label="日租金额" prop="rent"></el-table-column>
        <el-table-column label="上牌时间" prop="registrationDate"></el-table-column>
        <el-table-column label="车辆图片" prop="pic" width="120">
          <template slot-scope="scope">
            <img :src="scope.row.pic"
                 style="width:80px;height:50px;"
            >
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-bangzhu" size="mini" @click="handleRent(scope.row)">出租
            </el-button>
          </template>
        </el-table-column>

      </el-table>
      <el-pagination
        background
        layout="total,prev, pager, next,jumper"
        :total="total"
        :page-size="size"
        :current-page="start"
        @current-change="search"
      ></el-pagination>
      <!--显示车辆信息对话框-->
      <el-dialog title="车辆信息" :visible.sync="rentDialogVisible">
        <el-form :rules="infoRules" :inline="true" class="demo-form-inline" :model="rentalInfo"
                 ref="infoForm"

        >
          <el-form-item label="车牌号">
            <el-input v-model="rentalInfo.autoNum" readonly></el-input>
          </el-form-item>
          <el-form-item label="车辆品牌">
            <el-input v-model="rentalInfo.brandName" readonly></el-input>
          </el-form-item>
          <el-form-item label="车辆厂商">
            <el-input v-model="rentalInfo.makerName" readonly></el-input>
          </el-form-item>
          <el-form-item label="汽车排量">
            <el-input v-model="rentalInfo.displacement" readonly></el-input>
          </el-form-item>
          <el-form-item label="上牌日期">
            <el-input v-model="rentalInfo.registrationDate" readonly></el-input>
          </el-form-item>
          <el-form-item label="行驶里程">
            <el-input v-model="rentalInfo.mileage" readonly></el-input>
          </el-form-item>
          <el-form-item label="日租金额">
            <el-input v-model="rentalInfo.rent" readonly></el-input>
          </el-form-item>
          <el-form-item label="出租类型" prop="typeId">
            <el-select v-model="rentalInfo.typeId" placeholder="请选择">
              <el-option v-for="item in rentalTypeList" :key="item.id" :label="item.typeName" :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="车辆押金">
            <el-input v-model="rentalInfo.deposit" readonly></el-input>
          </el-form-item>
          <el-form-item label="车辆图片">
            <el-image
              style="width: 150px; height: 150px"
              :src="rentalInfo.pic"
              :preview-src-list="srcList"
            >
            </el-image>
          </el-form-item>
          <el-form-item>
            <el-button @click="rentDialogVisible=false">取消</el-button>
            <el-button type="primary" @click="doNext">下一步</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!--展示客户信息对话框-->
      <el-dialog title="客户信息" :visible.sync="customerDialogVisible">
        <el-form :inline="true" :model="rentCustomer" :rules="customerRules" ref="customerForm">
          <el-form-item label="客户电话" prop="tel">
            <el-input v-model="rentCustomer.tel" @blur="selectCustomer"></el-input>
          </el-form-item>
          <el-form-item label="客户姓名">
            <el-input v-model="rentCustomer.name"></el-input>
          </el-form-item>
          <el-form-item label="身份证号" prop="idNum">
            <el-input v-model="rentCustomer.idNum"
                      @change="setCustomerInfo"
            ></el-input>
          </el-form-item>
          <el-form-item label="客户年龄">
            <el-input v-model="rentCustomer.age"></el-input>
          </el-form-item>
          <el-form-item label="客户性别">
            <el-radio-group v-model="rentCustomer.gender">
              <el-radio :label="1">男</el-radio>
              <el-radio :label="0">女</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <div slot="footer" class="el-dialog__footer">
          <el-button @click="customerDialogVisible=false">取消</el-button>
          <el-button type="primary" @click="createOrder">下单</el-button>
        </div>
      </el-dialog>
    </el-main>
  </div>
</template>

<script>
import autoInfoApi from '@/api/autoInfo'
import autoMakerApi from '@/api/autoMaker'
import autoBrandApi from '@/api/autoBrand'
import rentalTypeApi from '@/api/rentalType'
import customerApi from '@/api/customer'
import orderApi from '@/api/orderApi'

export default {

  data() {
    return {
      infoModel: {
        status: 0
      },
      makerList: [],
      brandList: [],
      tableData: [],
      total: 0,
      start: 1,
      size: 5,
      //车辆出租模块-显示车辆信息的对话框相关数据
      rentDialogVisible: false,
      rentalInfo: {},
      srcList: [],
      rentalTypeList: [],
      infoRules: {
        typeId: [
          { required: true, message: '请选择出租类型', trigger: 'blur' }
        ]
      },
      customerRules: {
        idNum: [
          { required: true, message: '请输入身份证号', trigger: 'blur' },
          {
            pattern: /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9xX]$/,
            message: '请输入正确的身份证号',
            trigger: 'blur'
          }
        ],
        tel: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          {
            pattern: /^1[3456789]\d{9}$/,
            message: '请输入正确的手机号码',
            trigger: 'blur'
          }
        ]
      },
      //车辆出租模块-显示客户信息的对话框相关数据
      rentCustomer: {},
      customerDialogVisible: false,
      isSaveCustomer: false,//之前是否添加过这个用户信息
      //订单信息
      saveOrder: {}
    }
  },
  created() {
    this.search()
    this.getMakerList()
    this.getRentalTypeList()
  },
  methods: {
    async search(start = 1) {
      this.start = start
      try {
        const res = await autoInfoApi.search(this.start, this.size, this.infoModel)
        if (res.success) {
          this.tableData = res.data.records
          this.total = res.data.total
        }
      } catch (e) {
        console.log(e)
      }
    },
    async getMakerList() {
      try {
        const res = await autoMakerApi.list()
        if (res.success) {
          this.makerList = res.data
        }
      } catch (e) {
        console.log(e)
      }

    },
    async handleMakerChange(val) {
      try {
        const res = await autoBrandApi.selectBrandByMakerId(val)
        if (res.success) {
          this.brandList = res.data
        }
      } catch (e) {
        console.log(e)
      }
    },
    async getRentalTypeList() {
      try {
        const res = await rentalTypeApi.list()
        if (res.success) {
          this.rentalTypeList = res.data
        }
      } catch (e) {
        console.log(e)
      }
    },
    handleSearch() {
      this.search()
    },
    resetForm() {
      this.infoModel = {
        status: 0
      }
      this.search()
    },
    async handleRent(row) {
      this.rentDialogVisible = true
      this.rentalInfo = Object.assign({}, row)
      this.srcList.push(row.pic)

    },
    doNext() {
      this.rentCustomer={}
      this.$refs['infoForm'].validate(async valid => {
        if (!valid) {
          return false
        } else {
          this.saveOrder = {
            autoId: this.rentalInfo.id,
            typeId: this.rentalInfo.typeId,
            rent: this.rentalInfo.rent,
            deposit: this.rentalInfo.deposit,
            mileage: this.rentalInfo.mileage
          }
          this.customerDialogVisible = true
          this.rentDialogVisible = false
        }
      })

    },
    async selectCustomer() {

      this.$refs['customerForm'].validateField('tel', async errormessage => {
        if (errormessage) {
          return false
        } else {
          try {
            const res = await customerApi.selectCustomerByPhone(this.rentCustomer.tel)
            if (res.data != null) {
              this.rentCustomer = res.data
              this.isSaveCustomer = false
            } else {
              this.isSaveCustomer = true
              this.$message.warning('该客户是新用户，请添加信息')
            }
          } catch (e) {
          }

        }
      })

    },
    setCustomerInfo(val) {
      this.$refs['customerForm'].validateField('idNum', async(errorMessage) => {
        if (errorMessage) {
          return false
        } else {
          //获取客户性别
          let genderVal = val.charAt(val.length - 2)
          this.rentCustomer.gender = genderVal % 2
          //获取客户生日
          let birthDayVal = val.substring(6, 14)
          let birthDate = new Date(birthDayVal.substring(0, 4), birthDayVal.substring(4, 6) - 1, birthDayVal.substring(6, 8))
          this.rentCustomer.birthday = birthDate
          //获取客户年龄
          let now = new Date()
          let timeDiff = now.getTime() - birthDate.getTime()
          if (timeDiff > 0) {
            this.rentCustomer.age = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365))
          } else {
            this.$message.warning('请检查身份证信息')
          }
          this.rentCustomer.idNum = val
          this.$forceUpdate()
        }

      })

    },
    createOrder() {
      this.$refs['customerForm'].validate(async valid => {
        if (!valid) {
          return false
        } else {
          if (this.isSaveCustomer) {
            let res = await this.saveCustomer(this.rentCustomer)
            if (res.success) {
              this.saveOrder.customerId = res.data.id
              await this.addOrder()

            }
          } else {
            this.saveOrder.customerId = this.rentCustomer.id
            await this.addOrder()
          }
        }
      })
    },
    async addOrder() {
      try {
        const res = await orderApi.createOrder(this.saveOrder)
        if (res.success) {
          this.$message.success('创建订单成功，请到订单列表查看')
          this.customerDialogVisible = false
          this.rentDialogVisible = false
          await this.search()
        }
      } catch (e) {
        console.log(e)
      }
    },
    async saveCustomer(data) {
      try {
        const res = await customerApi.save(data)
        if (res.success) {
          this.rentCustomer = res.data
          this.isSaveCustomer = false
          this.$message.success('保存成功')
        }
      } catch (e) {
        console.log(e)
      }
    }

  }
}
</script>

<style>

</style>
