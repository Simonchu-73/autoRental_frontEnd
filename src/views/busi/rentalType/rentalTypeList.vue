<template>
  <div>
    <el-main>
      <!--查询表单-->
      <el-form :inline="true" :model="rentalTypeModel" size="small" label-width="100px">
        <el-form-item label="出租类型名称">
          <el-input v-model="rentalTypeModel.typeName" placeholder="请输入出租类型名称" ></el-input>
        </el-form-item>
        <el-form-item label="最低折扣">
          <template>
            <el-input-number :min="0" :max="1" v-model="rentalTypeModel.lowDiscount" :step="0.01" placeholder="最低折扣"></el-input-number>
          </template>
        </el-form-item>
        <el-form-item label="最高折扣">
          <template>
            <el-input-number :min="0" :max="1" v-model="rentalTypeModel.highDiscount" :step="0.01" placeholder="最高折扣"></el-input-number>
          </template>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="onSubmit()">查询</el-button>
          <el-button type="warning" icon="el-icon-refresh" @click="resetForm">重置</el-button>
          <el-button type="success" icon="el-icon-plus" @click="handleCreate">新增</el-button>
          <el-button type="danger" icon="el-icon-search" @click="handleDeleteBatch">删除选中</el-button>
        </el-form-item>
      </el-form>
      <!--查询表单结束-->
      <!--表格部分-->
      <el-table :data="tableData" border stripe style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" ></el-table-column>
        <el-table-column label="序号" width="50">
          <template slot-scope="scope">{{
              (start - 1) * size +
              scope.$index + 1
            }}
          </template>
        </el-table-column>
        <el-table-column prop="typeName" label="出租类型名称">
        </el-table-column>
        <el-table-column prop="typeDiscount" label="享受折扣">
        </el-table-column>
        <el-table-column prop="remark" label="出租类型描述">
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="handleUpdate(scope.row)">修改</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>

      </el-table>
      <!--表格部分结束-->
      <!--分页组件-->
      <el-pagination
        background
        :current-page="start"
        :page-size="size"
        layout="total, prev, pager, next, jumper"
        :total="total"
        @current-change="search"
      >
      </el-pagination>
      <!--分页组件结束-->
      <!-- 新增修改出租类型的对话框 -->
      <el-dialog :title="titleMap[dialogStatus]" :visible.sync="dialogFormVisible">
        <el-form :model="saveRentalType"
                 ref="form"
                 :rules="rules"
                 label-width="120px"
        >
          <el-form-item label="出租类型名称" prop="typeName">
            <el-input v-model="saveRentalType.typeName" placeholder="请输入出租类型名称" ></el-input>
          </el-form-item>
          <el-form-item label="类型折扣" prop="typeDiscount">
            <template>
              <el-input-number :min="0" :max="1" v-model="saveRentalType.typeDiscount" :step="0.01" placeholder="请输入折扣"></el-input-number>
            </template>
          </el-form-item>
          <el-form-item label="出租类型描述" prop="remark">
            <el-input type="text" v-model="saveRentalType.remark" placeholder="请输入出租类型描述" ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button  @click="dialogFormVisible = false">取消</el-button>
            <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确定</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!-- 新增修改出租类型的对话框结束 -->
    </el-main>
  </div>
</template>
<script>
import rentalTypeApi from '@/api/rentalType'

export default {
  data() {
    return {
      multipleSelection:[],
      rentalTypeModel: {},
      tableData: [],
      titleMap: {
        create: '新增出租类型',
        update: '修改出租类型'
      },
      dialogFormVisible: false,
      dialogStatus: 'create',
      saveRentalType: {},
      rules: {
        typeName: [
          { required: true, message: '请输入出租类型名称', trigger: 'blur' }
        ],
        typeDiscount: [
          { required: true, message: '请输入折扣', trigger: 'blur' }
        ]
      },
      start: 1,
      size: 5,
      total: 0
    }
  },
  created() {
    this.search()
  },
  methods: {
    async search(start=1) {
      this.start = start
      const res = await rentalTypeApi.search( this.start, this.size,this.rentalTypeModel)
      if (res.success) {
        this.tableData = res.data.records
        this.total = res.data.total


      }
    },
    onSubmit() {
      if(this.rentalTypeModel.lowDiscount!=null&&this.rentalTypeModel.highDiscount!=null){
        if(this.rentalTypeModel.lowDiscount>this.rentalTypeModel.highDiscount){
          this.$message.warning('最低折扣不能大于最高折扣')
          return
        }
      }
      this.search()
    },
    handleCreate() {
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.saveRentalType = {}
      this.rentalTypeModel = {}
      this.$nextTick().then(
        () => {
          this.$refs['form'].clearValidate()
        }
      )
    },
    handleSelectionChange(val) {
      this.multipleSelection=[]
      val.forEach(element => {
        this.multipleSelection.push(element.id)
      })

    },
   handleDelete(row) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await rentalTypeApi.delete(row.id)
        if (res.success) {
          this.$message.success('删除成功')
          this.search()
        }
      }).catch(() => {
        this.$message({
          type: 'info',
        })
      })

    },
    handleDeleteBatch() {
      if(this.multipleSelection.length==0){
        this.$message.warning('请选择要删除的行')
        return false
      }else{
        this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const res = await rentalTypeApi.delete(this.multipleSelection)
          if (res.success) {
            this.$message.success('删除成功')
            this.search()
          }
        }).catch(() => {
          this.$message({
            type: 'info',
          })
        })
      }
    },
    handleUpdate(row) {
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.saveRentalType=JSON.parse(JSON.stringify(row))
    },
    resetForm() {
      this.rentalTypeModel = {}
      this.search()
    },
    createData() {
      this.$refs['form'].validate(
        async valid => {
          if(!valid){
             return false
          }else{
            try {
              const res = await rentalTypeApi.save(this.saveRentalType)
              if (res.success) {
                this.dialogFormVisible = false
                this.search()
                this.$message.success('保存成功')
              }
            } catch (e) {
              console.log(e)
            }

          }
        }
      )
    },
    updateData() {
      this.$refs['form'].validate(
        async valid => {
          if(!valid){
             return false
          }else{
            try {
              const res = await rentalTypeApi.update(this.saveRentalType)
              if (res.success) {
                this.dialogFormVisible = false
                this.search()
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
