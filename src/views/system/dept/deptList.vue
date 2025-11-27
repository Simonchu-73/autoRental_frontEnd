<template>
  <div>
    <el-main>
      <!--查询表单-->
      <el-form :inline="true" :model="deptModel" size="small" label-width="80px">
        <el-form-item label="部门名称">
          <el-input v-model="deptModel.deptName" placeholder="请输入部门名称" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="onSubmit">查询</el-button>
          <el-button type="warning" icon="el-icon-refresh" @click="resetForm">重置</el-button>
          <el-button type="success" icon="el-icon-plus" @click="handleCreate">新增</el-button>
        </el-form-item>
      </el-form>
      <!--表格部分-->
      <el-table :data="tableData" border stripe style="width: 100%"
                row-key="id"
                :tree-props="{children: 'children',hasChildren: 'hasChildren'}"
                default-expand-all
      >
        <el-table-column prop="deptName" label="部门名称"></el-table-column>
        <el-table-column prop="parentName" label="上级部门"></el-table-column>
        <el-table-column prop="phone" label="部门电话"></el-table-column>
        <el-table-column prop="address" label="部门地址"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="handleUpdate(scope.row)">修改</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 新增修改部门对象的对话框 -->
      <el-dialog :title="titleMap[dialogStatus]" :visible.sync="dialogFormVisible">
        <el-form :model="saveDept" ref="form" :rules="rules" label-width="120px" size="small">
          <el-form-item label="上级部门" prop="parentName">
            <el-input v-model="saveDept.parentName" placeholder="请选择上级部门名称" :readOnly="true"
                      @click.native="goToSelectDept"
            >
            </el-input>
          </el-form-item>
          <el-form-item label="部门名称" prop="deptName">
            <el-input v-model="saveDept.deptName" placeholder="请输入部门名称"></el-input>
          </el-form-item>
          <el-form-item label="部门电话" prop="phone">
            <el-input v-model="saveDept.phone" placeholder="请输入部门电话"></el-input>
          </el-form-item>
          <el-form-item label="部门地址" prop="address">
            <el-input v-model="saveDept.address" placeholder="请输入部门地址"></el-input>
          </el-form-item>
          <el-form-item label="部门排序" prop="orderNum">
            <el-input-number v-model="saveDept.orderNum" :min="0"></el-input-number>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <!-- 新增和删除用的同一个对话框，要区分状态 -->
          <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确 定</el-button>
        </div>
      </el-dialog>
      <!-- 新增修改部门对象的对话框结束 -->
      <!--部门树对话框-->
      <el-dialog title="选择上级部门" :visible.sync="dialogTreeVisible" width="30%">
        <el-tree :data="treeData" :props="defaultProps" @node-click="handleNodeClick"
                 default-expand-all
                 empty-text="未获取部门的数据"
                 :highlight-current="true"
        >

        </el-tree>
        <div slot="footer" class="dialog-footer">
          <el-button @click="closeTree">取 消</el-button>
          <el-button type="primary" @click="handleTreeConfirm">确 定</el-button>
        </div>
      </el-dialog>
    </el-main>
  </div>
</template>

<script>
import deptApi from '@/api/dept'

export default {
  data() {
    return {
      deptModel: {},
      tableData: [],
      titleMap: {
        create: '新增部门',
        update: '修改部门'
      },
      dialogFormVisible: false,
      dialogStatus: 'create',
      saveDept: {},
      rules: {

          parentName: [
            { required: true, message: '请输入上级部门名称', trigger: 'blur' }
          ],
          deptName: [
            { required: true, message: '请输入部门名称', trigger: 'blur' }
          ],
          phone: [
            { required: true, message: '请输入部门电话', trigger: 'blur' }
          ],
          address: [
            { required: true, message: '请输入部门地址', trigger: 'blur' }
          ],
          orderNum: [
            { required: true, message: '请输入部门排序', trigger: 'blur' }
          ]

      },
      dialogTreeVisible: false,
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'deptName'
      }
    }
  },
  created() {
    this.search()
  },
  methods: {
    async search() {
      const res = await deptApi.search(this.deptModel)
      if (res.success) {
        this.tableData = res.data
      }
    },
    onSubmit() {
      const res = this.search(this.deptModel)
      if (res.success) {
        this.tableData = res.data
      }
    },
    resetForm() {
      this.deptModel = {}
      this.tableData = []
      this.search()
    },
    handleCreate() {
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.saveDept = {}
      this.$nextTick(() => {
        this.$refs['form'].clearValidate()
      })
    },
    handleUpdate(row) {
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.saveDept = JSON.parse(JSON.stringify(row))
    },
   async handleDelete(row) {
      let res =  await deptApi.hasChildren(row.id)
      if(res.message==="有"){
        this.$message({
          message: '此部门有子部门，不能删除',
          type: 'warning'
        })
        return false
      }else{
        this.$confirm('确定要删除吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          await deptApi.delete(row.id).then(res => {
            if (res.success) {
              this.$message({
                message: '删除成功',
                type: 'success'
              })
              this.search()
            }
          })
        }).catch((error) => {
          console.log(error)
        })
      }
    },
     async goToSelectDept() {
      // 将所有部门的树形结构数据查询出来
      await deptApi.selectTree().then(res => {
        if (res.success) {
          this.treeData = res.data
        }
      })

      this.dialogTreeVisible = true
    },
    closeTree(){
      this.dialogTreeVisible = false
      this.saveDept.pid=-1
      this.saveDept.parentName=''
    },
    handleNodeClick(data) {
      this.saveDept.parentName = data.deptName
      this.saveDept.pid=data.id
    },
    handleTreeConfirm() {
      this.dialogTreeVisible = false
      this.$nextTick(()=>{
        this.$refs['form'].clearValidate("parentName")
      })
    },

    createData() {
      this.$refs['form'].validate(async (valid) => {
      if(! valid){
        return false
      }else {
        await deptApi.save(this.saveDept).then(res => {
        if(res.success){
          this.$message({
            message: '添加成功',
            type: 'success'
          })
          this.dialogFormVisible = false
          this.search()
        }
        })
      }
      })
    },
    updateData(){
      this.$refs['form'].validate(async(valid) => {
        if(!valid){
          return false
        }else{
          await deptApi.update(this.saveDept).then(res => {
            if(res.success){
              this.$message({
                message: '修改成功',
                type: 'success'
              })
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

<style>

</style>
