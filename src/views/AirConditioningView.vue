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
              <div 
                :class="[
                  'font-light text-gray-800',
                  targetTemp === '空调未连接' ? 'text-4xl' : 'text-5xl'
                ]"
              >
                {{ targetTemp }}{{ targetTemp !== '空调未连接' ? '°C' : '' }}
              </div>
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
              <div class="text-xl font-medium">{{ formatRunningTime(roomDetail.time) }}</div>
            </div>
            <div class="bg-gray-50 p-3 rounded-md">
              <div class="text-sm text-gray-500">累计费用</div>
              <div class="text-xl font-medium text-red-600">¥{{ roomDetail.fee || 0 }}</div>
            </div>
            <div class="bg-gray-50 p-3 rounded-md">
              <div class="text-sm text-gray-500">当前费率</div>
              <div class="text-xl font-medium">
                ¥{{ getFanSpeedRate() }}/分钟
              </div>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="flex justify-between">
          <button 
            @click="turnOffAC" 
            :disabled="!acOn || loading"
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
      mode: 'COOLING',
      fanSpeed: 'M',
      startTime: null,
      totalRunningTime: 0,
      totalCost: 0,
      usageLog: [],
      timer: null,
      monitorTimer: null,
      loading: false,
      error: null,
      successMessage: null,
      roomDetail: {
        time: 0,
        fee: 0
      }
    }
  },
  created() {
    // 从本地存储获取当前房间号
    this.currentRoom = localStorage.getItem('currentRoom');
    
    // 如果有房间号，则获取空调状态
    if (this.currentRoom) {
      this.getACStatus();
      this.getRoomDetail();
    }
    
    // 启动定时器，每5秒更新一次房间详情
    this.timer = setInterval(() => {
      if (this.currentRoom) {
        this.getRoomDetail();
      }
    }, 5000);

    // 启动monitor定时器，每5秒更新一次monitor状态
    this.monitorTimer = setInterval(() => {
      if (this.currentRoom) {
        this.getACStatus();
      }
    }, 5000);
  },
  beforeDestroy() {
    // 清除定时器
    clearInterval(this.timer);
    clearInterval(this.monitorTimer);
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
        // 获取房间状态 - 根据API接口调用
        const response = await axios.get(`/api/monitor/roomstatus`);
        const roomData = response.data.find(room => room.roomId === parseInt(this.currentRoom));
        
        if (roomData) {
          this.acOn = roomData.acOn;
          this.currentTemp = roomData.currentTemp;
          this.targetTemp = roomData.targetTemp;
          this.initialTargetTemp = roomData.targetTemp;
          this.mode = roomData.mode;
          this.fanSpeed = roomData.fanSpeed;
          
          if (this.acOn) {
            this.startTime = new Date();
          }
        }
      } catch (error) {
        console.error('获取空调状态失败:', error);
        // 静默处理错误，避免频繁提示
      }
    },

    async getRoomDetail() {
      try {
        // 调用房间详情接口
        const response = await axios.get(`/api/ac/room/${this.currentRoom}/detail`);
        
        if (response.data) {
          // console.log("response.data:", response.data)
          // console.log("response.data.time:", response.data.Time)
          // console.log("response.data.fee:", response.data.Fee)
          this.roomDetail = {
            time: response.data.Time || 0,
            fee: response.data.Fee || 0
          };
          console.log("this.roomDetail:", this.roomDetail)
        }
      } catch (error) {
        console.error('获取房间详情失败:', error);
        // 不显示错误消息，避免频繁提示
      }
    },

    async toggleAC() {
      if (this.loading) return;
      
      try {
        this.loading = true;
        this.clearMessages();

        if (this.acOn) {
          // 关闭空调 - 调用关机接口
          const response = await axios.post(`/api/ac/room/${this.currentRoom}/stop`);
          
          if (response.status === 200) {
            this.acOn = false;
            this.startTime = null;
            this.showMessage(response.data.message || '空调已关闭');
            // 刷新房间详情
            this.getRoomDetail();
          }
        } else {
          // 开启空调 - 调用开机接口
          const response = await axios.post(`/api/ac/room/${this.currentRoom}/start`);
          
          if (response.status === 200) {
            this.acOn = true;
            this.startTime = new Date();
            this.showMessage(response.data.message || '空调已开启');
            // 刷新房间详情
            this.getRoomDetail();
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
          // 刷新房间详情
          this.getRoomDetail();
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
        const response = await axios.put(`/api/ac/room/${this.currentRoom}/speed`, null, {
          params: {
            fanSpeed: speed
          }
        });

        if (response.status === 200) {
          this.fanSpeed = speed;
          this.showMessage(response.data.message || `风速已调整为${this.getFanSpeedLabel(speed)}`);
          // 刷新房间详情
          this.getRoomDetail();
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

    formatRunningTime(totalMinutes) {
      if (!totalMinutes || totalMinutes === 0) return '0分钟';
      
      return `${totalMinutes}分钟`;
    },

    getFanSpeedRate() {
      const rates = {
        'L': 0.33,
        'M': 0.5,
        'H': 1.0
      };
      return rates[this.fanSpeed] || 1.0;
    },

    async turnOffAC() {
      if (!this.acOn || this.loading) return;
      
      try {
        this.loading = true;
        this.clearMessages();

        // 调用关机接口
        const response = await axios.post(`/api/ac/room/${this.currentRoom}/stop`);
        
        if (response.status === 200) {
          this.acOn = false;
          this.startTime = null;
          this.showMessage(response.data.message || '空调已关闭');
          // 刷新房间详情
          this.getRoomDetail();
        }
      } catch (error) {
        console.error('关闭空调失败:', error);
        if (error.response && error.response.data && error.response.data.message) {
          this.showMessage(error.response.data.message, 'error');
        } else {
          this.showMessage('关闭空调失败，请重试', 'error');
        }
      } finally {
        this.loading = false;
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