<template>
  <div>
    <el-main>
      <!--查询表单-->
      <el-form :inline="true" :model="customerModel" size="mini">
        <el-form-item label="客户名称">
          <el-input v-model="customerModel.name" placeholder="请输入客户名称"></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model.trim="customerModel.tel" placeholder="请输入客户电话"></el-input>
        </el-form-item>
        <el-form-item label="身份证号">
          <el-input v-model.trim="customerModel.idNum" placeholder="请输入身份证号"></el-input>
        </el-form-item>
        <el-form-item label="年龄低值">
          <el-input-number :min="0" :max="100" v-model="customerModel.lowAge" placeholder="年龄低值"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="年龄高值">
          <el-input-number :min="0" :max="100" v-model="customerModel.highAge" placeholder="年龄高值"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="性别" label-width="67px">
          <el-select v-model="customerModel.gender" placeholder="请选择性别" style="width:150px">
            <el-option label="男" :value="1"></el-option>
            <el-option label="女" :value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button type="warning" @click="onReset">重置</el-button>
        <el-button type="success" @click="handleCreate">新增</el-button>
        <el-button type="danger" @click="deleteBatch">删除选中</el-button>
      </el-form>
      <el-divider></el-divider>
      <!--数据表格-->
      <el-table :data="tableData" size="small" style="width: 100%;" @selection-change="handleSelectionChange"
                border stripe
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column type="index" width="50" label="序号">
          <template slot-scope="scope">
            {{ (start - 1) * size + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="客户名称" prop="name"></el-table-column>
        <el-table-column label="电话" prop="tel"></el-table-column>
        <el-table-column label="身份证号" prop="idNum"></el-table-column>
        <el-table-column label="年龄" prop="age"></el-table-column>
        <el-table-column label="性别" prop="gender">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.gender === 1">男</el-tag>
            <el-tag v-else>女</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="生日" prop="birthday"></el-table-column>
        <el-table-column label="用户状态" prop="status">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status == 1">白名单</el-tag>
            <el-tag v-else type="danger">黑名单</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">修改</el-button>
            <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <el-pagination
        @current-change="search"
        :current-page="start"
        layout="total, prev, pager, next, jumper"
        :total="total"
        :page-size="size"
        background
      >
      </el-pagination>
      <!--新增修改客户对话框-->
      <el-dialog :title="titleMap[dialogStatus]" :visible.sync="dialogVisible" width="500px">
        <el-form :model="saveCustomer" label-width="80px" :rules="rules" ref="form">
          <el-form-item label="客户名称" prop="name">
            <el-input v-model="saveCustomer.name" placeholder="请输入客户名称"></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="tel">
            <el-input v-model="saveCustomer.tel" placeholder="请输入电话"></el-input>
          </el-form-item>
          <el-form-item label="身份证号" prop="idNum">
            <el-input v-model="saveCustomer.idNum" placeholder="请输入身份证号"
                      @change="setCustomerInfo"
            ></el-input>
          </el-form-item>
          <el-form-item label="年龄" prop="age" aria-readonly="true">
            <el-input-number :min="0" :max="100" v-model="saveCustomer.age" placeholder="请输入年龄" disabled
            ></el-input-number>
          </el-form-item>
          <el-form-item label="性别" label-width="67px">
            <el-radio-group v-model="saveCustomer.gender">
              <el-radio :label="1">男</el-radio>
              <el-radio :label="0">女</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="生日" prop="birthday">
            <el-date-picker
              v-model="saveCustomer.birthday"
              type="date"
              placeholder="选择日期"
              value-format="yyyy-MM-dd"
              style="width: 100%;"
              readonly
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="用户状态" v-if="dialogStatus === 'update'">
            <el-radio-group v-model="saveCustomer.status">
              <el-radio :label="1">白名单</el-radio>
              <el-radio :label="0">黑名单</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确定</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
    </el-main>
  </div>

</template>
<script>
import customerApi from '@/api/customer'

export default {
  data() {
    return {
      customerModel: {},
      tableData: [],
      start: 1,
      size: 6,
      total: 0,
      multipleSelection: [],
      dialogVisible: false,
      dialogStatus: 'create',
      titleMap: {
        create: '新增客户',
        update: '修改客户'
      },
      saveCustomer: {},
      rules: {
        name: [
          { required: true, message: '请输入客户名称', trigger: 'blur' }
        ],
        tel: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          {
            pattern: /^1[3456789]\d{9}$/,
            message: '请输入正确的手机号',
            trigger: 'blur'
          }
        ],
        idNum: [
          { required: true, message: '请输入身份证号', trigger: 'blur' },
          {
            pattern: /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
            message: '请输入正确的身份证号',
            trigger: 'blur'
          }
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
        let res = await customerApi.search(this.start, this.size, this.customerModel)
        if (res.success) {
          this.tableData = res.data.records
          this.total = res.data.total
        }
      } catch (e) {
        console.log(e)
      }
    },
    handleSearch() {
      this.search()
    },
    onReset() {
      this.customerModel = {}
      this.search()
    },
    handleCreate() {
      this.dialogVisible = true
      this.dialogStatus = 'create'
      this.saveCustomer = {}
      this.$nextTick(() => {
        this.$refs['form'].clearValidate()
      })

    },
    handleUpdate(row) {
      this.dialogVisible = true
      this.dialogStatus = 'update'
      this.saveCustomer = Object.assign({}, row)

    },
    handleDelete(row) {
      this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          let res = await customerApi.delete(row.id)
          if (res.success) {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            this.search()
          }
        } catch (e) {
        }
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = []
      val.forEach(element => {
        this.multipleSelection.push(element.id)
      })
    },

    deleteBatch() {
      if (this.multipleSelection.length === 0) {
        this.$message.error('请选择要删除的数据')
      } else {
        this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async() => {
          // 确定
          let res = await customerApi.delete(this.multipleSelection)
          if (res.success) {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            this.search()
          }
        })
      }

    },
    setCustomerInfo(val) {
      //处理性别
      const sex = val.charAt(val.length - 2)
      this.saveCustomer.gender = sex % 2 === 0 ? 0 : 1
      //处理年龄
      //获取用户身份证上的出生日期
      const birthDay = val.substring(6, 14)
      const now = new Date()
      const birthDayDate = new Date(birthDay.substring(0, 4), birthDay.substring(4, 6) - 1, birthDay.substring(6, 8))
      //计算年龄
      let timeDiff = Math.abs(now.getTime() - birthDayDate.getTime())
      this.saveCustomer.age = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365))
      this.saveCustomer.birthday = birthDayDate
      this.$forceUpdate()
    },
    async createData(){
      this.saveCustomer.status = 1
      this.$refs['form'].validate(async (valid)=>{
        if (!valid) {
           return false
        }else {
          try {
            let res = await customerApi.save(this.saveCustomer)
            if (res.success) {
              this.dialogVisible = false
              await this.search()
              this.$message.success('添加成功')
            }
          } catch (e) {
            console.log(e)
          }
        }
      })


    },
    async updateData() {
      this.$refs['form'].validate(
        async valid => {
       if(!valid){
         return false
       }else{
         try {
           let res = await customerApi.update(this.saveCustomer)
           if (res.success) {
             this.dialogVisible = false
             await this.search()
             this.$message.success('修改成功')
           }
         } catch (e) {
           console.log(e)
         }
       }
        }
      )


    }
  }
}

</script>
<style>

</style>

