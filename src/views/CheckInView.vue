<template>
  <div class="check-in-page bg-gray-100 min-h-screen py-8">
    <div class="bg-white shadow-lg rounded-lg p-6 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <font-awesome-icon icon="user-plus" class="mr-2 text-green-500" /> 客人入住登记
      </h1>
      
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
              <input v-model="guest.phoneNumber" type="tel" class="mt-1 form-input block w-full rounded-md border-gray-300 shadow-sm" required>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">性别</label>
              <select v-model="guest.gender" class="mt-1 form-select block w-full rounded-md border-gray-300 shadow-sm" required>
                <option value="1">男</option>
                <option value="0">女</option>
              </select>
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
              :disabled="isLoading"
              class="text-sm py-1 px-3 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 whitespace-nowrap disabled:opacity-50"
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
            <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              <button 
                v-for="room in availableRooms" 
                :key="room" 
                type="button"
                :class="[
                  'p-4 rounded-lg border-2 focus:outline-none transition-all transform hover:scale-105',
                  selectedRoom === room 
                    ? 'bg-green-100 border-green-500 text-green-700 shadow-lg' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400',
                  getRoomTypeClass(room)
                ]"
                @click="selectRoom(room)"
              >
                <div class="text-center">
                  <div class="font-bold text-xl mb-1">{{ room }}</div>
                  <div class="text-xs mb-2" :class="getRoomTypeTextClass(room)">
                    {{ getRoomType(room) }}
                  </div>
                  <div class="text-sm font-semibold text-blue-600">
                    ¥{{ getRoomPrice(room) }}/天
                  </div>
                </div>
              </button>
            </div>
          </div>
          
          <div v-if="selectedRoom" class="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div class="flex items-center justify-between text-green-800">
              <div class="flex items-center">
              <font-awesome-icon icon="check-circle" class="mr-2 text-green-600" />
              已选择房间: <span class="font-bold ml-1">{{ selectedRoom }}</span>
                <span class="ml-2 text-sm">({{ getRoomType(selectedRoom) }})</span>
              </div>
              <div class="text-right">
                <div class="text-sm text-green-600">房间价格</div>
                <div class="font-bold text-lg">¥{{ getRoomPrice(selectedRoom) }}/天</div>
              </div>
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
            class="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            :disabled="!selectedRoom || loading"
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
              <span class="block mt-1 text-md text-gray-800">{{ guest.phoneNumber }}</span>
            </div>
            
            <div>
              <span class="block text-sm font-medium text-gray-500">性别</span>
              <span class="block mt-1 text-md text-gray-800">{{ guest.gender === '1' ? '男' : '女' }}</span>
            </div>
          </div>
        </div>
        
        <!-- 房间和费用信息 -->
        <div class="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h2 class="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <font-awesome-icon icon="key" class="mr-2 text-yellow-500" /> 房间与费用信息
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span class="block text-sm font-medium text-gray-500">房间号</span>
              <span class="block mt-1 text-xl font-bold text-blue-600">{{ assignedRoom }}</span>
            </div>
            
            <div>
              <span class="block text-sm font-medium text-gray-500">房间类型</span>
              <span class="block mt-1 text-md text-gray-800">{{ getRoomType(assignedRoom) }}</span>
            </div>
            
            <div>
              <span class="block text-sm font-medium text-gray-500">入住日期</span>
              <span class="block mt-1 text-md text-gray-800">{{ checkInInfo.checkInDate }}</span>
            </div>
            
            <div>
              <span class="block text-sm font-medium text-gray-500">入住天数</span>
              <span class="block mt-1 text-md text-gray-500">未知</span>
            </div>
            
            <div>
              <span class="block text-sm font-medium text-gray-500">房间价格</span>
              <span class="block mt-1 text-lg font-bold text-green-600">¥{{ getRoomPrice(assignedRoom) }}/天</span>
            </div>
            
            <div>
              <span class="block text-sm font-medium text-gray-500">入住时间</span>
              <span class="block mt-1 text-md text-gray-800">{{ checkInTime }}</span>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="flex justify-end">
          <button @click="resetAndNew" class="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            继续登记新客人
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'CheckInView',
  data() {
    return {
      guest: {
        name: '',
        idCard: '',
        phoneNumber: '',
        gender: '1'
      },
      checkInInfo: {
        checkInDate: this.formatDate(new Date())
      },
      assignedRoom: '',
      checkInCompleted: false,
      checkInTime: '',
      selectedRoom: '',
      isLoading: false,
      availableRooms: [],
      loading: false,
      error: null,
      successMessage: null,
      // 房间价格映射表
      roomPrices: {
        '1': 100,
        '2': 125,
        '3': 150,
        '4': 200,
        '5': 100
      },
      // 房间类型映射表
      roomTypes: {
        '1': '标准间',
        '2': '高级客房',
        '3': '高级客房',
        '4': '总统套房',
        '5': '标准间'
      }
    }
  },
  created() {
    // 页面加载时先恢复状态，再获取可用房间
    this.restoreState();
    this.fetchAvailableRooms();
  },
  beforeUnmount() {
    // 页面销毁前保存状态
    this.saveState();
  },
  methods: {
    // 保存状态到 localStorage
    saveState() {
      const state = {
        guest: this.guest,
        checkInInfo: this.checkInInfo,
        assignedRoom: this.assignedRoom,
        checkInCompleted: this.checkInCompleted,
        checkInTime: this.checkInTime,
        selectedRoom: this.selectedRoom
      };
      localStorage.setItem('checkInState', JSON.stringify(state));
    },

    // 从 localStorage 恢复状态
    restoreState() {
      const savedState = localStorage.getItem('checkInState');
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          this.guest = { ...this.guest, ...state.guest };
          this.checkInInfo = { ...this.checkInInfo, ...state.checkInInfo };
          this.assignedRoom = state.assignedRoom || '';
          this.checkInCompleted = state.checkInCompleted || false;
          this.checkInTime = state.checkInTime || '';
          this.selectedRoom = state.selectedRoom || '';
        } catch (error) {
          console.error('恢复状态失败:', error);
          // 如果恢复失败，清除损坏的数据
          localStorage.removeItem('checkInState');
        }
      }
    },

    // 清除保存的状态
    clearSavedState() {
      localStorage.removeItem('checkInState');
    },

    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    // 获取房间价格
    getRoomPrice(roomNumber) {
      return this.roomPrices[roomNumber] || 100;
    },

    // 获取房间类型
    getRoomType(roomNumber) {
      return this.roomTypes[roomNumber] || '标准间';
    },

    // 获取房间类型对应的样式类
    getRoomTypeClass(roomNumber) {
      const type = this.getRoomType(roomNumber);
      switch (type) {
        case '标准间':
          return 'border-l-4 border-l-blue-400';
        case '高级客房':
          return 'border-l-4 border-l-purple-400';
        case '总统套房':
          return 'border-l-4 border-l-yellow-400';
        default:
          return 'border-l-4 border-l-gray-400';
      }
    },

    // 获取房间类型文字颜色类
    getRoomTypeTextClass(roomNumber) {
      const type = this.getRoomType(roomNumber);
      switch (type) {
        case '标准间':
          return 'text-blue-600';
        case '高级客房':
          return 'text-purple-600';
        case '总统套房':
          return 'text-yellow-600';
        default:
          return 'text-gray-500';
      }
    },

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
      
      setTimeout(() => {
        this.clearMessages();
      }, 3000);
    },

    async fetchAvailableRooms() {
      try {
        this.isLoading = true;
        this.clearMessages();
        
        const response = await axios.get('/api/hotel/available');
        
        if (response.status === 200 && Array.isArray(response.data)) {
          this.availableRooms = response.data;
          if (this.availableRooms.length === 0) {
            this.showMessage('当前没有可用房间', 'error');
          }
        } else {
          this.availableRooms = [];
          this.showMessage('获取房间信息失败', 'error');
        }
      } catch (error) {
        console.error('获取可用房间失败:', error);
        this.availableRooms = [];
        if (error.response && error.response.data && error.response.data.message) {
          this.showMessage(error.response.data.message, 'error');
        } else {
          this.showMessage('获取可用房间失败，请重试', 'error');
        }
      } finally {
        this.isLoading = false;
      }
    },

    selectRoom(roomNumber) {
      this.selectedRoom = roomNumber;
      // 选择房间后立即保存状态
      this.saveState();
    },

    async submitCheckIn() {
      if (!this.selectedRoom) {
        this.showMessage('请先选择一个房间', 'error');
        return;
      }

      try {
        this.loading = true;
        this.clearMessages();

        const checkInData = {
          name: this.guest.name,
          idcard: this.guest.idCard,
          gender: this.guest.gender,
          phoneNumber: this.guest.phoneNumber,
          roomId: parseInt(this.selectedRoom)
        };

        const response = await axios.post('/api/hotel/checkin', checkInData);

        if (response.status === 200) {
          this.assignedRoom = this.selectedRoom;
          this.checkInTime = new Date().toLocaleString();
          this.checkInCompleted = true;
          
          // 保存房间号到localStorage，供其他页面使用
          localStorage.setItem('currentRoom', this.selectedRoom);
          
          // 保存完整状态
          this.saveState();
          
          this.showMessage(response.data.message || '入住登记成功！');
        }
      } catch (error) {
        console.error('入住登记失败:', error);
        if (error.response && error.response.data && error.response.data.message) {
          this.showMessage(error.response.data.message, 'error');
        } else {
          this.showMessage('入住登记失败，请重试', 'error');
        }
      } finally {
        this.loading = false;
      }
    },

    resetForm() {
      this.guest = {
        name: '',
        idCard: '',
        phoneNumber: '',
        gender: '1'
      };
      this.selectedRoom = '';
      this.clearMessages();
      // 重置后保存状态
      this.saveState();
    },

    resetAndNew() {
      this.checkInCompleted = false;
      this.resetForm();
      // 清除保存的状态，开始新的登记
      this.clearSavedState();
      // 重新获取可用房间
      this.fetchAvailableRooms();
    }
  },

  // 监听数据变化，自动保存
  watch: {
    guest: {
      handler() {
        this.saveState();
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.check-in-page {
  min-height: 100vh;
}

.form-input, .form-select {
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* 加载动画 */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* 房间卡片悬停效果 */
.transform {
  transition: transform 0.2s ease-in-out;
}

.hover\:scale-105:hover {
  transform: scale(1.05);
}
</style>