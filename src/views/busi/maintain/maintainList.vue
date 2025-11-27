<template>
  <div>
    <el-main>
      <!--查询表单-->
      <el-form :inline="true" :model="maintainModel" size="mini">
        <el-form-item label="车牌号">
          <el-input v-model.trim="maintainModel.autoNum" placeholder="请输入车牌号"></el-input>
        </el-form-item>
        <el-form-item label="保养项目">
          <el-input v-model.trim="maintainModel.item" placeholder="请输入保养项目"></el-input>
        </el-form-item>
        <el-form-item label="保养地点">
          <el-input v-model.trim="maintainModel.location" placeholder="请输入保养地点"></el-input>
        </el-form-item>
        <el-form-item label="花费金额下限">
          <el-input-number :min="0" v-model="maintainModel.lowCost" placeholder="请输入花费金额下限"></el-input-number>
        </el-form-item>
        <el-form-item label="花费金额上限">
          <el-input-number :min="0" v-model="maintainModel.highCost" placeholder="请输入花费金额上限"></el-input-number>
        </el-form-item>
        <el-form-item label="保养时间">
          <el-date-picker
            v-model="maintainModel.timeVal"
            type="datetimerange"
            :picker-options="pickerOptions"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            align="right"
            value-format="yyyy-MM-dd HH:mm:ss"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button type="success" @click="handleCreate">新增</el-button>
          <el-button type="warning" @click="resetForm">重置</el-button>
          <el-button type="danger" @click="deleteBatch">删除选中</el-button>
        </el-form-item>
      </el-form>
      <!--数据表格-->
      <el-table
        :data="tableData" stripe border style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column type="index" width="50" label="序号">
          <template slot-scope="scope">
            {{ (start - 1) * size + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="车牌号" prop="autoNum"></el-table-column>
        <el-table-column label="保养时间" prop="maintainTime">

        </el-table-column>
        <el-table-column label="保养项目" prop="item"></el-table-column>
        <el-table-column label="保养地点" prop="location"></el-table-column>
        <el-table-column label="花费金额" prop="cost"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">修改</el-button>
            <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @current-change="search"
        :current-page="start"
        :page-size="size"
        layout="total, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
      <!--新增修改保养记录对话框-->
      <el-dialog :title="titleMap[dialogStatus]" :visible.sync="dialogVisible" width="40%">

        <el-form :model="saveMaintain" label-width="80px"
                 :rules="rules" ref="form" size="small"
        >
          <el-form-item label="车牌号码" prop="autoNum">
            <el-select v-model="saveMaintain.autoNum"
                       placeholder="请选择" style="width:100%"
                       @change="handleAutoChange"
            >
              <el-option v-for="item in autoList"
                         :key="item.id" :label="item.autoNum"
                         :value="item.autoNum"
              >
                <span style="float: left">{{ item.autoNum }}</span>
                <span style="float: right; color: #8492a6;font-size: 13px">
                  未保次数:{{ item.expectedNum - item.actualNum }}
                </span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="保养时间" prop="maintainTime">
            <el-date-picker v-model="saveMaintain.maintainTime"
                            type="datetime" placeholder="选择日期"
                            value-format="yyyy-MM-dd HH:mm:ss"
            />
          </el-form-item>
          <el-form-item label="保养项目" prop="item">
            <el-input v-model="saveMaintain.item"
                      placeholder="请输入保养项目"
            ></el-input>
          </el-form-item>
          <el-form-item label="保养地点" prop="location">
            <el-input v-model="saveMaintain.location"
                      placeholder="请输入保养地点"
            ></el-input>
          </el-form-item>
          <el-form-item label="保养费用" prop="cost">
            <el-input-number v-model="saveMaintain.cost"
                             placeholder="请输入保养费用"
            ></el-input-number>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消
          </el-button>
          <el-button type="primary" @click="dialogStatus ==='create' ? createData() : updateData()">确 定</el-button>
        </div>
      </el-dialog>
    </el-main>

  </div>
</template>
<script>
import maintainApi from '@/api/maintain'
import autoInfoApi from '@/api/autoInfo'

export default {
  data() {
    return {
      maintainModel: {},
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
      tableData: [],
      start: 1,
      size: 6,
      total: 0,
      multipleSelection: [],
      dialogVisible: false,
      dialogStatus: 'create',
      titleMap: {
        create: '新增保养记录',
        update: '修改保养记录'
      },
      saveMaintain: {},
      autoList: [],
      rules: {
        autoNum: [
          { required: true, message: '请选择车牌号码', trigger: 'blur' }
        ],
        maintainTime: [
          { required: true, message: '请选择保养时间', trigger: 'blur' }
        ],
        item: [
          { required: true, message: '请输入保养项目', trigger: 'blur' }
        ],
        location: [
          { required: true, message: '请输入保养地点', trigger: 'blur' }
        ],
        cost: [
          { required: true, message: '请输入保养费用', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.search()
    this.getAutoList()
  },
  methods: {
    async search(start = 1) {
      this.start = start
      try {
        const res = await maintainApi.search(this.start, this.size, this.maintainModel)
        if (res.success) {

          this.tableData = res.data.records
          this.total = res.data.total
        }
      } catch (e) {
        console.log(e)
      }

    },
    async getAutoList() {
      try {
        const res = await autoInfoApi.list()
        if (res.success) {
          this.autoList = res.data
        }
      } catch (e) {
        console.log(e)
      }
    },
    handleSearch() {
      if (this.maintainModel.timeVal != null) {
        this.maintainModel.lowMaintainTime = this.maintainModel.timeVal[0]
        this.maintainModel.highMaintainTime = this.maintainModel.timeVal[1]
      }
      this.search()
    },
    handleCreate() {
      this.dialogVisible = true
      this.dialogStatus = 'create'
      this.saveMaintain = {}
      this.$nextTick(() => {
        this.$refs['form'].clearValidate()
      })

    },
    handleAutoChange(val) {
      // 根据车牌号查找对应的车辆信息
      const selectedAuto = this.autoList.find(item => item.autoNum === val)
      // 如果找到了对应的车辆，设置autoId
      if (selectedAuto) {
        this.saveMaintain.autoId = selectedAuto.id

      }

    },
    resetForm() {
      this.maintainModel = {}
      this.search()
    },

    handleSelectionChange(val) {
      this.multipleSelection = []
      val.forEach(element => {
        this.multipleSelection.push(element.id)
      })
    },
    deleteBatch() {
      if (this.multipleSelection.length === 0) {
        this.$message.warning('请选择要删除的数据')
        return false
      } else {
        this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async() => {
          const res = await maintainApi.delete(this.multipleSelection)
          if (res.success) {
            this.$message.success('删除成功')
            this.search()
          }
        })
      }
    },
    handleUpdate(row) {
      this.dialogVisible = true
      this.dialogStatus = 'update'
      this.saveMaintain = Object.assign({}, row)

    },
    handleDelete(row) {
      this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const res = await maintainApi.delete(row.id)
        if (res.success) {
          this.$message.success('删除成功')
          this.search()
        }
      })

    },
    createData() {
      this.$refs['form'].validate(async valid => {
        if (!valid) {
          return false
        } else {
          try {
            const res = await maintainApi.save(this.saveMaintain)
            if (res.success) {
              this.$message.success('保存成功')
              this.dialogVisible = false
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
        if (!valid) {
          return false
        } else {
          try {
            const res = await maintainApi.update(this.saveMaintain)
            if (res.success) {
              this.$message.success('修改成功')
              this.dialogVisible = false
              this.search()
            }
          } catch (e) {
            console.log(e)
          }
        }
      })
    }

  }
}

</script>
<style>

</style>

