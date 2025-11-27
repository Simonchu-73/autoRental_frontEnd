<template>
  <div>
    <el-main>
      <!-- 查询表单-->
      <el-form :inline="true" :model="roleModel" size="small" label-width="80px">
        <el-form-item label="角色名称">
          <el-input v-model="roleModel.roleName" placeholder="请输入角色名称" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="success" icon="el-icon-search" @click="search()">查询</el-button>
          <el-button type="warning" icon="el-icon-refresh" @click="resetForm">重置</el-button>
          <el-button type="primary" icon="el-icon-plus" @click="handleCreate">新增</el-button>
          <el-button type="danger" icon="el-icon-delete" @click="deleteBatchRole">删除选中</el-button>
        </el-form-item>
      </el-form>
      <!-- 角色展示表格-->
      <el-table :data="roleList" size="small" border stripe row-key="id"
                @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55">
        </el-table-column>
        <el-table-column label="序号">
          <template slot-scope="scope">
            {{ (start - 1) * size + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="角色名称" prop="roleName">
        </el-table-column>
        <el-table-column label="角色描述" prop="remark"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">修改</el-button>
            <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
            <el-button type="warning" size="mini" @click="handlePermission(scope.row)">权限分配</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--角色展示表格结束 -->
      <!-- 分页开始 -->
      <el-pagination
        layout="total,prev, pager, next,jumper"
        :total="total"
        :current-page="start"
        :page-size="size"
        @current-change="search"
      >
      </el-pagination>
      <!--新增修改对话框开始-->
      <el-dialog :title="titleMap[dialogStatus]" :visible.sync="dialogVisible" width="500px">
        <el-form :model="saveRole" label-width="80px" :rules="rules" ref="form">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="saveRole.roleName" placeholder="请输入角色名称"></el-input>
          </el-form-item>
          <el-form-item label="角色编码" prop="roleCode">
            <el-input v-model="saveRole.roleCode" placeholder="请输入角色编码"></el-input>
          </el-form-item>
          <el-form-item label="创建人ID" prop="createrId">
            <el-input v-model="saveRole.createrId" readonly></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="remark">
            <el-input v-model="saveRole.remark" type="textarea" placeholder="请输入角色描述"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="closeForm">取消</el-button>
          <el-button @click="dialogStatus==='create'?createData():updateData()" type="primary">确 定</el-button>
        </div>
      </el-dialog>
      <!--新增修改对话框结束-->
      <!--权限分配树对话框开始-->
      <el-dialog :title="treeTitle" :visible.sync="dialogTreeVisible" width="500px">
        <el-tree
          :data="treeData"
          :default-checked-keys="defaultCheckedKeys"
          :props="defaultProps"
          show-checkbox
          node-key="id"
          ref="tree"
          empty-text="暂无数据"
          check-strictly
        >
        </el-tree>
        <div slot="footer" class="dialog-footer">
          <el-button @click="closeTree">取消</el-button>
          <el-button @click="updatePermission" type="primary">确 定</el-button>
        </div>
      </el-dialog>
      <!--权限分配树对话框结束-->
    </el-main>
  </div>

</template>
<script>
import authRoleApi from '@/api/authRole'

export default {
  data() {
    return {
      roleModel: {},
      roleList: [],
      start: 1,
      size: 5,
      total: 0,
      multipleSelection: [],
      // 新增修改角色的对话框相关数据信息
      saveRole: {},
      titleMap: {
        create: '新增角色',
        update: '修改角色'
      }
      ,
      dialogVisible: false,
      dialogStatus: 'create',
      rules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleCode: [
          { required: true, message: '请输入角色编码', trigger: 'blur' }
        ]
      },
      // 权限分配树对话框相关数据信息
      treeData: [],
      treeTitle: '',
      defaultCheckedKeys: [],
      defaultProps: {
        label: 'permissionLabel',
        children: 'children'
      },
      dialogTreeVisible: false,
      roleId: 0
    }
  },
  created() {
    this.search()
  },
  methods: {
    async search(start = 1) {
      this.start = start
      this.roleModel.createrId = this.$store.state.user.createrId
      await authRoleApi.getRoleList(this.start, this.size, this.roleModel).then(res => {
        if (res.success) {
          this.roleList = res.data.records
          this.total = res.data.total
        }
      }).catch(error => {
        console.log(error)
      })

    },
    resetForm() {
      this.roleList = []
      this.roleModel = {}
      this.search()
    },
    handleCreate() {
      this.saveRole = {}
      this.dialogStatus = 'create'
      this.dialogVisible = true
      this.saveRole.createrId = this.$store.state.user.createrId
      this.$nextTick().then(
        () => {
          this.$refs['form'].clearValidate()
        }
      )
    },
    closeForm() {
      this.dialogVisible = false
      this.saveRole = {}
      this.$nextTick().then(() => {
        this.$refs['form'].clearValidate()
      })
    },
    handleUpdate(row) {
      this.dialogStatus = 'update'
      this.dialogVisible = true
      this.saveRole = row
    },
    async handleDelete(row) {
      try {
        const hasUser = await authRoleApi.hasUser(row.id)
        if (hasUser.message === '有') {
          this.$message.warning('该角色下有用户，请先删除用户')
        } else {
          this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(async() => {
            // 确定
            await authRoleApi.delete(row.id).then(res => {
              if (res.success) {
                this.$message({
                  type: 'success',
                  message: '删除成功!'
                })
                this.search()
              }
            })
          })
        }

      } catch (error) {
        this.$message.error('删除失败')
      }
    },
    async handleSelectionChange(val) {
      this.multipleSelection = []
      val.forEach(element => {
        this.multipleSelection.push(element.id)
      })
    },
    async deleteBatchRole() {
      this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        // 确定
        try {
          const res = await authRoleApi.delete(this.multipleSelection)
          if (res.success) {
            this.$message({
              type: 'success',
              message: '已成功删除没有用户关联的角色'
            })
            await this.search()
          }
        } catch (error) {
          this.$message.error('删除失败')
        }
      })
    },
    createData() {
      this.$refs['form'].validate(valid => {
        if (!valid) {
          return false
        } else {
          authRoleApi.save(this.saveRole).then(res => {
            if (res.success) {
              this.$message({
                message: '添加成功',
                type: 'success'
              })
            }
            this.dialogVisible = false
            this.search()
          })
        }
      })
    },
    updateData() {
      this.$refs['form'].validate(valid => {
        if (!valid) {
          return false
        } else {
          authRoleApi.update(this.saveRole).then(res => {
            if (res.success) {
              this.$message({
                message: '修改成功',
                type: 'success'

              })
            }
            this.dialogVisible = false
            this.search()
          })
        }
      })
    },
    async handlePermission(row) {
      this.dialogTreeVisible = true
      this.treeTitle = `${row.roleName}权限分配`
      this.roleId = row.id
      const params = { 'roleId': this.roleId, 'userId': this.$store.getters.userId }
      const res = await authRoleApi.selectPermissionTree(params)
      if (res.success) {
        this.treeData = res.data.permissionList
        this.defaultCheckedKeys = res.data.checkedIds
        console.log(res.data)
      }
    },
    async updatePermission() {
      let permissionIds = this.$refs.tree.getCheckedKeys()
      const res = await authRoleApi.assignPermission(this.roleId, permissionIds)
      if (res.success) {
        this.$message({
          message: '权限分配成功',
          type: 'success'
        })
        this.dialogTreeVisible = false
      }
    },
    closeTree() {
      this.dialogTreeVisible = false
    }
  }

}

</script>
<style>

</style>
