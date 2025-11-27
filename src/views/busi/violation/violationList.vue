<template>
  <div>
    <el-main>
      <!--查询表单-->
      <el-form :inline="true" :model="violationModel" size="mini">
        <el-form-item label="车牌号">
          <el-input v-model="violationModel.autoNum" placeholder="请输入车牌号"></el-input>
        </el-form-item>
        <el-form-item label="违章事由">
          <el-input v-model="violationModel.reason" placeholder="请输入违章事由"></el-input>
        </el-form-item>
        <el-form-item label="违章地点">
          <el-input v-model="violationModel.location" placeholder="请输入违章地点"></el-input>
        </el-form-item>
        <el-form-item label="罚款下限">
          <el-input-number :min="0" v-model="violationModel.lowFine" placeholder="请输入罚款下限"></el-input-number>
        </el-form-item>
        <el-form-item label="罚款上限">
          <el-input-number :min="0" v-model="violationModel.highFine" placeholder="请输入罚款上限"></el-input-number>
        </el-form-item>
        <el-form-item label="违章时间">
          <el-date-picker
            v-model="violationModel.vTimeVal"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions"
            value-format="yyyy-MM-dd HH:mm:ss"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button type="warning" @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleCreate">新增</el-button>
          <el-button type="danger" @click="deleteBatch">批量删除</el-button>
        </el-form-item>
      </el-form>
      <!--数据表格-->
      <el-table :data="tableData" @selection-change="handleSelectionChange" border stripe>
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column type="index" width="50" label="序号">
          <template slot-scope="scope">
            {{ (start - 1) * size + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="车牌号" prop="autoNum"></el-table-column>
        <el-table-column label="违章时间" prop="vtime">

        </el-table-column>
        <el-table-column label="违章事由" prop="reason"></el-table-column>
        <el-table-column label="违章地点" prop="location"></el-table-column>
        <el-table-column label="扣分点数" prop="deductPoints"></el-table-column>
        <el-table-column label="罚款金额" prop="fine"></el-table-column>
        <el-table-column label="处理状态" prop="status">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 0" type="danger">未处理</el-tag>
            <el-tag v-if="scope.row.status === 1">已处理</el-tag>
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
        :page-size="size"
        layout="total, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
      <!--新增修改违章记录对话框-->
      <el-dialog :title="titleMap[dialogStatus]" :visible.sync="dialogVisible" width="50%">
        <el-form :model="saveViolation" label-width="80px" :rules="rules" ref="form">
          <el-form-item label="车牌号" prop="autoNum">
            <el-input v-model="saveViolation.autoNum" placeholder="请输入车牌号" @blur="checkAutoNum"></el-input>
          </el-form-item>
          <el-form-item label="违章时间" prop="vtime">
            <el-date-picker
              v-model="saveViolation.vtime"
              type="datetime"
              placeholder="选择日期时间"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 100%;"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="违章事由" prop="reason">
            <el-input v-model="saveViolation.reason" placeholder="请输入违章事由"></el-input>
          </el-form-item>
          <el-form-item label="违章地点" prop="location">
            <el-input v-model="saveViolation.location" placeholder="请输入违章地点"></el-input>
          </el-form-item>
          <el-form-item label="扣分点数" prop="deductPoints">
            <el-input-number :min="0" v-model="saveViolation.deductPoints" placeholder="请输入扣分点数"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="罚款金额" prop="fine">
            <el-input-number :min="0" v-model="saveViolation.fine" placeholder="请输入罚款金额"></el-input-number>
          </el-form-item>
          <el-form-item label="处理状态" v-if="dialogStatus === 'update'">
            <el-radio-group v-model="saveViolation.status">
              <el-radio :label="0">未处理</el-radio>
              <el-radio :label="1">已处理</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item>
            <el-button :disabled="isDisabled" type="primary" @click="dialogStatus==='create'?createData():updateData()">
              确定
            </el-button>
            <el-button @click="dialogVisible = false">取消</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
    </el-main>
  </div>
</template>
<script>
import violationApi from '@/api/violation'
import autoInfoApi from '@/api/autoInfo'

export default {
  data() {
    return {
      tableData: [],
      multipleSelection: [],
      start: 1,
      size: 10,
      total: 0,
      violationModel: {},
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      dialogVisible: false,
      dialogStatus: 'create',
      titleMap: {
        create: '新增违章记录',
        update: '修改违章记录'
      },
      saveViolation: {},
      rules: {
        autoNum: [
          { required: true, message: '请输入车牌号', trigger: 'blur' }
        ],
        vtime: [
          { required: true, message: '请选择违章时间', trigger: 'change' }
        ],
        reason: [
          { required: true, message: '请输入违章事由', trigger: 'blur' }
        ],
        location: [
          { required: true, message: '请输入违章地点', trigger: 'blur' }
        ],
        deductPoints: [
          { required: true, message: '请输入扣分点数', trigger: 'blur' }
        ],
        fine: [
          { required: true, message: '请输入罚款金额', trigger: 'blur' }
        ]
      },
      isDisabled: false
    }
  },
  created() {
    this.search()
  },
  methods: {
    async search(start = 1) {
      this.start = start
      try {
        let res = await violationApi.search(this.start, this.size, this.violationModel)
        if (res.success) {
          this.tableData = res.data.records
          this.total = res.data.total
        }
      } catch (e) {
        console.log(e)
      }
    },
    handleSearch() {
      if (this.violationModel.vTimeVal !== null) {
        this.violationModel.lowViolationTime = this.violationModel.vTimeVal[0]
        this.violationModel.highViolationTime = this.violationModel.vTimeVal[1]
      }
      this.search()
    },
    handleReset() {
      this.violationModel = {}
      this.search()
    },
    handleCreate() {
      this.dialogVisible = true
      this.dialogStatus = 'create'
      this.saveViolation = {}
      this.$nextTick(() => {
        this.$refs['form'].clearValidate()
      })
    },
    async checkAutoNum() {
      try {
        let res = await autoInfoApi.exist(this.saveViolation)
        if (res.success) {
          if (res.message === 'no') {
            this.isDisabled = true
            this.$message.error('此车牌号不存在')
          } else {
            console.log(res)
            this.isDisabled = false
            this.saveViolation.autoId=res.data.id
          }
        }
      } catch (e) {
        console.log(e)
      }

    },
    handleUpdate(row) {
      this.dialogVisible = true
      this.dialogStatus = 'update'
      this.saveViolation = Object.assign({}, row)
    },
    createData(){
      this.saveViolation.status = 0
      this.$refs['form'].validate(async valid => {
        if( !valid){
           return  false
        }else{
          try {
            let res = await violationApi.save(this.saveViolation)
            if (res.success) {
              this.dialogVisible = false
              this.$message.success('保存成功')
              this.search()
            }
          } catch (e) {
            console.log(e)
          }
        }
      })

    },
    updateData() {
      this.$refs['form'].validate(async valid => {
        if( !valid){
           return  false
        }else{
          try {
            let res = await violationApi.update(this.saveViolation)
            if (res.success) {
              this.dialogVisible = false
              this.$message.success('修改成功')
              this.search()
            }
          } catch (e) {
            console.log(e)
          }
        }
      })

    },
    handleDelete( row){
      this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        await violationApi.delete(row.id).then(res => {
          if (res.success) {
            this.$message({
              message: '删除成功',
              type: 'success'
            })
            this.search()
          }
        })
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection=[]
      val.forEach(element => {
        this.multipleSelection.push(element.id)
      })
    },
    deleteBatch() {
      if (this.multipleSelection.length === 0) {
        this.$message.error('请选择要删除的记录')
      } else {
        this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          await violationApi.delete(this.multipleSelection).then(res => {
            if (res.success) {
              this.$message({
                message: '删除成功',
                type: 'success'
              })
              this.search()
            }
          })
        })
      }

    }
  }
}

</script>
<style>

</style>

