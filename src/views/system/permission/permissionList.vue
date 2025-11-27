<template>
  <el-main>
    <el-button type="primary" @click="handleCreate">新增</el-button>
    <!--显示表格-->
    <el-table :data="tableData" style="width: 100%" border stripe row-key="id"
              :tree-props="{children: 'children',hasChildren: 'hasChildren'}"
    >
      <el-table-column prop="permissionLabel" label="菜单名称"></el-table-column>
      <el-table-column prop="permissionType" label="菜单类型">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.permissionType===0" type="warning">根目录</el-tag>
          <el-tag v-else-if="scope.row.permissionType===1" type="success">菜单</el-tag>
          <el-tag v-else-if="scope.row.permissionType===2">按钮</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="routeName" label="路由名称"></el-table-column>
      <el-table-column prop="routePath" label="路由地址"></el-table-column>
      <el-table-column prop="routeUrl" label="组件路径"></el-table-column>
      <el-table-column prop="icon" label="菜单图标">
        <template slot-scope="scope">
          <i :class="scope.row.icon" v-if="scope.row.icon.indexOf('el-icon')!=-1"></i>
          <svg-icon :icon-class="scope.row.icon"></svg-icon>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200px">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 新增修改菜单对象的对话框 -->
    <el-dialog :title="titleMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :model="savePermission" ref="form" :rules="rules" label-width="120px" size="small">

        <el-form-item label="上级菜单" prop="parentLabel">
          <el-input v-model="savePermission.parentLabel" placeholder="请选择上级菜单"
                    @click.native="goToSelectPermission" :readonly="true"
          ></el-input>
        </el-form-item>
        <el-form-item label="菜单名称" prop="permissionLabel">
          <el-input v-model="savePermission.permissionLabel" placeholder="请输入权限菜单名称"></el-input>
        </el-form-item>
        <el-form-item label="菜单类型" prop="permissionType">
          <el-select v-model="savePermission.permissionType" placeholder="请选择">
            <el-option
              v-for="(item,index) in typeList"
              :key="item.index"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="权限标识" prop="permissionCode">
          <el-input v-model="savePermission.permissionCode" placeholder="请输入权限标识"></el-input>
        </el-form-item>
        <el-form-item label="组件路径" prop="routeUrl" v-if="savePermission.permissionType!=2">
          <el-input v-model="savePermission.routeUrl" placeholder="请输入组件路径"
          ></el-input>
        </el-form-item>
        <el-form-item label="菜单图标" prop="icon">
          <el-select v-model="savePermission.icon" placeholder="请选择">
            <el-option
              v-for="item in icons"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <!-- 新增和修改用的同一个对话框，要区分状态 -->
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 新增修改菜单对象的对话框结束 -->
    <!--菜单树对话框-->
    <el-dialog title="选择上级菜单" :visible.sync="dialogTreeVisible" width="30%">
      <el-tree :data="treeData" :props="defaultProps" @node-click="handleNodeClick"
               default-expand-all
               empty-text="未获取菜单的数据"
               :highlight-current="true"
      >

      </el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeTree">取 消</el-button>
        <el-button type="primary" @click="handleTreeConfirm">确 定</el-button>
      </div>
    </el-dialog>
  </el-main>
</template>

<script>
import permissionApi from '@/api/permission'

export default {
  data() {
    return {
      tableData: [],
      /* 新增权限菜单对话框数据 */
      savePermission: {},
      dialogStatus: 'create',
      dialogFormVisible: false,
      titleMap: {
        create: '新增权限菜单',
        update: '修改权限菜单'
      },
      typeList: [
        { value: '0', label: '根目录' },
        { value: '1', label: '菜单' },
        { value: '2', label: '按钮' }
      ],
      rules: {
        parentLabel: [
          { required: true, message: '请选择上级菜单', trigger: 'change' }
        ],
        permissionLabel: [
          { required: true, message: '请输入菜单名称', trigger: 'blur' }
        ],
        permissionType: [
          { required: true, message: '请选择菜单类型', trigger: 'change' }
        ],
        permissionCode: [
          { required: true, message: '请输入权限标识', trigger: 'blur' }
        ],
        routeUrl: [
          { required: true, message: '请输入组件路径', trigger: 'blur' }
        ]
      },
      icons: [
        { value: 'component', label: '根目录' },
        { value: 'guide', label: '菜单' },
        { value: 'el-icon-plus', label: '新增' },
        { value: 'el-icon-delete', label: '删除' },
        { value: 'el-icon-edit', label: '修改' },
        { value: 'el-icon-search', label: '查询' }
      ],
      /* 上级菜单对对话框数据 */
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'permissionLabel'
      },
      dialogTreeVisible: false

    }
  },
  created() {
    this.search()
  },
  methods: {
    async search() {
      await permissionApi.search().then(res => {
        if (res.success) {
          this.tableData = res.data
        }
      })

    },
    handleCreate() {
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.savePermission = {}
      this.$nextTick().then(
        () => {
          this.$refs['form'].clearValidate()
        }
      )
    },
    handleUpdate(row) {
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.savePermission = JSON.parse(JSON.stringify(row))

    },
    async goToSelectPermission() {
      await permissionApi.selectTree().then(res => {
        if (res.success) {
          this.treeData = res.data
          this.dialogTreeVisible = true
        }
      })

    },
    closeTree() {
      this.dialogTreeVisible = false
    },
    handleNodeClick(data) {
      this.savePermission.parentLabel = data.permissionLabel
      this.savePermission.pid = data.id

    },
    handleTreeConfirm() {
      this.dialogTreeVisible = false
      this.$nextTick().then(() => {
        this.$refs['form'].clearValidate('parentLabel')
      })
    },
    async createData() {
    console.log(this.savePermission)
     await this.$refs['form'].validate(async(valid) => {
        if (!valid) {
          return false
        } else {

          await permissionApi.save(this.savePermission).then(res => {
            if (res.success) {
              this.$message({
                message: '添加成功',
                type: 'success'
              })
              this.dialogFormVisible = false
              this.search()
            }
          }).catch(e=> {
            console.log(e)
          })
        }
      })

    },
    async updateData() {
      this.$refs['form'].validate(async(valid) => {
        if (!valid) {
          return false
        } else {
          await permissionApi.update(this.savePermission).then(res => {
            if (res.success) {
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

    },
    async handleDelete(row) {
      await permissionApi.hasChildren(row.id).then(res => {
        if (res.message === '有') {
          this.$message({
            message: '此菜单有子菜单，不能删除',
            type: 'warning'
          })
          return false
        } else {
          this.$confirm('确定要删除吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(async() => {
            await permissionApi.delete(row.id).then(res => {
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
      })
    }

  }
}

</script>
<style>

</style>
