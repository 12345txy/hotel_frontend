<template>
  <div class="check-in-page bg-gray-100 min-h-screen py-8">
    <div class="bg-white shadow-lg rounded-lg p-6 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <font-awesome-icon icon="user-plus" class="mr-2 text-green-500" /> 客人入住登记
      </h1>
      
      <!-- 提交前显示表单 -->
      <form v-if="!checkInCompleted" @submit.prevent="submitCheckIn" class="space-y-6">
        <!-- 客人信息 -->
        <div class="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h2 class="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <font-awesome-icon icon="user" class="mr-2 text-blue-500" /> 客人信息
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">姓名</label>
              <input v-model="guest.name" type="text" class="mt-1 form-input block w-full rounded-md border-gray-300 shadow-sm" required>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">身份证号</label>
              <input v-model="guest.idCard" type="text" class="mt-1 form-input block w-full rounded-md border-gray-300 shadow-sm" required>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">电话</label>
              <input v-model="guest.phone" type="tel" class="mt-1 form-input block w-full rounded-md border-gray-300 shadow-sm" required>
            </div>
          </div>
        </div>
        
        <!-- 入住信息 -->
        <div class="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h2 class="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <font-awesome-icon icon="calendar-alt" class="mr-2 text-yellow-500" /> 入住信息
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">入住日期</label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <input v-model="checkInInfo.checkInDate" type="date" class="form-input block w-full rounded-md border-gray-300" required>
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <font-awesome-icon icon="calendar-alt" class="text-gray-400" />
                </div>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">入住天数</label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <input v-model.number="checkInInfo.stayDays" type="number" min="1" class="form-input block w-full rounded-md border-gray-300" required>
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <font-awesome-icon icon="clock" class="text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 房间选择 -->
        <div class="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h2 class="text-lg font-semibold text-gray-700 mb-4 flex items-center justify-between">
            <div class="flex items-center">
              <font-awesome-icon icon="door-open" class="mr-2 text-indigo-500" /> 房间选择
            </div>
            <button 
              type="button" 
              @click="fetchAvailableRooms" 
              class="text-sm py-1 px-3 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 whitespace-nowrap"
            >
              <font-awesome-icon icon="sync" class="mr-1" :class="{'fa-spin': isLoading}" /> 刷新空闲房间
            </button>
          </h2>
          
          <div v-if="isLoading" class="flex justify-center py-4">
            <font-awesome-icon icon="spinner" spin class="text-indigo-500 text-2xl" />
          </div>
          
          <div v-else class="mb-4">
            <div v-if="availableRooms.length === 0" class="text-center py-3 bg-gray-100 rounded-md text-gray-600">
              暂无空闲房间
            </div>
            <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              <button 
                v-for="room in availableRooms" 
                :key="room.number" 
                type="button"
                :class="[
                  'p-3 rounded-md border focus:outline-none transition-all',
                  selectedRoom === room.number 
                    ? 'bg-green-100 border-green-500 text-green-700 shadow-sm' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                ]"
                @click="selectRoom(room.number)"
              >
                <div class="font-medium text-lg">{{ room.number }}</div>
                <div class="text-xs">{{ room.type }}</div>
                <div class="text-xs mt-1">¥{{ room.price }}/天</div>
              </button>
            </div>
          </div>
          
          <div v-if="selectedRoom" class="mt-3 p-3 bg-green-50 rounded-md border border-green-200">
            <div class="flex items-center text-green-800">
              <font-awesome-icon icon="check-circle" class="mr-2 text-green-600" />
              已选择房间: <span class="font-bold ml-1">{{ selectedRoom }}</span>
            </div>
          </div>
          <div v-else-if="!isLoading" class="mt-3 p-3 bg-yellow-50 rounded-md border border-yellow-200">
            <div class="flex items-center text-yellow-800">
              <font-awesome-icon icon="exclamation-triangle" class="mr-2 text-yellow-600" />
              请选择一个房间
            </div>
          </div>
        </div>
        
        <!-- 提交按钮 -->
        <div class="flex justify-end">
          <button type="button" @click="resetForm" class="mr-4 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            重置
          </button>
          <button 
            type="submit" 
            class="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            :disabled="!selectedRoom"
          >
            确认入住
          </button>
        </div>
      </form>
      
      <!-- 提交后显示结果 -->
      <div v-else class="space-y-6">
        <!-- 入住成功信息 -->
        <div class="bg-green-50 p-4 rounded-md border border-green-200 mb-6">
          <div class="flex items-center">
            <font-awesome-icon icon="check-circle" class="text-green-500 text-xl mr-2" />
            <h2 class="text-lg font-semibold text-green-700">入住登记成功！</h2>
          </div>
          <p class="text-green-600 mt-2">系统已为您分配房间，详情如下：</p>
        </div>
        
        <!-- 客人信息 -->
        <div class="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h2 class="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <font-awesome-icon icon="user" class="mr-2 text-blue-500" /> 客人信息
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span class="block text-sm font-medium text-gray-500">姓名</span>
              <span class="block mt-1 text-md text-gray-800">{{ guest.name }}</span>
            </div>
            
            <div>
              <span class="block text-sm font-medium text-gray-500">身份证号</span>
              <span class="block mt-1 text-md text-gray-800">{{ guest.idCard }}</span>
            </div>
            
            <div>
              <span class="block text-sm font-medium text-gray-500">电话</span>
              <span class="block mt-1 text-md text-gray-800">{{ guest.phone }}</span>
            </div>
            
            <div>
              <span class="block text-sm font-medium text-gray-500">性别</span>
              <span class="block mt-1 text-md text-gray-800">{{ guest.gender === 'male' ? '男' : '女' }}</span>
            </div>
          </div>
        </div>
        
        <!-- 房间和押金信息 -->
        <div class="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h2 class="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <font-awesome-icon icon="key" class="mr-2 text-yellow-500" /> 房间与押金信息
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span class="block text-sm font-medium text-gray-500">房间号</span>
              <span class="block mt-1 text-xl font-bold text-blue-600">{{ assignedRoom }}</span>
            </div>
            
            <div>
              <span class="block text-sm font-medium text-gray-500">入住日期</span>
              <span class="block mt-1 text-md text-gray-800">{{ checkInInfo.checkInDate }}</span>
            </div>
            
            <div>
              <span class="block text-sm font-medium text-gray-500">入住天数</span>
              <span class="block mt-1 text-md text-gray-800">{{ checkInInfo.stayDays }} 天</span>
            </div>
            
            <div>
              <span class="block text-sm font-medium text-gray-500">押金金额</span>
              <span class="block mt-1 text-xl font-bold text-red-600">¥ {{ deposit }}</span>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="flex justify-end">
          <button @click="printOrder" class="mr-4 py-2 px-4 border border-blue-500 rounded-md text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center">
            <font-awesome-icon icon="print" class="mr-2" /> 打印入住订单
          </button>
          <button @click="resetAndNew" class="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            继续登记新客人
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CheckInView',
  data() {
    return {
      guest: {
        name: '',
        idCard: '',
        phone: '',
        gender: 'male'
      },
      checkInInfo: {
        checkInDate: this.formatDate(new Date()),
        stayDays: 1
      },
      assignedRoom: '',
      deposit: 0,
      checkInCompleted: false,
      checkInTime: '',
      selectedRoom: '',
      isLoading: false,
      availableRooms: []
    }
  },
  created() {
    // 尝试从Vuex或localStorage恢复状态
    if (this.$store.getters.isCheckedIn) {
      this.checkInCompleted = true;
      this.assignedRoom = this.$store.state.currentRoom;
      this.guest = this.$store.state.guestInfo || this.guest;
      this.checkInInfo = this.$store.state.checkInInfo || this.checkInInfo;
      this.deposit = this.$store.state.deposit;
      this.checkInTime = this.$store.state.checkInTime;
    } else {
      // 尝试从localStorage恢复
      this.$store.dispatch('loadCheckInInfo');
      if (this.$store.getters.isCheckedIn) {
        this.checkInCompleted = true;
        this.assignedRoom = this.$store.state.currentRoom;
        this.guest = this.$store.state.guestInfo || this.guest;
        this.checkInInfo = this.$store.state.checkInInfo || this.checkInInfo;
        this.deposit = this.$store.state.deposit;
        this.checkInTime = this.$store.state.checkInTime;
      }
    }
  },
  methods: {
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    submitCheckIn() {
      // 检查是否已选择房间
      if (!this.selectedRoom) {
        this.$toast?.error('请先选择一个房间');
        return;
      }
      
      // 显示加载中状态
      this.$toast?.loading('正在处理入住登记...', { duration: 1500 });
      
      // 模拟后端API调用
      setTimeout(() => {
        // 使用用户选择的房间
        this.assignedRoom = this.selectedRoom;
        // 根据入住天数计算押金
        this.deposit = this.calculateDeposit(this.checkInInfo.stayDays);
        // 记录入住时间
        this.checkInTime = new Date().toLocaleString();
        // 完成入住流程
        this.checkInCompleted = true;
        
        // 保存数据到Vuex
        this.$store.dispatch('saveCheckInInfo', {
          room: this.assignedRoom,
          guest: this.guest,
          checkInInfo: this.checkInInfo,
          deposit: this.deposit,
          checkInTime: this.checkInTime
        });
        
        this.$toast?.success('入住登记成功！');
      }, 1500);
    },
    getNextAvailableRoom() {
      // 模拟获取空余房间的逻辑（从小到大分配）
      const availableRooms = ['1','2','3','4','5'];
      return availableRooms[Math.floor(Math.random() * 3)]; // 为了演示，随机返回前3个房间之一
    },
    calculateDeposit(days) {
      // 根据入住天数计算押金
      const baseDeposit = 300;
      const dailyRate = 100;
      return baseDeposit + (days * dailyRate);
    },
    printOrder() {
      // 生成入住订单并打印
      const orderContent = `
        === 酒店入住订单 ===
        
        客人信息:
        姓名: ${this.guest.name}
        身份证号: ${this.guest.idCard}
        电话: ${this.guest.phone}
        
        入住信息:
        房间号: ${this.assignedRoom}
        入住日期: ${this.checkInInfo.checkInDate}
        入住天数: ${this.checkInInfo.stayDays}天
        入住时间: ${this.checkInTime}
        
        押金金额: ¥${this.deposit}
      `;
      
      console.log('打印订单:', orderContent);
      
      // 在实际应用中，这里可以调用打印API或创建打印窗口
      alert('订单已生成，准备打印！');
      
      // 创建一个新窗口用于打印
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>入住订单</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .order { max-width: 500px; margin: 0 auto; border: 1px solid #ccc; padding: 20px; }
              h2 { text-align: center; }
              .info-section { margin-bottom: 20px; }
              .info-row { display: flex; margin-bottom: 5px; }
              .info-label { width: 100px; font-weight: bold; }
              .divider { border-top: 1px dashed #ccc; margin: 15px 0; }
              .price { font-size: 18px; font-weight: bold; text-align: right; }
            </style>
          </head>
          <body>
            <div class="order">
              <h2>酒店入住订单</h2>
              <div class="info-section">
                <h3>客人信息</h3>
                <div class="info-row"><span class="info-label">姓名:</span> ${this.guest.name}</div>
                <div class="info-row"><span class="info-label">身份证号:</span> ${this.guest.idCard}</div>
                <div class="info-row"><span class="info-label">电话:</span> ${this.guest.phone}</div>
              </div>
              <div class="divider"></div>
              <div class="info-section">
                <h3>入住信息</h3>
                <div class="info-row"><span class="info-label">房间号:</span> ${this.assignedRoom}</div>
                <div class="info-row"><span class="info-label">入住日期:</span> ${this.checkInInfo.checkInDate}</div>
                <div class="info-row"><span class="info-label">入住天数:</span> ${this.checkInInfo.stayDays}天</div>
                <div class="info-row"><span class="info-label">入住时间:</span> ${this.checkInTime}</div>
              </div>
              <div class="divider"></div>
              <div class="price">押金金额: ¥${this.deposit}</div>
            </div>
            <script>
              window.onload = function() { window.print(); }
            <'/scr'+'ipt'>
          </body>
        </html>
      `);
      printWindow.document.close();
    },
    resetForm() {
      this.guest = {
        name: '',
        idCard: '',
        phone: '',
        gender: 'male'
      };
      this.checkInInfo = {
        checkInDate: this.formatDate(new Date()),
        stayDays: 1
      };
      this.selectedRoom = ''; // 重置已选择的房间
    },
    resetAndNew() {
      this.checkInCompleted = false;
      this.resetForm();
    },
    
    // 新增方法 - 获取可用房间
    fetchAvailableRooms() {
      this.isLoading = true;
      
      // 模拟API调用获取空闲房间
      setTimeout(() => {
        this.availableRooms = [
          { number: '1', type: '标准单人间', price: 100 },
          { number: '2', type: '标准单人间', price: 100 },
          { number: '3', type: '标准双人间', price: 120 },
          { number: '4', type: '标准双人间', price: 120 },
          { number: '5', type: '豪华套房', price: 150 },
        ];
        this.isLoading = false;
      }, 800);
    },
    
    // 新增方法 - 选择房间
    selectRoom(roomNumber) {
      this.selectedRoom = roomNumber;
    }
  }
}
</script>