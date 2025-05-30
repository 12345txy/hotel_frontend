<template>
  <div class="checkout-page bg-gray-100 min-h-screen py-8">
    <div class="bg-white shadow-lg rounded-lg p-6 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <font-awesome-icon icon="sign-out-alt" class="mr-2 text-red-500" /> 退房结账
      </h1>
      
      <!-- 当前入住信息 -->
      <div v-if="$store.getters.isCheckedIn && !orderFound" class="bg-blue-50 p-4 rounded-md border border-blue-200 mb-4">
        <div class="flex items-center">
          <font-awesome-icon icon="info-circle" class="text-blue-500 mr-2" />
          <div>
            <h3 class="text-md font-medium text-blue-800">当前入住房间: {{ $store.getters.getRoomNumber }}</h3>
            <p class="text-sm text-blue-600">客人: {{ $store.state.guestInfo ? $store.state.guestInfo.name : '未知' }}</p>
          </div>
          <button 
            @click="searchRoom" 
            class="ml-auto py-2 px-4 border border-blue-500 rounded-md text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <font-awesome-icon icon="search" class="mr-1" /> 获取账单
          </button>
        </div>
      </div>
      
      <!-- 无入住信息提示 -->
      <div v-if="!$store.getters.isCheckedIn && !orderFound" class="bg-yellow-50 p-4 rounded-md border border-yellow-200 mb-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <font-awesome-icon icon="exclamation-circle" class="text-yellow-400" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-yellow-800">未找到入住信息</h3>
            <div class="mt-2 text-sm text-yellow-700">
              <p>
                请先办理入住，或者手动输入房间号查询。
              </p>
            </div>
          </div>
        </div>
        
        <!-- 手动搜索表单 -->
        <div class="mt-4 flex items-center">
          <input 
            v-model="roomNumber" 
            type="text" 
            placeholder="输入房间号" 
            class="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          >
          <button 
            @click="searchRoom" 
            class="ml-2 py-2 px-4 border border-blue-500 rounded-md text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap"
          >
            <font-awesome-icon icon="search" class="mr-1" /> 搜索
          </button>
        </div>
      </div>
      
      <!-- 订单信息 -->
      <div v-if="orderFound" class="space-y-6">
        <!-- 客人信息 -->
        <div class="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
          <div class="bg-gray-100 px-4 py-2 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-800">入住人信息</h3>
          </div>
          
          <div class="p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500">姓名</p>
                <p class="font-medium">{{ order.guestName }}</p>
              </div>
              
              <div>
                <p class="text-sm text-gray-500">身份证号</p>
                <p class="font-medium">{{ order.guestIdCard }}</p>
              </div>
              
              <div>
                <p class="text-sm text-gray-500">入住时间</p>
                <p class="font-medium">{{ formatDateTime(order.checkInTime) }}</p>
              </div>
              
              <div>
                <p class="text-sm text-gray-500">房间号</p>
                <p class="font-medium">{{ order.roomNumber }}</p>
              </div>
              
              <div>
                <p class="text-sm text-gray-500">已住时长</p>
                <p class="font-medium">{{ calculateStayDuration() }}</p>
              </div>
              
              <div>
                <p class="text-sm text-gray-500">办理退宿时间</p>
                <p class="font-medium">{{ formatDateTime(new Date()) }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 住宿账单 -->
        <div class="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
          <div class="bg-gray-100 px-4 py-2 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-800">住宿账单</h3>
          </div>
          
          <div class="p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500">住宿费用（{{ calculateDays() }}天）</p>
                <p class="font-medium text-red-600">¥{{ calculateRoomFee() }}</p>
              </div>
              
              <div>
                <p class="text-sm text-gray-500">已支付押金</p>
                <p class="font-medium text-green-600">¥{{ order.deposit }}</p>
              </div>
              
              <div class="md:col-span-2">
                <p class="text-sm text-gray-500">住宿费用小计</p>
                <p class="font-medium text-xl text-red-600">¥{{ calculateRoomFee() }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 空调账单 -->
        <div class="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
          <div class="bg-gray-100 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-800">空调使用账单</h3>
            <button @click="showACDetail = !showACDetail" class="text-blue-600 text-sm hover:text-blue-800">
              {{ showACDetail ? '隐藏详情' : '查看详情' }}
            </button>
          </div>
          
          <div class="p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500">空调使用时长</p>
                <p class="font-medium">{{ formatTime(order.acUsageTime) }}</p>
              </div>
              
              <div>
                <p class="text-sm text-gray-500">空调费用</p>
                <p class="font-medium text-red-600">¥{{ order.acFee.toFixed(2) }}</p>
              </div>
            </div>
            
            <!-- 空调详单 -->
            <div v-if="showACDetail" class="mt-4">
              <h4 class="text-sm font-medium text-gray-700 mb-2">空调使用详单</h4>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">使用时段</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">温度设置</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">风速</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时长</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">费用</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="(record, index) in order.acRecords" :key="index">
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ record.timeRange }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ record.temp }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ record.fanSpeed }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ record.duration }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">¥{{ record.fee.toFixed(2) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 总计 -->
        <div class="bg-blue-50 p-4 rounded-md border border-blue-200">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-lg font-medium text-gray-800">总计应付</h3>
              <p class="text-sm text-gray-500">包含住宿费、空调费用等全部费用</p>
            </div>
            <div class="text-2xl font-bold text-red-600">¥{{ calculateTotalDue().toFixed(2) }}</div>
          </div>
        </div>
        
        <!-- 备注 -->
        <div class="bg-gray-50 p-4 rounded-md">
          <label class="block text-sm font-medium text-gray-700 mb-2">备注</label>
          <textarea v-model="remark" rows="2" class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"></textarea>
        </div>
        
        <!-- 操作按钮 -->
        <div class="flex space-x-4">
          <button 
            @click="printBill" 
            class="flex-1 py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <font-awesome-icon icon="print" class="mr-1" /> 打印账单
          </button>
          
          <button 
            @click="confirmCheckOut" 
            class="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <font-awesome-icon icon="check-circle" class="mr-1" /> 确认退房
          </button>
        </div>
      </div>
      
      <!-- 无订单信息提示 -->
      <div v-else-if="searchAttempted" class="bg-yellow-50 p-4 rounded-md border border-yellow-200">
        <div class="flex">
          <div class="flex-shrink-0">
            <font-awesome-icon icon="exclamation-circle" class="text-yellow-400" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-yellow-800">未找到房间信息</h3>
            <div class="mt-2 text-sm text-yellow-700">
              <p>
                未找到该房间的入住信息，请确认房间号是否正确。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CheckOutView',
  data() {
    return {
      roomNumber: '',
      searchAttempted: false,
      orderFound: false,
      showACDetail: false,
      order: null,
      remark: '',
      isProcessing: false
    }
  },
  created() {
    // 从Vuex获取当前入住房间
    if (this.$store.getters.isCheckedIn) {
      this.roomNumber = this.$store.getters.getRoomNumber;
      // 自动查询账单
      this.searchRoom();
    } else {
      // 如果从空调页面跳转过来，自动填充房间号并查询
      const currentRoom = localStorage.getItem('currentRoom');
      if (currentRoom) {
        this.roomNumber = currentRoom;
        this.searchRoom();
      }
    }
  },
  beforeDestroy() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    if (this.checkoutTimer) {
      clearTimeout(this.checkoutTimer);
    }
  },
  methods: {
    async searchRoom() {
      if (this.isProcessing) return;
      this.isProcessing = true;
      this.searchAttempted = true;
      
      // 如果没有房间号但有Vuex中的房间信息，使用Vuex中的
      if (!this.roomNumber && this.$store.getters.isCheckedIn) {
        this.roomNumber = this.$store.getters.getRoomNumber;
      }
      
      try {
        this.searchTimer = setTimeout(() => {
          // 模拟数据
          if (this.roomNumber && ['1', '2', '3', '4', '5'].includes(this.roomNumber)) {
            // 首先尝试从Vuex获取数据
            let guestName = this.$store.state.guestInfo ? this.$store.state.guestInfo.name : null;
            let guestIdCard = this.$store.state.guestInfo ? this.$store.state.guestInfo.idCard : null;
            let deposit = this.$store.state.deposit;
            let checkInTime = this.$store.state.checkInTime;
            
            // 如果Vuex没有，尝试从localStorage获取
            if (!guestName) {
              guestName = localStorage.getItem('guestName') || '张三';
            }
            if (!guestIdCard) {
              guestIdCard = localStorage.getItem('guestIdCard') || '110101199001011234';
            }
            if (!deposit) {
              deposit = parseFloat(localStorage.getItem('deposit')) || 500;
            }
            
            const checkInTimeObj = checkInTime ? new Date(checkInTime) : 
                                  (localStorage.getItem('checkInTime') ? new Date(localStorage.getItem('checkInTime')) : 
                                  new Date(Date.now() - 86400000 * 2 - 3600000 * 12)); // 默认入住2.5天
            
            this.order = {
              guestName: guestName,
              guestIdCard: guestIdCard,
              roomNumber: this.roomNumber,
              checkInTime: checkInTimeObj,
              deposit: deposit,
              roomRate: 400, // 每天房费
              acUsageTime: 24 * 60 * 60, // 空调使用时间（秒）
              acFee: 80, // 空调费用
              acRecords: [
                { timeRange: '08:00 – 12:00', temp: '24', fanSpeed: '低速', duration: '4小时', fee: 20 },
                { timeRange: '14:00 – 18:00', temp: '25', fanSpeed: '中速', duration: '4小时', fee: 30 },
                { timeRange: '20:00 – 08:00', temp: '26', fanSpeed: '低速', duration: '12小时', fee: 30 }
              ]
            };
            this.orderFound = true;
          } else {
            this.orderFound = false;
          }
          this.isProcessing = false;
        }, 500);
      } catch (error) {
        console.error('获取订单信息失败:', error);
        this.orderFound = false;
        this.isProcessing = false;
      }
    },
    formatDateTime(date) {
      if (!date) return '';
      
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
    formatTime(seconds) {
      const hours = Math.floor(seconds / 3600);
      return `${hours}小时`;
    },
    calculateStayDuration() {
      if (!this.order || !this.order.checkInTime) return '';
      
      const checkInTime = new Date(this.order.checkInTime);
      const now = new Date();
      const diffTime = Math.abs(now - checkInTime);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      return `${diffDays}天${diffHours}小时`;
    },
    calculateDays() {
      if (!this.order || !this.order.checkInTime) return 0;
      
      const checkInTime = new Date(this.order.checkInTime);
      const now = new Date();
      const diffTime = Math.abs(now - checkInTime);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // 向上取整，不足一天按一天计算
      
      return diffDays;
    },
    calculateRoomFee() {
      const days = this.calculateDays();
      return days * this.order.roomRate;
    },
    calculateTotalDue() {
      if (!this.order) return 0;
      
      const roomFee = this.calculateRoomFee();
      const total = roomFee + this.order.acFee - this.order.deposit;
      return total > 0 ? total : 0;
    },
    printBill() {
      const printContent = `
        === 酒店退房账单 ===
        房间号: ${this.order.roomNumber}
        客人: ${this.order.guestName}
        入住时间: ${this.formatDateTime(this.order.checkInTime)}
        退房时间: ${this.formatDateTime(new Date())}
        住宿费用: ¥${this.calculateRoomFee()}
        空调费用: ¥${this.order.acFee}
        押金: ¥${this.order.deposit}
        需付金额: ¥${this.calculateTotalDue().toFixed(2)}
      `;
      
      console.log('打印账单:', printContent);
      alert('账单已生成，准备打印！');
    },
    async confirmCheckOut() {
      if (this.isProcessing) return;
      this.isProcessing = true;
      
      try {
        console.log('提交退房信息:', {
          roomNumber: this.roomNumber,
          remark: this.remark,
          totalAmount: this.calculateTotalDue()
        });
        
        this.checkoutTimer = setTimeout(() => {
          if (confirm('退房结账成功！点击确定返回首页。')) {
            this.$store.dispatch('clearCheckInInfo');
            
            this.$router.push('/').catch(err => {
              console.error('导航失败:', err);
            });
          }
          this.isProcessing = false;
        }, 1000);
      } catch (error) {
        console.error('退房结账失败:', error);
        alert('退房结账失败，请稍后再试');
        this.isProcessing = false;
      }
    }
  }
}
</script>