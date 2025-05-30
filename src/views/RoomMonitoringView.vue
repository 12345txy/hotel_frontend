<template>
  <div class="room-monitoring-page">
    <div class="bg-white shadow-md rounded-lg p-6 max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <font-awesome-icon icon="video" class="mr-2 text-purple-500" /> 房间监控中心
      </h1>
      
      <!-- 楼层选择 -->
      <div class="mb-6">
        <div class="flex space-x-2">
          <button 
            v-for="floor in floors" 
            :key="floor"
            @click="selectedFloor = floor"
            :class="[
              'py-2 px-4 rounded-md text-sm font-medium transition-colors',
              selectedFloor === floor
                ? 'bg-purple-600 text-white' 
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            ]"
          >
            {{ floor }}楼
          </button>
        </div>
      </div>
      
      <!-- 房间状态概览 -->
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <div 
          v-for="room in filteredRooms" 
          :key="room.number"
          @click="selectRoom(room)"
          :class="[
            'border rounded-lg p-4 cursor-pointer transition-colors hover:shadow-md',
            selectedRoom && selectedRoom.number === room.number
              ? 'border-purple-500 bg-purple-50' 
              : 'border-gray-200 hover:border-purple-200'
          ]"
        >
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-lg font-medium text-gray-800">{{ room.number }}</h3>
              <p class="text-sm text-gray-500">{{ getRoomTypeName(room.type) }}</p>
            </div>
            <div 
              :class="[
                'px-2 py-1 rounded-full text-xs font-medium',
                room.status === 'occupied' ? 'bg-red-100 text-red-800' : 
                room.status === 'vacant' ? 'bg-green-100 text-green-800' :
                room.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              ]"
            >
              {{ getStatusLabel(room.status) }}
            </div>
          </div>
          
          <div class="mt-3 space-y-1">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">温度</span>
              <span class="font-medium">{{ room.temperature }}°C</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">湿度</span>
              <span class="font-medium">{{ room.humidity }}%</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">空调</span>
              <span class="font-medium" :class="room.acOn ? 'text-green-500' : 'text-gray-500'">
                {{ room.acOn ? '开启' : '关闭' }}
              </span>
            </div>
          </div>
          
          <div class="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center">
            <div class="flex items-center text-sm text-gray-500">
              <font-awesome-icon v-if="room.dndMode" icon="moon" class="mr-1 text-blue-500" />
              <span v-if="room.dndMode">请勿打扰</span>
            </div>
            
            <div v-if="room.alert" class="flex items-center text-sm text-red-500">
              <font-awesome-icon icon="exclamation-circle" class="mr-1" />
              <span>异常</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 详细监控信息 -->
      <div v-if="selectedRoom" class="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
        <div class="bg-gray-100 px-4 py-3 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-800">
              房间 {{ selectedRoom.number }} 详细监控
            </h3>
            <div class="flex space-x-2">
              <button class="p-2 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-700">
                <font-awesome-icon icon="sync" />
              </button>
              <button class="p-2 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-700">
                <font-awesome-icon icon="bell" />
              </button>
              <button class="p-2 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-700">
                <font-awesome-icon icon="cog" />
              </button>
            </div>
          </div>
        </div>
        
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- 房间信息 -->
            <div>
              <h4 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">房间信息</h4>
              
              <div class="bg-gray-50 rounded-lg p-4 mb-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-500">房间号</p>
                    <p class="font-medium">{{ selectedRoom.number }}</p>
                  </div>
                  
                  <div>
                    <p class="text-sm text-gray-500">房间类型</p>
                    <p class="font-medium">{{ getRoomTypeName(selectedRoom.type) }}</p>
                  </div>
                  
                  <div>
                    <p class="text-sm text-gray-500">状态</p>
                    <p class="font-medium" :class="selectedRoom.status === 'occupied' ? 'text-red-600' : 'text-green-600'">
                      {{ getStatusLabel(selectedRoom.status) }}
                    </p>
                  </div>
                  
                  <div v-if="selectedRoom.status === 'occupied'">
                    <p class="text-sm text-gray-500">入住时间</p>
                    <p class="font-medium">{{ selectedRoom.checkInTime }}</p>
                  </div>
                </div>
              </div>
              
              <!-- 客人信息 -->
              <div v-if="selectedRoom.status === 'occupied'" class="bg-gray-50 rounded-lg p-4 mb-4">
                <h5 class="text-sm font-medium text-gray-700 mb-3">客人信息</h5>
                
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-500">姓名</span>
                    <span class="font-medium">{{ selectedRoom.guestName }}</span>
                  </div>
                  
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-500">身份证号</span>
                    <span class="font-medium">{{ maskIdCard(selectedRoom.guestIdCard) }}</span>
                  </div>
                  
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-500">手机号</span>
                    <span class="font-medium">{{ maskPhone(selectedRoom.guestPhone) }}</span>
                  </div>
                </div>
              </div>
              
              <!-- 设备状态 -->
              <div class="bg-gray-50 rounded-lg p-4">
                <h5 class="text-sm font-medium text-gray-700 mb-3">设备状态</h5>
                
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500">空调</span>
                    <span class="font-medium flex items-center" :class="selectedRoom.acOn ? 'text-green-600' : 'text-gray-500'">
                      {{ selectedRoom.acOn ? '开启' : '关闭' }} 
                      <font-awesome-icon v-if="selectedRoom.acOn" icon="snowflake" class="ml-1" />
                    </span>
                  </div>
                  
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500">电视</span>
                    <span class="font-medium flex items-center" :class="selectedRoom.tvOn ? 'text-green-600' : 'text-gray-500'">
                      {{ selectedRoom.tvOn ? '开启' : '关闭' }}
                    </span>
                  </div>
                  
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500">请勿打扰</span>
                    <span class="font-medium flex items-center" :class="selectedRoom.dndMode ? 'text-blue-600' : 'text-gray-500'">
                      {{ selectedRoom.dndMode ? '已开启' : '已关闭' }}
                      <font-awesome-icon v-if="selectedRoom.dndMode" icon="moon" class="ml-1" />
                    </span>
                  </div>
                  
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500">灯光</span>
                    <span class="font-medium flex items-center" :class="selectedRoom.lightsOn ? 'text-yellow-600' : 'text-gray-500'">
                      {{ selectedRoom.lightsOn ? '开启' : '关闭' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 环境监控 -->
            <div>
              <h4 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">环境监控</h4>
              
              <!-- 温湿度监控 -->
              <div class="bg-gray-50 rounded-lg p-4 mb-4">
                <div class="grid grid-cols-2 gap-4">
                  <div class="text-center p-3">
                    <div class="text-4xl font-light text-blue-600 mb-1">
                      {{ selectedRoom.temperature }}°C
                    </div>
                    <div class="text-sm text-gray-500">温度</div>
                  </div>
                  
                  <div class="text-center p-3">
                    <div class="text-4xl font-light text-teal-600 mb-1">
                      {{ selectedRoom.humidity }}%
                    </div>
                    <div class="text-sm text-gray-500">湿度</div>
                  </div>
                </div>
              </div>
              
              <!-- 安全监控 -->
              <div class="bg-gray-50 rounded-lg p-4 mb-4">
                <h5 class="text-sm font-medium text-gray-700 mb-3">安全监控</h5>
                
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500">门锁状态</span>
                    <span class="font-medium flex items-center" :class="selectedRoom.doorLocked ? 'text-green-600' : 'text-red-600'">
                      {{ selectedRoom.doorLocked ? '已锁定' : '未锁定' }}
                      <font-awesome-icon :icon="selectedRoom.doorLocked ? 'lock' : 'lock-open'" class="ml-1" />
                    </span>
                  </div>
                  
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500">烟雾报警</span>
                    <span class="font-medium flex items-center" :class="selectedRoom.smokeAlarm ? 'text-red-600' : 'text-green-600'">
                      {{ selectedRoom.smokeAlarm ? '警报中' : '正常' }}
                    </span>
                  </div>
                  
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500">动作检测</span>
                    <span class="font-medium flex items-center" :class="selectedRoom.motionDetected ? 'text-blue-600' : 'text-gray-500'">
                      {{ selectedRoom.motionDetected ? '有动作' : '无动作' }}
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- 能耗监控 -->
              <div class="bg-gray-50 rounded-lg p-4">
                <h5 class="text-sm font-medium text-gray-700 mb-3">能耗监控</h5>
                
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500">用电量</span>
                    <span class="font-medium">{{ selectedRoom.powerUsage }} kWh</span>
                  </div>
                  
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500">用水量</span>
                    <span class="font-medium">{{ selectedRoom.waterUsage }} m³</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 监控操作 -->
          <div class="mt-6 flex justify-end space-x-3">
            <button class="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <font-awesome-icon icon="print" class="mr-1" /> 打印报告
            </button>
            <button class="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <font-awesome-icon icon="history" class="mr-1" /> 查看历史
            </button>
            <button v-if="selectedRoom.alert" class="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700">
              <font-awesome-icon icon="bell-slash" class="mr-1" /> 解除警报
            </button>
          </div>
        </div>
      </div>
      
      <!-- 未选择房间提示 -->
      <div v-if="!selectedRoom" class="bg-purple-50 border-l-4 border-purple-400 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <font-awesome-icon icon="info-circle" class="text-purple-400" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-purple-700">
              请从上方选择一个房间查看详细监控信息。
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RoomMonitoringView',
  data() {
    return {
      floors: [1, 2, 3],
      selectedFloor: 1,
      selectedRoom: null,
      rooms: [
        { 
          number: '101', type: 'single', status: 'occupied', 
          temperature: 24, humidity: 45, acOn: true, 
          tvOn: false, dndMode: true, lightsOn: true, 
          doorLocked: true, smokeAlarm: false, motionDetected: false,
          powerUsage: 2.8, waterUsage: 0.4, alert: false,
          checkInTime: '2023-07-01 14:30',
          guestName: '李明',
          guestIdCard: '3101011990XXXXXX2918',
          guestPhone: '138XXXX5678'
        },
        { 
          number: '102', type: 'double', status: 'vacant', 
          temperature: 26, humidity: 50, acOn: false, 
          tvOn: false, dndMode: false, lightsOn: false, 
          doorLocked: true, smokeAlarm: false, motionDetected: false,
          powerUsage: 0.2, waterUsage: 0, alert: false
        },
        { 
          number: '103', type: 'single', status: 'maintenance', 
          temperature: 25, humidity: 48, acOn: false, 
          tvOn: false, dndMode: false, lightsOn: true, 
          doorLocked: false, smokeAlarm: false, motionDetected: true,
          powerUsage: 1.1, waterUsage: 0.1, alert: true
        },
        { 
          number: '201', type: 'suite', status: 'occupied', 
          temperature: 22, humidity: 40, acOn: true, 
          tvOn: true, dndMode: false, lightsOn: true, 
          doorLocked: true, smokeAlarm: false, motionDetected: true,
          powerUsage: 4.3, waterUsage: 0.7, alert: false,
          checkInTime: '2023-06-30 10:15',
          guestName: '王芳',
          guestIdCard: '4401011985XXXXXX1234',
          guestPhone: '139XXXX1234'
        },
        { 
          number: '202', type: 'double', status: 'vacant', 
          temperature: 27, humidity: 55, acOn: false, 
          tvOn: false, dndMode: false, lightsOn: false, 
          doorLocked: true, smokeAlarm: false, motionDetected: false,
          powerUsage: 0.1, waterUsage: 0, alert: false
        },
        { 
          number: '203', type: 'double', status: 'occupied', 
          temperature: 23, humidity: 42, acOn: true, 
          tvOn: false, dndMode: true, lightsOn: false, 
          doorLocked: true, smokeAlarm: false, motionDetected: false,
          powerUsage: 1.9, waterUsage: 0.3, alert: false,
          checkInTime: '2023-07-02 16:45',
          guestName: '张伟',
          guestIdCard: '3201011988XXXXXX5678',
          guestPhone: '137XXXX9876'
        },
        { 
          number: '301', type: 'deluxe', status: 'occupied', 
          temperature: 21, humidity: 38, acOn: true, 
          tvOn: true, dndMode: false, lightsOn: true, 
          doorLocked: true, smokeAlarm: false, motionDetected: true,
          powerUsage: 5.7, waterUsage: 1.2, alert: false,
          checkInTime: '2023-06-29 12:00',
          guestName: '赵敏',
          guestIdCard: '1101011992XXXXXX7890',
          guestPhone: '136XXXX5432'
        },
        { 
          number: '302', type: 'suite', status: 'vacant', 
          temperature: 28, humidity: 60, acOn: false, 
          tvOn: false, dndMode: false, lightsOn: false, 
          doorLocked: true, smokeAlarm: false, motionDetected: false,
          powerUsage: 0.3, waterUsage: 0, alert: false
        },
        { 
          number: '303', type: 'deluxe', status: 'cleaning', 
          temperature: 26, humidity: 45, acOn: false, 
          tvOn: false, dndMode: false, lightsOn: true, 
          doorLocked: false, smokeAlarm: false, motionDetected: true,
          powerUsage: 1.4, waterUsage: 0.5, alert: false
        },
      ]
    }
  },
  computed: {
    filteredRooms() {
      return this.rooms.filter(room => {
        const floor = parseInt(room.number.charAt(0));
        return floor === this.selectedFloor;
      });
    }
  },
  methods: {
    selectRoom(room) {
      this.selectedRoom = room;
    },
    getRoomTypeName(type) {
      const types = {
        'single': '单人间',
        'double': '双人间',
        'suite': '套房',
        'deluxe': '豪华套房'
      };
      return types[type] || type;
    },
    getStatusLabel(status) {
      const statuses = {
        'occupied': '已入住',
        'vacant': '空闲',
        'cleaning': '清扫中',
        'maintenance': '维修中'
      };
      return statuses[status] || status;
    },
    maskIdCard(idCard) {
      if (!idCard) return '';
      return idCard.replace(/^(.{6})(.*)(.{4})$/, '$1****$3');
    },
    maskPhone(phone) {
      if (!phone) return '';
      return phone.replace(/^(.{3})(.*)(.{4})$/, '$1****$3');
    }
  }
}
</script> 