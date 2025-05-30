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
                class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-200 focus:outline-none"
                :disabled="!acOn"
              >
                <font-awesome-icon icon="minus" />
              </button>
              <div class="text-5xl font-light text-gray-800">{{ targetTemp }}°C</div>
              <button 
                @click="increaseTemp" 
                class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 hover:bg-red-200 focus:outline-none"
                :disabled="!acOn"
              >
                <font-awesome-icon icon="plus" />
              </button>
            </div>
            <div class="flex justify-center">
              <button @click="confirmTempChange" class="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none" :disabled="!acOn || !tempChanged">
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
                v-for="speed in ['LOW', 'MEDIUM', 'HIGH']" 
                :key="speed"
                @click="setFanSpeed(speed)"
                :disabled="!acOn"
                :class="[
                  'flex-1 py-3 rounded-md text-sm font-medium transition-colors',
                  acOn && fanSpeed === speed
                    ? 'bg-blue-600 text-white' 
                    : !acOn
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                ]"
              >
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
                  :class="[
                    'relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
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
                  @click="setMode('COOLING')" 
                  :disabled="!acOn"
                  :class="[
                    'py-2 px-3 rounded-md text-sm flex items-center justify-center transition-colors',
                    acOn && mode === 'COOLING' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : !acOn
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  ]"
                >
                  <font-awesome-icon icon="snowflake" class="mr-1" />
                  制冷
                </button>
                <button 
                  @click="setMode('HEATING')" 
                  :disabled="!acOn"
                  :class="[
                    'py-2 px-3 rounded-md text-sm flex items-center justify-center transition-colors',
                    acOn && mode === 'HEATING' 
                      ? 'bg-red-100 text-red-700 border border-red-200' 
                      : !acOn
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
            class="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
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
      fanSpeed: 'MEDIUM',
      startTime: null,
      totalRunningTime: 0,
      totalCost: 0,
      usageLog: [],
      timer: null
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
  },
  methods: {
    async getACStatus() {
      try {
        // 调用API获取空调状态
        // 实际项目中应该使用axios或fetch调用后端API
        // const response = await fetch(`/api/ac/${this.currentRoom}`);
        // const data = await response.json();
        
        // 模拟API调用
        setTimeout(() => {
          // 模拟随机的空调状态
          const randomData = {
            isOn: Math.random() > 0.5,
            currentTemp: Math.floor(22 + Math.random() * 6),
            targetTemp: 25,
            mode: Math.random() > 0.5 ? 'COOLING' : 'HEATING',
            fanSpeed: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)],
            runningTime: Math.floor(Math.random() * 3600) // 秒数
          };
          
          this.acOn = randomData.isOn;
          this.currentTemp = randomData.currentTemp;
          this.targetTemp = randomData.targetTemp;
          this.initialTargetTemp = randomData.targetTemp;
          this.mode = randomData.mode;
          this.fanSpeed = randomData.fanSpeed;
          this.totalRunningTime = randomData.runningTime;
          
          if (this.acOn) {
            this.startTime = new Date(Date.now() - this.totalRunningTime * 1000);
            this.calculateCost();
          }
        }, 500);
      } catch (error) {
        console.error('获取空调状态失败:', error);
      }
    },
    async toggleAC() {
      if (this.acOn) {
        this.acOn = false;
        this.startTime = null;
      } else {
        this.acOn = true;
        this.startTime = new Date();
      }
      console.log(`房间 ${this.currentRoom} 空调已${this.acOn ? '开启' : '关闭'}`);
    },
    decreaseTemp() {
      if (this.acOn && this.targetTemp > 16) {
        this.targetTemp -= 1;
        this.tempChanged = true;
      }
    },
    increaseTemp() {
      if (this.acOn && this.targetTemp < 30) {
        this.targetTemp += 1;
        this.tempChanged = true;
      }
    },
    confirmTempChange() {
      if (this.acOn && this.tempChanged) {
        // 调用API确认温度变化
        console.log(`房间 ${this.currentRoom} 目标温度改为: ${this.targetTemp}°C`);
        this.tempChanged = false;
      }
    },
    setFanSpeed(speed) {
      if (this.acOn) {
        this.fanSpeed = speed;
        console.log(`房间 ${this.currentRoom} 风速改为: ${this.getFanSpeedLabel(speed)}`);
      }
    },
    setMode(mode) {
      if (this.acOn) {
        this.mode = mode;
        console.log(`房间 ${this.currentRoom} 空调模式改为: ${this.getModeLabel(mode)}`);
      }
    },
    getModeLabel(mode) {
      const modes = {
        'COOLING': '制冷',
        'HEATING': '制热'
      };
      return modes[mode] || mode;
    },
    getFanSpeedLabel(speed) {
      const speeds = {
        'LOW': '低速',
        'MEDIUM': '中速',
        'HIGH': '高速'
      };
      return speeds[speed] || speed;
    },
    formatRunningTime() {
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
      const now = new Date();
      const runningTime = Math.floor((now - this.startTime) / 1000);
      this.totalRunningTime += runningTime;
      this.totalCost = (runningTime / 3600) * this.getFanSpeedRate();
    },
    getFanSpeedRate() {
      // 实现获取风速费率的逻辑
      return 0.5; // 临时返回值，实际项目中应该根据风速计算费率
    },
    turnOffAC() {
      if (this.acOn) {
        this.acOn = false;
        console.log(`房间 ${this.currentRoom} 空调关闭`);
      }
    },
    updateRunningTime() {
      // 实现更新运行时间的逻辑
    }
  }
}
</script> 