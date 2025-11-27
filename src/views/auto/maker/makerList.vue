<template>
  <div>

    <el-main>
      <!-- 查询表单 -->
      <el-form :inline="true" :model="makerModel" size="small" label-width="100px">
        <el-form-item label="厂商名称">
          <el-input v-model="makerModel.name" placeholder="请输入厂商名称"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="onSubmit">查询</el-button>
          <el-button type="warning" icon="el-icon-refresh" @click="resetForm">重置</el-button>
          <el-button type="success" icon="el-icon-plus" @click="handleCreate">新增</el-button>
          <el-button type="danger" icon="el-icon-delete" @click="deleteBatch">删除选中</el-button>
        </el-form-item>
      </el-form>
      <!-- 查询表单结束 -->
      <!-- 数据表格 -->
      <el-table :data="tableData" style="width: 100%" border stripe
                @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="序号" width="80">
          <template slot-scope="scope">{{ (start - 1) * size + scope.$index + 1 }}</template>
        </el-table-column>
        <el-table-column prop="name" label="厂商名称">
        </el-table-column>
        <el-table-column prop="orderLetter" label="排序字母">
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>

      </el-table>
      <!-- 数据表格结束 -->
      <!-- 分页组件 -->
      <el-pagination background layout="total, prev, pager, next, jumper"
                     :total="total"
                     :current-page="start" :page-size="size"
                     @current-change="search"
      >
      </el-pagination>
      <!-- 分页组件结束 -->
      <!-- 对话框 -->
      <el-dialog :title="titleMap[dialogStatus]" :visible.sync="dialogFormVisible">
        <el-form :model="saveMaker" ref="form" :rules="rules" label-width="120px">
          <el-form-item label="厂商名称" prop="name">
            <el-input v-model="saveMaker.name" autocomplete="off"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <!-- 新增和删除用的同一个对话框，要区分状态 -->
          <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确 定</el-button>
        </div>
      </el-dialog>
      <!-- 对话框结束 -->
    </el-main>
  </div>
</template>

<script>
// 导入向后端发送请求的js模块
import makerApi from '@/api/autoMaker.js'

export default {
  //数据
  data() {
    return {
      makerModel: {}, //表示对象
      start: 1,
      size: 5,
      total: 0,
      tableData: [],
      multipleSelection: [],
      dialogFormVisible: false, //表示对话框是否可见
      saveMaker: {},//用于新增的车辆生产产商对象信息
      dialogStatus: '',
      titleMap: {
        create: '新增厂商',
        update: '修改车辆生产厂商'
      },
      rules: {
        name: [
          { required: true, message: '请输入厂商名称', trigger: 'blur' }
        ]
      }
    }

  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    this.search()
  },

  methods: {
    async search(start = 1) {
      this.start = start
      const res = await makerApi.search(this.start, this.size, this.makerModel)
      if (res.success) {
        this.tableData = res.data.records
        this.total = res.data.total
      }
    },
    onSubmit() {
      this.search()
    },
    resetForm() {
      this.makerModel = {}
    },
    handleCreate() {
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.saveMaker= {} //清空表单
      this.$nextTick(() => {
        this.$refs['form'].clearValidate()
      })

    },
    deleteBatch() {
      if (this.multipleSelection.length === 0) {
        this.$message({
          message: '请选择要删除的记录',
          type: 'warning'
        })
        return
      } else {
        this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async() => {
          // 确定
          await makerApi.delete(this.multipleSelection).then(res => {
            if (res.success) {
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
              this.search()
            }
          })
        }).catch(() => {

        })
      }

    },
    handleUpdate(row) {
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.saveMaker=row
      this.$nextTick(() => {
        this.$refs['form'].clearValidate()
      })
    },
    handleDelete(row) {
      this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        // 确定
        await makerApi.delete(row.id).then(res => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            this.search()
          }
        })
      }).catch((error) => {
        console.log(error)
      })

    },
    handleSelectionChange(val) {
      this.multipleSelection = []
      val.forEach(element => {
        this.multipleSelection.push(element.id)
      })

    },
    createData() {
      this.$refs['form'].validate(async(valid) => {
        if(! valid){
          return false
        }else{
          await makerApi.save(this.saveMaker).then(res => {
            if(res.success){
              this.$message({
                message: '添加成功',
                type: 'success'
              });
              //将当前对话框关闭
              this.dialogFormVisible = false
              this.search()
            }
          })

        }
      })
    },
    updateData() {
      this.$refs['form'].validate(async(valid) => {
        if(! valid){
          return false
        }else {
          await makerApi.update(this.saveMaker).then(res => {
            if(res.success){
              this.$message({
                message: '修改成功',
                type: 'success'
              });
              //将当前对话框关闭
              this.dialogFormVisible = false
              this.search()
            }
          })

        }
      })
    }
  }

}
</script>

<style></style>
