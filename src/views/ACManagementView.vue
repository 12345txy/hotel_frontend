<template>
  <div class="ac-management-page">
    <div class="bg-white shadow-md rounded-lg p-6 max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <font-awesome-icon icon="cogs" class="mr-2 text-purple-500" /> 空调监控中心
      </h1>
      
      <!-- 空调概览统计 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
          <h3 class="text-sm font-medium text-blue-600 mb-2">空调总数</h3>
          <div class="flex items-end">
            <div class="text-3xl font-bold text-blue-800">3</div>
            <div class="ml-2 text-sm text-blue-600">台</div>
          </div>
        </div>
        
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm">
          <h3 class="text-sm font-medium text-green-600 mb-2">当前开启</h3>
          <div class="flex items-end">
            <div class="text-3xl font-bold text-green-800">{{ runningAC.length }}</div>
            <div class="ml-2 text-sm text-green-600">台</div>
          </div>
        </div>
        
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
          <h3 class="text-sm font-medium text-red-600 mb-2">累计费用</h3>
          <div class="flex items-end">
            <div class="text-3xl font-bold text-red-800">{{ formatCurrency(totalCost) }}</div>
          </div>
        </div>
      </div>
      
      <!-- 空调列表 -->
      <div class="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden mb-6">
        <div class="bg-gray-100 px-4 py-2 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-800">空调状态一览</h2>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">空调编号</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">服务房间</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">目标温度</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">风速</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">运行时间</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">累计费用</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="ac in acList" :key="ac.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ ac.id }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    :class="[
                      'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                      ac.isOn ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    ]"
                  >
                    {{ ac.isOn ? '运行中' : '已关闭' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ ac.roomNumber || '-' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ ac.isOn ? `${ac.targetTemp}°C` : '-' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ ac.isOn ? getFanSpeedLabel(ac.fanSpeed) : '-' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ ac.isOn ? formatTime(ac.runningTime) : '-' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ formatCurrency(ac.cost) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button 
                    v-if="ac.isOn"
                    @click="toggleAC(ac.id, false)" 
                    class="text-red-600 hover:text-red-800 mr-2"
                  >
                    关闭
                  </button>
                  <button 
                    v-else
                    @click="toggleAC(ac.id, true)" 
                    class="text-green-600 hover:text-green-800 mr-2"
                  >
                    开启
                  </button>
                  <button 
                    @click="viewDetail(ac)" 
                    class="text-blue-600 hover:text-blue-800"
                  >
                    详情
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- 数据可视化 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 空调使用分布 -->
        <div class="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
          <div class="bg-gray-100 px-4 py-2 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-800">空调使用分布</h2>
          </div>
          <div class="p-4 h-64">
            <div id="usage-chart" class="w-full h-full"></div>
          </div>
        </div>
        
        <!-- 温度设置分布 -->
        <div class="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
          <div class="bg-gray-100 px-4 py-2 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-800">温度设置分布</h2>
          </div>
          <div class="p-4 h-64">
            <div id="temp-chart" class="w-full h-full"></div>
          </div>
        </div>
      </div>
      
      <!-- 空调详情弹窗 -->
      <div v-if="selectedAC" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
          <div class="bg-gray-100 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h2 class="text-lg font-medium text-gray-800">空调详情 - {{ selectedAC.id }}号</h2>
            <button @click="selectedAC = null" class="text-gray-500 hover:text-gray-700">
              <font-awesome-icon icon="times" />
            </button>
          </div>
          
          <div class="p-6">
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p class="text-sm text-gray-500">状态</p>
                <p class="font-medium">{{ selectedAC.isOn ? '运行中' : '已关闭' }}</p>
              </div>
              
              <div>
                <p class="text-sm text-gray-500">服务房间</p>
                <p class="font-medium">{{ selectedAC.roomNumber || '-' }}</p>
              </div>
              
              <div>
                <p class="text-sm text-gray-500">目标温度</p>
                <p class="font-medium">{{ selectedAC.isOn ? `${selectedAC.targetTemp}°C` : '-' }}</p>
              </div>
              
              <div>
                <p class="text-sm text-gray-500">风速</p>
                <p class="font-medium">{{ selectedAC.isOn ? getFanSpeedLabel(selectedAC.fanSpeed) : '-' }}</p>
              </div>
              
              <div>
                <p class="text-sm text-gray-500">运行时间</p>
                <p class="font-medium">{{ selectedAC.isOn ? formatTime(selectedAC.runningTime) : '-' }}</p>
              </div>
              
              <div>
                <p class="text-sm text-gray-500">累计费用</p>
                <p class="font-medium">{{ formatCurrency(selectedAC.cost) }}</p>
              </div>
            </div>
            
            <h3 class="text-md font-medium text-gray-700 mb-2">使用记录</h3>
            <div class="bg-gray-50 p-3 rounded-md max-h-64 overflow-y-auto">
              <div v-if="selectedAC.logs && selectedAC.logs.length > 0" class="space-y-2">
                <div v-for="(log, index) in selectedAC.logs" :key="index" class="bg-white p-2 rounded border border-gray-200 text-sm">
                  <div class="flex justify-between items-center">
                    <span>{{ formatDateTime(log.startTime) }} - {{ formatDateTime(log.endTime) }}</span>
                    <span class="font-medium">{{ formatCurrency(log.cost) }}</span>
                  </div>
                  <div class="text-gray-500 mt-1">
                    温度: {{ log.targetTemp }}°C | 风速: {{ getFanSpeedLabel(log.fanSpeed) }}
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 text-center py-4">
                暂无使用记录
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-end">
            <button 
              @click="selectedAC = null" 
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 引入图表库 (如果使用 ECharts)
// import * as echarts from 'echarts/core';
// import { PieChart, BarChart } from 'echarts/charts';
// import { CanvasRenderer } from 'echarts/renderers';
// import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';

// echarts.use([PieChart, BarChart, CanvasRenderer, GridComponent, TooltipComponent, LegendComponent]);

export default {
  name: 'ACManagementView',
  data() {
    return {
      acList: [
        {
          id: 1,
          isOn: true,
          roomNumber: '101',
          targetTemp: 24,
          fanSpeed: 'MEDIUM',
          runningTime: 3600, // 1小时
          cost: 120,
          logs: [
            {
              startTime: new Date(Date.now() - 3600000),
              endTime: new Date(),
              targetTemp: 24,
              fanSpeed: 'MEDIUM',
              cost: 120
            }
          ]
        },
        {
          id: 2,
          isOn: false,
          roomNumber: '102',
          targetTemp: 25,
          fanSpeed: 'LOW',
          runningTime: 1800, // 30分钟
          cost: 45,
          logs: [
            {
              startTime: new Date(Date.now() - 7200000),
              endTime: new Date(Date.now() - 5400000),
              targetTemp: 25,
              fanSpeed: 'LOW',
              cost: 45
            }
          ]
        },
        {
          id: 3,
          isOn: true,
          roomNumber: '201',
          targetTemp: 22,
          fanSpeed: 'HIGH',
          runningTime: 7200, // 2小时
          cost: 280,
          logs: [
            {
              startTime: new Date(Date.now() - 7200000),
              endTime: new Date(),
              targetTemp: 22,
              fanSpeed: 'HIGH',
              cost: 280
            }
          ]
        }
      ],
      selectedAC: null,
      usageChart: null,
      tempChart: null
    };
  },
  computed: {
    runningAC() {
      return this.acList.filter(ac => ac.isOn);
    },
    totalCost() {
      return this.acList.reduce((sum, ac) => sum + ac.cost, 0);
    }
  },
  mounted() {
    // 初始化图表
    this.initCharts();
    
    // 启动定时刷新
    this.startRefreshTimer();
  },
  beforeDestroy() {
    // 清除定时器
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  },
  methods: {
    async fetchACData() {
      try {
        // 实际项目中这里应该调用API获取空调数据
        // const response = await fetch('/api/ac');
        // const data = await response.json();
        // this.acList = data;
        
        // 模拟数据更新
        this.acList.forEach(ac => {
          if (ac.isOn) {
            ac.runningTime += 10;
            ac.cost += this.calculateCostIncrement(ac.fanSpeed, 10);
          }
        });
        
        // 更新图表
        this.updateCharts();
      } catch (error) {
        console.error('获取空调数据失败:', error);
      }
    },
    initCharts() {
      // 实际项目中这里应该初始化ECharts
      // 由于本示例中没有引入ECharts，所以只是空实现
      console.log('初始化图表');
    },
    updateCharts() {
      // 实际项目中这里应该更新ECharts数据
      console.log('更新图表数据');
    },
    startRefreshTimer() {
      // 每10秒刷新一次数据
      this.refreshTimer = setInterval(() => {
        this.fetchACData();
      }, 10000);
    },
    toggleAC(acId, isOn) {
      const ac = this.acList.find(a => a.id === acId);
      if (ac) {
        // 实际项目中这里应该调用API
        // const endpoint = isOn ? `/api/ac/${ac.roomNumber}/turnOn` : `/api/ac/${ac.roomNumber}/turnOff`;
        // fetch(endpoint, { method: 'POST' })
        
        // 模拟API调用
        ac.isOn = isOn;
        if (isOn) {
          console.log(`开启空调 ${acId} 号`);
        } else {
          console.log(`关闭空调 ${acId} 号`);
        }
      }
    },
    viewDetail(ac) {
      this.selectedAC = JSON.parse(JSON.stringify(ac)); // 创建副本
    },
    calculateCostIncrement(fanSpeed, seconds) {
      // 基础费率：低速1元/分钟，中速1.5元/分钟，高速2元/分钟
      const baseRates = {
        'LOW': 1,
        'MEDIUM': 1.5,
        'HIGH': 2
      };
      
      return (baseRates[fanSpeed] || 1) * (seconds / 60);
    },
    formatTime(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    },
    formatCurrency(amount) {
      return `¥${amount.toFixed(2)}`;
    },
    formatDateTime(date) {
      if (!date) return '';
      
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    },
    getFanSpeedLabel(speed) {
      const labels = {
        'LOW': '低速',
        'MEDIUM': '中速',
        'HIGH': '高速'
      };
      return labels[speed] || speed;
    }
  }
}
</script> 