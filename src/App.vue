<template>
  <div class="container">
    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="端口号/名称">
        <el-input v-model="formInline.port" placeholder="请输入端口号/名称" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="getPortInfo">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="tableData" style="width: 100%" max-height="calc(100vh - 100px)" v-loading="loading">
      <el-table-column v-for="item in columns" :key="item" :prop="item" :label="item" />
      <el-table-column fixed="right" label="Operations" min-width="120">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleClick(row)">
            杀死该服务
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, reactive, toRefs } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const tableData = ref([])
const columns = ref([])
const formInline = reactive({ port: '' })
const loading = ref(false)

const { port } = toRefs(formInline)

const getPortInfo = async () => {
  loading.value = true
  const [, data] = await window.main.native.process.popen.cmd(`netstat -ano`).readAll()
  const taskList = await window.main.native.process.popen.cmd(`tasklist`).readAll()
    .then(([, data]) => {
      const taskText = data
        .split('\r\n')
        .slice(2)
        .map((item) => item.split('  ').filter(Boolean))
        .reduce((pre, cur) => {
          const [name, PIDStr] = cur
          const pid = PIDStr.trim().split(' ')[0]
          pre[pid] = name
          return pre
        }, {})
      return taskText
    })
  const list = data.split('\r\n').slice(2)
  columns.value = list[0].split(' ').filter(Boolean).concat('服务名称')

  tableData.value = list
    .slice(1)
    .map((text) => {
      const val = text.split(' ').filter(Boolean)
      const obj = {}
      val.forEach((el, i) => {
        obj[columns.value[i]] = el
      })
      obj.服务名称 = taskList[obj.PID]
      return obj
    })
    .filter((item) => item.PID)
    .filter((item) => {
      if(port.value) {
        const portList = item.本地地址.split(':')
        console.log(portList);
        return portList[portList.length - 1].includes(port.value) || (item.服务名称 || ``).toLowerCase().includes(port.value.toLowerCase())
      } else {
        return true
      }
    })

  loading.value = false
}

setTimeout(async () => {
  getPortInfo()
}, 100)

const handleClick = async (row) => {
  console.log(row)
  await ElMessageBox.confirm(`确认杀死 ${row.服务名称} PID 为 ${row.PID} 的服务？`,'警告', {
    type: 'warning',
    draggable: true,
  })

  const [err, message] =  await window.main.native.process.popen.cmd(`taskkill -PID ${row.PID} -F`).readAll()
    if(!err) {
      ElMessage({
          type: 'success',
          message,
        })

    } else {
      ElMessage({
          type: 'error',
          message,
        })
    }
    getPortInfo()
}

// console.log(data);
</script>

<style>
.container {
  padding: 12px;
  box-sizing: border-box;
}
</style>