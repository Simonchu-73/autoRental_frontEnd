<template>
  <div>
    <el-main>
      <!--查询表单-->
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
        <el-form-item label="车辆状态">
          <el-select v-model="infoModel.status" placeholder="请选择">
            <el-option label="未租" value="0"></el-option>
            <el-option label="已租" value="1"></el-option>
            <el-option label="维保" value="2"></el-option>
            <el-option label="自用" value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="租金下限">
          <el-input v-model="infoModel.lowRent" placeholder="请输入租金下限"></el-input>
        </el-form-item>
        <el-form-item label="租金上限">
          <el-input v-model="infoModel.highRent" placeholder="请输入租金上限"></el-input>
        </el-form-item>
        <el-form-item label="上牌日期">
          <el-date-picker v-model="infoModel.registrationDateVal" type="daterange" align="right" unlink-panels
                          range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
                          :picker-options="pickerOptions" value-format="yyyy-MM-dd"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" icon="el-icon-search">查询</el-button>
          <el-button type="warning" @click="resetForm" icon="el-icon-refresh">重置</el-button>
          <el-button type="success" @click="handleAdd" icon="el-icon-plus">新增</el-button>
          <el-button type="danger" @click="handleDeleteBatch" icon="el-icon-delete">批量删除</el-button>
        </el-form-item>
      </el-form>
      <!--查询表单结束-->
      <!--数据表格-->
      <el-table :data="tableData" border stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
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
        <el-table-column prop="color" label="颜色" width="100" >
          <template slot-scope="scope">
            <span
              :style="{ background: scope.row.color, height:
              '20px', width: '50px', display: 'inline-block' }"
            ></span>
          </template>
        </el-table-column>
        <el-table-column label="汽车排量" prop="displacement" width="100">
          <template slot-scope="scope">
            {{ scope.row.displacement+scope.row.unit }}
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
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status == 0">未租</el-tag>
            <el-tag v-else-if="scope.row.status == 1">已租</el-tag>
            <el-tag v-else-if="scope.row.status == 2">维保</el-tag>
            <el-tag v-else-if="scope.row.status == 3">自用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="应保次数" prop="expectedNum"></el-table-column>
        <el-table-column label="已保次数" prop="actualNum"></el-table-column>
        <el-table-column label="操作" width="250">
          <template slot-scope="scope">
            <el-button type="primary"
                       @click="handleUpdate(scope.row)" icon="el-icon-edit"
            >修改
            </el-button>
            <el-button type="danger"
                       @click="handleDelete(scope.row)" icon="el-icon-delete"
            >删除
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
    </el-main>
    <!--新增修改表单-->
    <el-dialog :title="titleMap[dialogStatus]" :visible.sync="dialogVisible" width="800px">
      <el-form ref="form" :model="saveInfo" label-width="120px" :inline="true" :rules="rules">
        <el-form-item label="所属厂商" prop="makerId">
          <el-select v-model="saveInfo.makerId" placeholder="请选择"  @change="handleMakerChange">
            <el-option v-for="item in makerList" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="车辆品牌" prop="brandId">
          <el-select v-model="saveInfo.brandId" placeholder="请选择">
            <el-option v-for="item in brandList" :key="item.id" :label="item.brandName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="车辆类型" prop="infoType">
          <el-radio-group v-model="saveInfo.infoType">
            <el-radio :label="0">燃油车</el-radio>
            <el-radio :label="1">纯电车</el-radio>
            <el-radio :label="2">混动车</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="车牌号码" prop="autoNum">
          <el-input v-model="saveInfo.autoNum" placeholder="请输入车牌号码"></el-input>
        </el-form-item>
        <el-form-item label="颜色" prop="color">
          <el-color-picker v-model="saveInfo.color" ></el-color-picker>
        </el-form-item>
        <el-form-item label="排量" prop="displacement">
          <template>
            <el-input-number v-model="saveInfo.displacement" :step="0.1" :min="0"></el-input-number>
          </template>
        </el-form-item>
        <el-form-item label="排量计量单位" prop="unit">
          <el-radio-group v-model="saveInfo.unit">
            <el-radio-button label="L">L</el-radio-button>
            <el-radio-button label="T">T</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="行驶里程" prop="mileage">
          <el-input-number v-model="saveInfo.mileage" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="日租金额" prop="rent">
          <el-input-number v-model="saveInfo.rent" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="上牌时间" prop="registrationDate">
          <el-date-picker
            v-model="saveInfo.registrationDate"
            type="date"
            placeholder="选择日期"
            value-format="yyyy-MM-dd"><!--不加格式可能出现时间误差-->

          </el-date-picker>
        </el-form-item>
        <el-form-item label="押金" prop="deposit">
          <el-input-number v-model="saveInfo.deposit" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="车辆状态" prop="status">
          <el-radio-group v-model="saveInfo.status">
            <el-radio :label="0">未租</el-radio>
            <el-radio :label="1">已租</el-radio>
            <el-radio :label="2">维保</el-radio>
            <el-radio :label="3">自用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="车辆图片" prop="pic">

          <el-upload class="pic-uploader" :action="uploadPath"
                     :show-file-list="false"
                     :on-success="handlePicSuccess"
                     :before-upload="beforePicUpload"
                     :headers="{token:uploadToken}"
          >
            <img v-if="saveInfo.pic" :src="saveInfo.pic" class="pic">
            <i v-else class="el-icon-plus pic-uploader-icon"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible=false">取 消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import autoInfoApi from '@/api/autoInfo'
import autoBrandApi from '@/api/autoBrand'
import autoMakerApi from '@/api/autoMaker'
import {getToken} from '@/utils/auth'


export default {

  data() {
    return {
      infoModel: {},
      tableData: [],
      start: 1,
      size: 5,
      total: 0,
      saveInfo: {},
      makerList: [],
      brandList: [],
      multipleSelection:[],
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
      dialogVisible: false,
      dialogStatus: 'create',
      titleMap: {
        create: '新增车辆信息',
        update: '修改车辆信息'
      },
      uploadPath: process.env.VUE_APP_BASE_API + 'rental/oss/upload',
      uploadToken: getToken(),
      rules: {
        makerId: [
          {required: true, message: '请选择车辆厂商', trigger: 'blur'}
        ],
        brandId: [
          {required: true, message: '请选择车辆品牌', trigger: 'blur'}
        ],
        infoType: [
          {required: true, message: '请选择车辆类型', trigger: 'blur'}
        ],
        autoNum: [
          {required: true, message: '请输入车牌号码', trigger: 'blur'}
        ],
        color: [
          {required: true, message: '请选择车辆颜色', trigger: 'blur'}
        ],
        displacement: [
          {required: true, message: '请输入排量', trigger: 'blur'}
        ],
        unit: [
          {required: true, message: '请选择排量计量单位', trigger: 'blur'}
        ],
        mileage: [
          {required: true, message: '请输入行驶里程', trigger: 'blur'}
        ],
        rent: [
          {required: true, message: '请输入日租金额', trigger: 'blur'}
        ],
        registrationDate: [
          {required: true, message: '请选择上牌时间', trigger: 'blur'}
        ],
        pic: [
          {required: true, message: '请上传车辆图片', trigger: 'blur'}
        ],
        status: [
          {required: true, message: '请选择车辆状态', trigger: 'blur'}
        ],
        deposit: [
          {required: true, message: '请输入押金', trigger: 'blur'}
        ]
      }
    }
  },
  created() {
    this.search()
    this.searchMakerList()

  },
  methods: {

    async search(start = 1) {
      this.start = start
      const res = await autoInfoApi.search(this.start, this.size, this.infoModel)
      if (res.success) {
        this.tableData = res.data.records
        this.total = res.data.total
      }
    },
    async searchMakerList() {
      try {
        let res = await autoMakerApi.list()
        if (res.success) {
          this.makerList = res.data
        }
      } catch (e) {
        this.$message.error(e.message)
      }
    },

    async handleMakerChange(val){
      let res =await autoBrandApi.selectBrandByMakerId(val)
      if (res.success) {
        this.brandList = res.data
      }

    },
    async handleUpdate(row) {
      this.dialogStatus = 'update'
      this.saveInfo = row
      let res = await autoBrandApi.selectBrandByMakerId(row.makerId)
      this.$forceUpdate()
      if (res.success) {
        this.brandList = res.data
      }

      this.dialogVisible = true


    },
    handleDelete(row) {
      this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        await autoInfoApi.delete(row.id).then(res => {
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
    resetForm() {
      this.infoModel = {}
      this.search()
    },
    handleSearch() {
      if(this.infoModel.registrationDateVal!=undefined){
        this.infoModel.lowRegistrationDate = this.infoModel.registrationDateVal[0]
        this.infoModel.highRegistrationDate = this.infoModel.registrationDateVal[1]
      }
      this.search()
    },
    handleDeleteBatch() {
      this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        await autoInfoApi.delete(this.multipleSelection).then(res => {
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
    handleAdd: async function() {
      this.dialogStatus = 'create'
      this.dialogVisible = true
      this.saveInfo = {}
      this.brandList=[]
      this.$nextTick().then(
        () => {
          this.$refs['form'].clearValidate()
        }
      )

    },
    handlePicSuccess(res, file) {
      this.saveInfo.pic= res.data
      this.$forceUpdate()//强制渲染
    },
    beforePicUpload(file) {
      const isJPG = file.type === 'image/jpeg'|| 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },
    createData(){
      console.log(this.saveInfo)
      this.$refs['form'].validate(async valid => {
        if(!valid){
          return false
        }else {
          try {
            const res = await autoInfoApi.save(this.saveInfo)
            if (res.success) {
              this.dialogVisible = false
              this.search()
              this.$message.success('保存成功')
            }
          } catch (e) {
            console.log(e)
          }
        }
      })

    },
    updateData(){
      this.$refs['form'].validate(async valid => {
        if(!valid){
          return false
        }else {
          try {
            const res = await autoInfoApi.update(this.saveInfo)
            if (res.success) {
              this.dialogVisible = false
              this.search()
              this.$message.success('修改成功')
            }
          } catch (e) {
            console.log(e)
          }
        }
      })

    }

  },

}

</script>
<style>
.pic-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.pic-uploader .el-upload:hover {
  border-color: #409EFF;
}

.pic-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.pic {
  width: 178px;
  height: 178px;
  display: block;
}



</style>
