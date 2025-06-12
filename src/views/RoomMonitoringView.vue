<template>
  <div class="ac-monitor-dashboard">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">空调系统监控面板</h1>

      <!-- 刷新状态指示器 -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 rounded-full" :class="isConnected ? 'bg-green-500' : 'bg-red-500'"></div>
          <span class="text-sm text-gray-600">
            {{ isConnected ? '已连接' : '连接断开' }} - 最后更新: {{ lastUpdateTime }}
          </span>
        </div>
        <div class="text-sm text-gray-500">
          自动刷新: {{ countdown }}s
        </div>
      </div>

      <!-- 房间状态监控 -->
      <div class="mb-8">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700">房间状态</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div v-for="room in roomStatus" :key="room.roomId" class="bg-white rounded-lg shadow-md p-4 border-l-4"
            :class="getRoomStatusColor(room)">
            <div class="flex justify-between items-center mb-2">
              <h3 class="text-lg font-semibold">房间 {{ room.roomId }}</h3>
              <div class="flex items-center space-x-1">
                <div class="w-3 h-3 rounded-full" :class="room.acon ? 'bg-green-500' : 'bg-gray-400'"></div>
                <span class="text-xs">{{ room.acon ? '开启' : '关闭' }}</span>
              </div>
            </div>

            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">当前温度:</span>
                <span class="font-medium">{{ room.currentTemp }}°C</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">目标温度:</span>
                <span class="font-medium">{{ room.targetTemp }}°C</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">默认温度:</span>
                <span class="font-medium">{{ room.defaultTemp }}°C</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">风速:</span>
                <span class="font-medium">{{ room.fanSpeed }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">模式:</span>
                <span class="font-medium">{{ room.mode }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 队列状态监控 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 等待队列 -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-700">等待队列</h2>
            <span class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
              {{ waitingQueue.length }} 个房间
            </span>
          </div>

          <div v-if="waitingQueue.length === 0" class="text-center text-gray-500 py-8">
            队列为空
          </div>

          <div v-else class="space-y-3">
            <div v-for="(item, index) in waitingQueue" :key="`waiting-${item.roomId}-${index}`"
              class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div class="flex justify-between items-center mb-2">
                <span class="font-medium text-gray-800">房间 {{ item.roomId }}</span>
                <span class="text-sm text-gray-600">等待时间: {{ item.waitingTime }}min</span>
              </div>
              <div class="text-sm text-gray-600">
                <div>风速: {{ item.fanSpeed }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 服务队列 -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-700">服务队列</h2>
            <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              {{ serviceQueue.length }} 个房间
            </span>
          </div>

          <div v-if="serviceQueue.length === 0" class="text-center text-gray-500 py-8">
            队列为空
          </div>

          <div v-else class="space-y-3">
            <div v-for="(item, index) in serviceQueue" :key="`service-${item.roomId}-${index}`"
              class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex justify-between items-center mb-2">
                <span class="font-medium text-gray-800">房间 {{ item.roomId }}</span>
                <span class="text-sm text-gray-600">服务时间: {{ item.servingTime }}min</span>
              </div>
              <div class="text-sm text-gray-600">
                <div>风速: {{ item.fanSpeed }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 错误信息显示 -->
      <div v-if="error" class="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong class="font-bold">错误!</strong>
        <span class="block sm:inline"> {{ error }}</span>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'

  export default {
    name: 'RoomMonitoringView',
    data() {
      return {
        roomStatus: [],
        waitingQueue: [],
        serviceQueue: [],
        isConnected: false,
        lastUpdateTime: '',
        countdown: 5,
        error: null,
        refreshInterval: null,
        countdownInterval: null,
        // API基础URL - 根据您的后端地址调整
        baseURL: 'http://localhost:8080' // 请根据实际后端地址修改
      }
    },
    async mounted() {
      await this.fetchData()
      this.startAutoRefresh()
    },
    beforeDestroy() {
      this.stopAutoRefresh()
    },
    methods: {
      async fetchData() {
        try {
          // 并行请求所有数据
          const [roomResponse, queueResponse] = await Promise.all([
            axios.get(`/api/monitor/roomstatus`),
            axios.get(`/api/monitor/queuestatus`)
          ])
          console.log("roomResponse:", roomResponse)
          console.log("queueResponse:", queueResponse)

          // 处理房间状态数据
          this.roomStatus = roomResponse.data || []

          // 处理队列状态数据
          const queueData = queueResponse.data || {}
          this.waitingQueue = queueData.waitingQueue || []
          this.serviceQueue = queueData.serviceQueue || []

          this.isConnected = true
          this.lastUpdateTime = new Date().toLocaleTimeString()
          this.error = null
        } catch (error) {
          console.error('获取数据失败:', error)
          this.isConnected = false
          this.error = `数据获取失败: ${error.message}`
        }
      },

      startAutoRefresh() {
        // 数据刷新定时器
        this.refreshInterval = setInterval(() => {
          this.fetchData()
          this.countdown = 5
        }, 5000)

        // 倒计时定时器
        this.countdownInterval = setInterval(() => {
          if (this.countdown > 0) {
            this.countdown--
          }
        }, 1000)
      },

      stopAutoRefresh() {
        if (this.refreshInterval) {
          clearInterval(this.refreshInterval)
        }
        if (this.countdownInterval) {
          clearInterval(this.countdownInterval)
        }
      },

      getRoomStatusColor(room) {
        if (!room.acon) {
          return 'border-gray-400'
        }

        const tempDiff = Math.abs(room.currentTemp - room.targetTemp)
        if (tempDiff <= 1) {
          return 'border-green-500'
        } else if (tempDiff <= 3) {
          return 'border-yellow-500'
        } else {
          return 'border-red-500'
        }
      }
    }
  }
</script>

<style scoped>
  .ac-monitor-dashboard {
    min-height: 100vh;
    background-color: #f7fafc;
  }

  .container {
    max-width: 1200px;
  }

  /* 动画效果 */
  .bg-white {
    transition: all 0.3s ease;
  }

  .bg-white:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }

  /* 状态指示器动画 */
  .w-3.h-3.rounded-full {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {

    0%,
    100% {
      opacity: 1;
    }

    50% {
      opacity: 0.5;
    }
  }
</style>