<template>
  <div>
    <!--左侧导航栏-用户所处部门树 -->
    <el-container width="200px" :style="{height:containerHeight+'px'}">
      <el-aside width="250px" class="el-aside">
        <el-tree
          :data="treeData"
          :props="defaultProps"
          node-key="id"
          empty-text="暂无数据"
          ref="tree"
          @node-click="handleNodeClick"
          default-expand-all
          highlight-current
          :expand-on-click-node="false"
        >
        </el-tree>
      </el-aside>
      <!--左侧导航栏-用户所处部门树 结束 -->

      <el-main>
        <!--查询表单-->
        <el-form :inline="true" :model="userModel" size="small" label-width="80px">
          <el-form-item label="用户账号">
            <el-input v-model="userModel.username" placeholder="请输入用户名称" style="width: 150px"></el-input>
          </el-form-item>
          <el-form-item label="用户昵称">
            <el-input v-model="userModel.nickname" placeholder="请输入用户昵称" style="width: 150px"></el-input>
          </el-form-item>
          <el-form-item label="真实姓名">
            <el-input v-model="userModel.realname" placeholder="请输入真实姓名" style="width: 150px"></el-input>
          </el-form-item>

          <el-form-item label="用户电话">
            <el-input v-model="userModel.phone" placeholder="请输入用户电话" style="width: 150px"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="onSubmit">查询</el-button>
            <el-button type="warning" icon="el-icon-refresh" @click="resetForm">重置</el-button>
            <el-button type="success" icon="el-icon-plus" @click="handleCreate">新增</el-button>
            <el-button type="danger" icon="el-icon-delete" @click="handleDeleteBatch">删除选中</el-button>
          </el-form-item>
        </el-form>

        <!-- 查询表单结束-->
        <!--数据表格-->
        <el-table :data="tableData" border stripe style="width: 100%" @cell-click="handleDeptCellClick"
                  @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column label="序号" width="50">
            <template slot-scope="scope">{{
                (start - 1) * size +
                scope.$index + 1
              }}
            </template>
          </el-table-column>
          <el-table-column label="用户账号" prop="username"></el-table-column>
          <el-table-column label="用户昵称" prop="nickname" width="100"></el-table-column>
          <el-table-column label="真实姓名" prop="realname" width="100"></el-table-column>
          <el-table-column label="用户性别" width="60">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.gender===2" type="danger">女</el-tag>
              <el-tag v-if="scope.row.gender===1">男</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="所属部门" prop="deptName">
            <template slot-scope="scope">
              <el-tooltip content="单击查看部门层次关系" placement="top" effect="light">
                <span class="dept-cell-hover" @click="handleDeptCellClick(scope.row, {property: 'deptName'}, $event)">
                  {{ scope.row.deptName }}
                </span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="用户邮箱" prop="email" width="135"></el-table-column>
          <el-table-column label="用户电话" prop="phone" width="120"></el-table-column>
          <el-table-column label="头像" width="80">
            <template slot-scope="scope">
              <a :href="scope.row.avatar" target="_blank">
                <el-tag>查看大图</el-tag>
              </a>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="250">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">修改</el-button>
              <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
              <el-button type="warning" size="mini" @click="handleAssignRole(scope.row)">角色分配</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!--分页组件-->
        <el-pagination background layout="total, prev, pager, next, jumper" :total="total" :current-page="start"
                       :page-size="size" @current-change="search"
        >
        </el-pagination>
      </el-main>

      <!--新增修改用户对话框-->
      <el-dialog :title="titleMap[dialogStatus]" :visible.sync="dialogVisible" width="660px">
        <el-form :inline="true" :model="saveUser" size="small" label-width="120px" :rules="rules" ref="form">
          <el-form-item label="用户账号" prop="username">
            <el-input v-model="saveUser.username" placeholder="请输入用户名称" style="width: 150px"></el-input>
          </el-form-item>
          <el-form-item label="用户密码" prop="password" v-if="dialogStatus==='create'">
            <el-input v-model="saveUser.password" placeholder="请输入用户密码" style="width: 150px"></el-input>
          </el-form-item>
          <el-form-item label="用户昵称" prop="nickname">
            <el-input v-model="saveUser.nickname" placeholder="请输入用户昵称" style="width: 150px"></el-input>
          </el-form-item>
          <el-form-item label="真实姓名" prop="realname">
            <el-input v-model="saveUser.realname" placeholder="请输入真实姓名" style="width: 150px"></el-input>
          </el-form-item>
          <el-form-item label="用户性别" prop="gender">
            <el-radio-group v-model="saveUser.gender" style="width: 150px">
              <el-radio :label="1">男</el-radio>
              <el-radio :label="2">女</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="用户邮箱" prop="email">
            <el-input v-model="saveUser.email" placeholder="请输入用户邮箱" style="width: 150px"></el-input>
          </el-form-item>
          <el-form-item label="用户电话" prop="phone">
            <el-input v-model="saveUser.phone" placeholder="请输入用户电话" style="width: 150px"></el-input>
          </el-form-item>
          <el-form-item label="用户部门" prop="deptName">
            <el-input v-model="saveUser.deptName" placeholder="请输入用户部门" style="width: 150px"
                      @click.native="goToDeptSelectTree"
            >
            </el-input>
          </el-form-item>
          <el-form-item label="用户头像" prop="avatar">
            <el-upload class="avatar-uploader" :action="uploadPath"
                       :show-file-list="false"
                       :on-success="handleAvatarSuccess"
                       :before-upload="beforeAvatarUpload"
                       :headers="{token:uploadToken}"
            >
              <img v-if="saveUser.avatar" :src="saveUser.avatar" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
          </el-form-item>


          <el-form-item label="账户是否未过期" v-if="dialogStatus==='update'"  >
            <el-switch v-model="saveUser.accountNonExpired"
                       :active-value="true" :inactive-value="false"
                       active-text="未过期" inactive-text="已过期"
                       style="width: 150px;"
            >
            </el-switch>
          </el-form-item>
          <el-form-item label="账户是否未锁定" v-if="dialogStatus==='update'">
            <el-switch v-model="saveUser.accountNonLocked"
                       :active-value="true" :inactive-value="false"
                       active-text="未锁定" inactive-text="已锁定"
                       style="width: 150px;"
            >
            </el-switch>
          </el-form-item>
          <el-form-item label="账户是否可用" v-if="dialogStatus==='update'" >
            <el-switch v-model="saveUser.enabled"
                       :active-value="true" :inactive-value="false"
                       active-text="未禁用" inactive-text="已禁用"
                       style="width: 150px;"
            >
            </el-switch>
          </el-form-item>
          <el-form-item label="密码是否未过期" v-if="dialogStatus==='update'" >
            <el-switch v-model="saveUser.credentialsNonExpired"
                       :active-value="true" :inactive-value="false"
                       active-text="未过期" inactive-text="已过期"
                       style="width: 150px;"
            >
            </el-switch>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible=false">取 消</el-button>
          <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确 定</el-button>
        </div>
      </el-dialog>
      <!--用戶新增修改对话框结束-->
      <!--部门树选择对话框-->
      <el-dialog title="部门选择" :visible.sync="deptDialogVisible" width="600px">
        <el-tree ref="deptTree"
                 :data="treeData"
                 :props="defaultProps"
                 node-key="id"
                 highlight-current
                 @node-click="handleDeptTreeNodeClick"
                 default-expand-all
                 empty-text="暂无数据"
        >
        </el-tree>
        <div slot="footer" class="dialog-footer">
          <el-button @click="closeTree">取 消</el-button>
          <el-button type="primary" @click="handleTreeConfirm">确 定</el-button>
        </div>
      </el-dialog>
      <!--部门树选择对话框结束-->
      <!--角色分配对话框-->
      <el-dialog title="角色分配" :visible.sync="roleDialogVisible" width="600px">
        <el-checkbox-group v-model="roleIds">
          <el-checkbox v-for="item in roleList" :key="item.id" :label="item.id">{{ item.roleName }}</el-checkbox>
        </el-checkbox-group>
        <div slot="footer" class="dialog-footer">
          <el-button @click="roleDialogVisible=false">取 消</el-button>
          <el-button type="primary" @click="handleRoleConfirm">确 定</el-button>
        </div>
      </el-dialog>
    </el-container>
  </div>

</template>
<script>
import authUserApi from '@/api/authUser'
import deptApi from '@/api/dept'
import container from 'element-ui/packages/container'
import { getToken } from '@/utils/auth'
import authRoleApi from '@/api/authRole'

export default {
  computed: {
    container() {
      return container
    }
  },
  data() {
    return {
      userModel: {},
      tableData: [],
      multipleSelection: [],
      //左侧导航栏-用户所处部门树相关信息
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'deptName'
      },
      containerHeight: 0,
      //分页信息
      start: 1,
      size: 5,
      total: 0,
      //新增修改用户对话框相关信息
      dialogVisible: false,
      dialogStatus: 'create',
      titleMap: {
        create: '新增用户',
        update: '修改用户'
      },
      saveUser: {},
      rules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入用户密码', trigger: 'blur' }
        ],
        nickname: [
          { required: true, message: '请输入用户昵称', trigger: 'blur' }
        ],
        realname: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' }
        ],
        gender: [
          { required: true, message: '请选择性别', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入用户电话', trigger: 'blur' }
        ],
        deptName: [
          { required: true, message: '请选择部门', trigger: 'blur' }
        ]
      },
      uploadPath: 'http://localhost:8088/rental/oss/upload',
      uploadToken: getToken(),
      // 部门树选择对话框信息
      deptDialogVisible: false,
      // 角色分配对话框信息
      roleDialogVisible: false,
      roleList: [],
      roleIds: [],
      bindUserId: 0 //表示要分配角色的用户id
    }
  },
  created() {
    this.userModel.deptId = 0
    this.getTreeData()
    this.search()
  },
  mounted() {
    this.containerHeight = window.innerHeight - 85
  },
  methods: {
    async search(start = 1) {
      this.start = start
      try {
        const response = await authUserApi.search(this.start, this.size, this.userModel)
        if (response.success) {
          this.tableData = response.data.records
          this.total = response.data.total
        }
      } catch (error) {
        console.log(error)
      }

    },
    async getTreeData() {
      const res = await deptApi.selectTree()
      if (res.success) {
        this.treeData = res.data

      }
    },
    handleNodeClick(data) {
      this.userModel.deptId = data.id
      this.search()
    },
    onSubmit() {
      this.search()
    },
    resetForm() {
      this.userModel = {}
      this.userModel.deptId = 0
      this.search()
    },
    handleCreate() {
      this.dialogStatus = 'create'
      this.dialogVisible = true
      this.saveUser = {}
      this.$nextTick().then(
        () => {
          this.$refs['form'].clearValidate()
        }
      )

    },
    handleUpdate(row) {
      this.dialogStatus = 'update'
      this.dialogVisible = true
      this.saveUser = JSON.parse(JSON.stringify(row))
      console.log(this.saveUser)
      // 同时确保 gender 字段类型正确
      this.saveUser.gender = Number(this.saveUser.gender)

    },
    handleDelete(row) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',

        type: 'warning'
      }).then(async() => {
        await authUserApi.delete(row.id).then(res => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            this.search()
          }
        })
      })
    },
    handleDeleteBatch() {
      if (this.multipleSelection.length === 0) {
        this.$message({
          message: '请选择要删除的记录',
          type: 'warning'
        })
        return false
      } else {
        this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async() => {
          // 确定
          await authUserApi.delete(this.multipleSelection).then(res => {
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
    handleSelectionChange(val) {

      this.multipleSelection = []
      val.forEach(element => {
        this.multipleSelection.push(element.id)
      })


    },
    handleAvatarSuccess(res, file) {
      this.saveUser.avatar = res.data
      this.$forceUpdate()//强制渲染
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg' || 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },
    goToDeptSelectTree() {
      this.deptDialogVisible = true
    },
    handleDeptTreeNodeClick(data) {
      this.saveUser.deptId = data.id
      this.saveUser.deptName = data.deptName

    },
    handleTreeConfirm() {
      this.deptDialogVisible = false
      this.$nextTick().then(
        () => {
          this.$refs['form'].clearValidate('deptName')
        }
      )
    },
    closeTree() {
      this.deptDialogVisible = false
    },
    handleDeptCellClick(row, column, cell, event) {
      // 确保点击的是部门列
      if (column.property === 'deptName') {
        const deptId = row.deptId
        // 从行数据获取部门ID
        if (deptId) {
          // 使用Element UI的setCurrentKey方法高亮树节点
          this.$refs.tree.setCurrentKey(deptId)

        }
      }
    },
    createData() {

      // 在验证之前确保数据已经正确绑定
      this.$forceUpdate()
      this.$refs['form'].validate(async valid => {
        if (!valid) {
          return false
        } else {
          try {
            this.saveUser.isAccountNonExpired = true
            this.saveUser.isAccountNonLocked = true
            this.saveUser.isCredentialsNonExpired = true
            this.saveUser.isEnabled = true
            const response = await authUserApi.save(this.saveUser)
            if (response.success) {
              this.dialogVisible = false
              await this.search()
            }
          } catch (error) {
            console.log(error)
          }
        }
      })

    },
    updateData() {
      this.$refs['form'].validate(async valid => {
        if(! valid){
           return false
        }else {
          try {
            const response = await authUserApi.update(this.saveUser)
            if (response.success) {
              this.dialogVisible = false
              await this.search()
            }
          } catch (error) {
            console.log(error)
          }
        }
      })
    },
    async handleAssignRole(row) {
      this.roleDialogVisible = true
      this.bindUserId = row.id
      try {
        const res = await authRoleApi.list()
        const resRole = await authUserApi.getRolesOfUser(row.id)
        if (res.success && resRole.success) {
          this.roleList = res.data
          this.roleIds = resRole.data
        }
      } catch (e) {
      }

    },
    async handleRoleConfirm() {
      try {
        const res = await authUserApi.assignRole(this.bindUserId, this.roleIds)
        if (res.success) {
          this.roleDialogVisible = false
        }
      } catch (e) {
      }

    }

  }

}
</script>
<style>
.el-aside {
  background-color: #fff;
  border-right: 2px solid #e6e6e6;
  border-top: 2px solid #e6e6e6;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
