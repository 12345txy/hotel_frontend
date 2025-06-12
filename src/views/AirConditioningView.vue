<template>
  <div class="air-conditioning-page">
    <div class="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <font-awesome-icon icon="thermometer-half" class="mr-2 text-blue-500" /> 空调控制
      </h1>
      
      <div v-if="!currentRoom" class="bg-yellow-50 p-4 rounded-md border border-yellow-200 mb-6">
        <p class="text-yellow-700">
          您尚未入住房间，请先办理入住手续。
        </p>
        <button @click="$router.push('/check-in')" class="mt-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
          去办理入住
        </button>
      </div>
      
      <template v-else>
        <!-- 房间信息 -->
        <div class="bg-gray-50 p-4 rounded-md mb-6">
          <h2 class="text-lg font-semibold text-gray-700 mb-2">房间信息</h2>
          <div class="flex items-center">
            <div class="text-3xl font-bold text-blue-600">{{ currentRoom }}</div>
            <div class="ml-4 text-gray-600">号房间</div>
            <div class="ml-auto">
              <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                已入住
              </span>
            </div>
          </div>
        </div>

        <!-- 加载状态指示器 -->
        <div v-if="loading" class="bg-blue-50 p-4 rounded-md border border-blue-200 mb-6">
          <div class="flex items-center">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <p class="text-blue-700">正在处理请求...</p>
          </div>
        </div>

        <!-- 错误信息显示 -->
        <div v-if="error" class="bg-red-50 p-4 rounded-md border border-red-200 mb-6">
          <div class="flex items-center">
            <font-awesome-icon icon="exclamation-triangle" class="text-red-500 mr-3" />
            <p class="text-red-700">{{ error }}</p>
          </div>
        </div>

        <!-- 成功信息显示 -->
        <div v-if="successMessage" class="bg-green-50 p-4 rounded-md border border-green-200 mb-6">
          <div class="flex items-center">
            <font-awesome-icon icon="check-circle" class="text-green-500 mr-3" />
            <p class="text-green-700">{{ successMessage }}</p>
          </div>
        </div>
        
        <!-- 空调控制面板 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- 温度显示 -->
          <div class="bg-white shadow-md rounded-lg p-4 flex flex-col items-center justify-center">
            <h3 class="text-lg font-semibold text-gray-700 mb-2">当前室温</h3>
            <div class="text-6xl font-light text-gray-800 mb-2">{{ currentTemp }}°C</div>
            <div class="text-sm text-gray-500">更新时间: {{ new Date().toLocaleTimeString() }}</div>
          </div>
          
          <!-- 目标温度控制 -->
          <div class="bg-white shadow-md rounded-lg p-4">
            <h3 class="text-lg font-semibold text-gray-700 mb-4">目标温度</h3>
            <div class="flex items-center justify-between mb-4">
              <button 
                @click="decreaseTemp" 
                class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!acOn || loading || targetTemp <= 16"
              >
                <font-awesome-icon icon="minus" />
              </button>
              <div class="text-5xl font-light text-gray-800">{{ targetTemp }}°C</div>
              <button 
                @click="increaseTemp" 
                class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 hover:bg-red-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!acOn || loading || targetTemp >= 30"
              >
                <font-awesome-icon icon="plus" />
              </button>
            </div>
            <div class="flex justify-center">
              <button 
                @click="confirmTempChange" 
                class="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed" 
                :disabled="!acOn || !tempChanged || loading"
              >
                <font-awesome-icon icon="thermometer-half" class="mr-1" />
                确认调温
              </button>
            </div>
          </div>
        </div>
        
        <!-- 风速控制和开关 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- 风速控制 -->
          <div class="bg-white shadow-md rounded-lg p-4">
            <h3 class="text-lg font-semibold text-gray-700 mb-4">风速控制</h3>
            <div class="flex space-x-2">
              <button 
                v-for="speed in ['L', 'M', 'H']" 
                :key="speed"
                @click="setFanSpeed(speed)"
                :disabled="!acOn || loading"
                :class="[
                  'flex-1 py-3 rounded-md text-sm font-medium transition-colors',
                  acOn && fanSpeed === speed
                    ? 'bg-blue-600 text-white' 
                    : !acOn || loading
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                ]"
              >
                <font-awesome-icon icon="wind" class="mr-1" />
                {{ getFanSpeedLabel(speed) }}
              </button>
            </div>
          </div>
          
          <!-- 空调开关 -->
          <div class="bg-white shadow-md rounded-lg p-4">
            <h3 class="text-lg font-semibold text-gray-700 mb-4">空调控制</h3>
            <div class="mb-4">
              <div class="flex items-center justify-between">
                <span class="text-gray-700">空调状态</span>
                <button 
                  @click="toggleAC"
                  :disabled="loading"
                  :class="[
                    'relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed',
                    acOn ? 'bg-blue-600' : 'bg-gray-200'
                  ]"
                >
                  <span
                    :class="[
                      'inline-block w-4 h-4 transform bg-white rounded-full transition-transform',
                      acOn ? 'translate-x-6' : 'translate-x-1'
                    ]"
                  ></span>
                </button>
              </div>
              <div class="text-sm text-gray-500 mt-2">
                {{ acOn ? '空调已开启' : '空调已关闭' }}
              </div>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">模式选择</label>
              <div class="grid grid-cols-2 gap-2">
                <button 
                  @click="setMode('制冷模式')" 
                  :disabled="!acOn || loading"
                  :class="[
                    'py-2 px-3 rounded-md text-sm flex items-center justify-center transition-colors',
                    acOn && mode === '制冷模式' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : !acOn || loading
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  ]"
                >
                  <font-awesome-icon icon="snowflake" class="mr-1" />
                  制冷
                </button>
                <button 
                  @click="setMode('制热模式')" 
                  :disabled="!acOn || loading"
                  :class="[
                    'py-2 px-3 rounded-md text-sm flex items-center justify-center transition-colors',
                    acOn && mode === '制热模式' 
                      ? 'bg-red-100 text-red-700 border border-red-200' 
                      : !acOn || loading
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  ]"
                >
                  <font-awesome-icon icon="sun" class="mr-1" />
                  制热
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 使用信息和费用 -->
        <div class="bg-white shadow-md rounded-lg p-4 mb-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">空调使用信息</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-gray-50 p-3 rounded-md">
              <div class="text-sm text-gray-500">运行时间</div>
              <div class="text-xl font-medium">{{ formatRunningTime() }}</div>
            </div>
            <div class="bg-gray-50 p-3 rounded-md">
              <div class="text-sm text-gray-500">累计费用</div>
              <div class="text-xl font-medium text-red-600">¥{{ totalCost.toFixed(2) }}</div>
            </div>
            <div class="bg-gray-50 p-3 rounded-md">
              <div class="text-sm text-gray-500">当前费率</div>
              <div class="text-xl font-medium">
                ¥{{ getFanSpeedRate() }}/小时
              </div>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="flex justify-between">
          <button 
            @click="turnOffAC" 
            :disabled="loading"
            class="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <font-awesome-icon icon="power-off" class="mr-1" /> 
            关闭空调
          </button>
          
          <button 
            @click="$router.push('/check-out')" 
            class="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
          >
            <font-awesome-icon icon="sign-out-alt" class="mr-1" /> 
            退房结账
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'AirConditioningView',
  data() {
    return {
      currentRoom: null,
      acOn: false,
      currentTemp: 26,
      targetTemp: 25,
      initialTargetTemp: 25,
      tempChanged: false,
      mode: '制冷模式',
      fanSpeed: 'M',
      startTime: null,
      totalRunningTime: 0,
      totalCost: 0,
      usageLog: [],
      timer: null,
      loading: false,
      error: null,
      successMessage: null
    }
  },
  created() {
    // 从本地存储获取当前房间号
    this.currentRoom = localStorage.getItem('currentRoom');
    
    // 如果有房间号，则获取空调状态
    if (this.currentRoom) {
      this.getACStatus();
    }
    
    // 启动定时器，每秒更新一次
    this.timer = setInterval(this.updateRunningTime, 1000);
  },
  beforeDestroy() {
    // 清除定时器
    clearInterval(this.timer);
    this.clearMessages();
  },
  methods: {
    clearMessages() {
      this.error = null;
      this.successMessage = null;
    },

    showMessage(message, type = 'success') {
      this.clearMessages();
      if (type === 'error') {
        this.error = message;
      } else {
        this.successMessage = message;
      }
      
      // 3秒后自动清除消息
      setTimeout(() => {
        this.clearMessages();
      }, 3000);
    },

    async getACStatus() {
      try {
        this.loading = true;
        // 获取房间状态 - 根据API接口调用
        const response = await axios.get(`/api/monitor/roomstatus`);
        const roomData = response.data.find(room => room.roomId === parseInt(this.currentRoom));
        
        if (roomData) {
          this.acOn = roomData.acon;
          this.currentTemp = roomData.currentTemp;
          this.targetTemp = roomData.targetTemp;
          this.initialTargetTemp = roomData.targetTemp;
          this.mode = roomData.mode;
          this.fanSpeed = roomData.fanSpeed;
          
          if (this.acOn) {
            this.startTime = new Date();
            this.calculateCost();
          }
        }
      } catch (error) {
        console.error('获取空调状态失败:', error);
        this.showMessage('获取空调状态失败，请刷新页面重试', 'error');
      } finally {
        this.loading = false;
      }
    },

    async toggleAC() {
      if (this.loading) return;
      
      try {
        this.loading = true;
        this.clearMessages();

        if (this.acOn) {
          // 关闭空调
          this.acOn = false;
          this.startTime = null;
          this.showMessage('空调已关闭');
        } else {
          // 开启空调 - 调用开机接口
          const response = await axios.post(`/api/ac/room/${this.currentRoom}/start`);
          
          if (response.status === 200) {
            this.acOn = true;
            this.startTime = new Date();
            this.showMessage(response.data.message || '空调已开启');
          }
          console.log("response:", response)
        }
      } catch (error) {
        console.error('空调开关操作失败:', error);
        if (error.response && error.response.data && error.response.data.message) {
          this.showMessage(error.response.data.message, 'error');
        } else {
          this.showMessage('空调操作失败，请重试', 'error');
        }
      } finally {
        this.loading = false;
      }
    },

    decreaseTemp() {
      if (this.acOn && this.targetTemp > 16 && !this.loading) {
        this.targetTemp -= 1;
        this.tempChanged = true;
      }
    },

    increaseTemp() {
      if (this.acOn && this.targetTemp < 30 && !this.loading) {
        this.targetTemp += 1;
        this.tempChanged = true;
      }
    },

    async confirmTempChange() {
      if (!this.acOn || !this.tempChanged || this.loading) return;
      
      try {
        this.loading = true;
        this.clearMessages();

        // 调用调温接口
        const response = await axios.put(`/api/ac/room/${this.currentRoom}/temp`, null, {
          params: {
            targetTemp: this.targetTemp
          }
        });

        if (response.status === 200) {
          this.tempChanged = false;
          this.initialTargetTemp = this.targetTemp;
          this.showMessage(response.data.message || `目标温度已调整为 ${this.targetTemp}°C`);
        }
      } catch (error) {
        console.error('调温失败:', error);
        // 恢复原来的温度
        this.targetTemp = this.initialTargetTemp;
        this.tempChanged = false;
        
        if (error.response && error.response.data && error.response.data.message) {
          this.showMessage(error.response.data.message, 'error');
        } else {
          this.showMessage('调温失败，请重试', 'error');
        }
      } finally {
        this.loading = false;
      }
    },

    async setFanSpeed(speed) {
      if (!this.acOn || this.loading) return;
      
      if (this.fanSpeed === speed) return; // 如果是相同的风速，不需要调用接口
      
      try {
        this.loading = true;
        this.clearMessages();

        // 调用调风接口
        const response = await axios.put(`/api/ac/room/${this.currentRoom}/fanspeed`, null, {
          params: {
            fanSpeed: speed
          }
        });

        if (response.status === 200) {
          this.fanSpeed = speed;
          this.showMessage(response.data.message || `风速已调整为${this.getFanSpeedLabel(speed)}`);
        }
      } catch (error) {
        console.error('调风失败:', error);
        if (error.response && error.response.data && error.response.data.message) {
          this.showMessage(error.response.data.message, 'error');
        } else {
          this.showMessage('风速调节失败，请重试', 'error');
        }
      } finally {
        this.loading = false;
      }
    },

    setMode(mode) {
      if (this.acOn && !this.loading) {
        this.mode = mode;
        this.showMessage(`空调模式已切换为${mode}`);
      }
    },

    getModeLabel(mode) {
      return mode;
    },

    getFanSpeedLabel(speed) {
      const speeds = {
        'L': '低速',
        'M': '中速',
        'H': '高速'
      };
      return speeds[speed] || speed;
    },

    formatRunningTime() {
      if (!this.startTime) return '00:00:00';
      
      const now = new Date();
      const runningTime = Math.floor((now - this.startTime) / 1000);
      return this.formatTime(runningTime);
    },

    formatTime(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    },

    calculateCost() {
      if (!this.startTime) return;
      
      const now = new Date();
      const runningTimeHours = (now - this.startTime) / (1000 * 60 * 60);
      this.totalCost = runningTimeHours * this.getFanSpeedRate();
    },

    getFanSpeedRate() {
      const rates = {
        'L': 0.5,
        'M': 1.0,
        'H': 1.5
      };
      return rates[this.fanSpeed] || 1.0;
    },

    async turnOffAC() {
      if (!this.acOn || this.loading) return;
      
      await this.toggleAC();
    },

    updateRunningTime() {
      if (this.acOn && this.startTime) {
        this.calculateCost();
      }
    }
  }
}
</script>

<style scoped>
.air-conditioning-page {
  min-height: 100vh;
  background-color: #f7fafc;
  padding: 20px;
}

/* 加载动画 */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* 按钮禁用状态 */
.disabled\:opacity-50:disabled {
  opacity: 0.5;
}

.disabled\:cursor-not-allowed:disabled {
  cursor: not-allowed;
}

/* 过渡动画 */
.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style> 