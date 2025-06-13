<template>
  <div class="checkout-page bg-gray-100 min-h-screen py-8">
    <div class="bg-white shadow-lg rounded-lg p-6 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <font-awesome-icon icon="sign-out-alt" class="mr-2 text-red-500" /> 退房结账
      </h1>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="bg-blue-50 p-4 rounded-md border border-blue-200 mb-6">
        <div class="flex items-center">
          <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
          <p class="text-blue-700">正在获取账单信息...</p>
        </div>
      </div>

      <!-- 错误信息 -->
      <div v-if="error" class="bg-red-50 p-4 rounded-md border border-red-200 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <font-awesome-icon icon="exclamation-circle" class="text-red-400" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">获取账单失败</h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{{ error }}</p>
            </div>
            <div class="mt-3">
              <button @click="fetchBillData" class="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200">
                重新获取
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 当前入住信息 -->
      <div v-if="$store.getters.isCheckedIn && !billData" class="bg-blue-50 p-4 rounded-md border border-blue-200 mb-4">
        <div class="flex items-center">
          <font-awesome-icon icon="info-circle" class="text-blue-500 mr-2" />
          <div>
            <h3 class="text-md font-medium text-blue-800">当前入住房间: {{ $store.getters.getRoomNumber }}</h3>
            <p class="text-sm text-blue-600">客人: {{ $store.state.guestInfo ? $store.state.guestInfo.name : '未知' }}</p>
          </div>
          <button @click="fetchBillData"
            class="ml-auto py-2 px-4 border border-blue-500 rounded-md text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            :disabled="isLoading">
            <font-awesome-icon icon="search" class="mr-1" /> 获取账单
          </button>
        </div>
      </div>

      <!-- 无入住信息提示 -->
      <div v-if="!$store.getters.isCheckedIn && !billData && !isLoading"
        class="bg-yellow-50 p-4 rounded-md border border-yellow-200 mb-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <font-awesome-icon icon="exclamation-circle" class="text-yellow-400" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-yellow-800">未找到入住信息</h3>
            <div class="mt-2 text-sm text-yellow-700">
              <p>请先办理入住，或者手动输入房间号查询。</p>
            </div>
          </div>
        </div>

        <!-- 手动搜索表单 -->
        <div class="mt-4 flex items-center">
          <input v-model="roomNumber" type="text" placeholder="输入房间号"
            class="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md">
          <button @click="fetchBillData"
            class="ml-2 py-2 px-4 border border-blue-500 rounded-md text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap"
            :disabled="isLoading || !roomNumber">
            <font-awesome-icon icon="search" class="mr-1" /> 搜索
          </button>
        </div>
      </div>

      <!-- 账单信息 -->
      <div v-if="billData" class="space-y-6">
        <!-- 客人信息 -->
        <div class="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
          <div class="bg-gray-100 px-4 py-2 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-800">入住人信息</h3>
          </div>

          <div class="p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500">房间号</p>
                <p class="font-medium">{{ billData.bill.roomId }}</p>
              </div>

              <div>
                <p class="text-sm text-gray-500">入住时间</p>
                <p class="font-medium">{{ formatDateTime(billData.bill.checkinTime) }}</p>
              </div>

              <div>
                <p class="text-sm text-gray-500">退房时间</p>
                <p class="font-medium">{{ formatDateTime(billData.bill.checkoutTime) }}</p>
              </div>

              <div>
                <p class="text-sm text-gray-500">住宿时长</p>
                <p class="font-medium">{{ billData.bill.duration }}</p>
              </div>

              <div>
                <p class="text-sm text-gray-500">房费</p>
                <p class="font-medium text-red-600">¥{{ billData.bill.roomFee }}</p>
              </div>

              <div>
                <p class="text-sm text-gray-500">空调费</p>
                <p class="font-medium text-red-600">¥{{ billData.bill.acFee }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 空调使用详单 -->
        <div v-if="billData.detailBill && billData.detailBill.length > 0"
          class="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
          <div class="bg-gray-100 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-800">空调使用详单</h3>
            <button @click="showACDetail = !showACDetail" class="text-blue-600 text-sm hover:text-blue-800">
              {{ showACDetail ? '隐藏详情' : '查看详情' }}
            </button>
          </div>

          <div v-if="showACDetail" class="p-4">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">房间号</th>
                    <th scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">开始时间</th>
                    <th scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">结束时间</th>
                    <th scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">使用时长</th>
                    <th scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">风速</th>
                    <th scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">当前费用</th>
                    <th scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">费用</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(record, index) in billData.detailBill" :key="index">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ record.roomId }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDateTime(record.startTime) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDateTime(record.endTime) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ record.duration }}分钟</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ record.fanSpeed }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">¥{{ getFanSpeedValue(record.fanSpeed) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">¥{{ record.fee }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 总计 -->
        <div class="bg-blue-50 p-4 rounded-md border border-blue-200">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-lg font-medium text-gray-800">总计费用</h3>
              <p class="text-sm text-gray-500">房费 + 空调费用</p>
            </div>
            <div class="text-2xl font-bold text-red-600">¥{{ calculateTotal() }}</div>
          </div>
        </div>

        <!-- 备注 -->
        <div class="bg-gray-50 p-4 rounded-md">
          <label class="block text-sm font-medium text-gray-700 mb-2">备注</label>
          <textarea v-model="remark" rows="2"
            class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"></textarea>
        </div>

        <!-- 操作按钮 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button @click="printBillCSV"
            class="py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <font-awesome-icon icon="file-csv" class="mr-1" /> 打印账单
          </button>

          <button @click="printDetailCSV"
            class="py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            :disabled="!billData.detailBill || billData.detailBill.length === 0">
            <font-awesome-icon icon="file-csv" class="mr-1" /> 打印详单
          </button>

          <button @click="printBill"
            class="py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <font-awesome-icon icon="print" class="mr-1" /> 预览账单
          </button>

          <button @click="confirmCheckOut"
            class="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            :disabled="isProcessing">
            <font-awesome-icon icon="check-circle" class="mr-1" /> 确认退房
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'

  export default {
    name: 'CheckOutView',
    data() {
      return {
        roomNumber: '',
        showACDetail: false,
        billData: null,
        remark: '',
        isProcessing: false,
        isLoading: false,
        error: null
      }
    },
    created() {
      // 从Vuex获取当前入住房间
      if (this.$store.getters.isCheckedIn) {
        this.roomNumber = this.$store.getters.getRoomNumber;
        // 自动查询账单
        this.fetchBillData();
      } else {
        // 如果从空调页面跳转过来，自动填充房间号并查询
        const currentRoom = localStorage.getItem('currentRoom');
        if (currentRoom) {
          this.roomNumber = currentRoom;
          this.fetchBillData();
        }
      }
    },
    methods: {
      async fetchBillData() {
        if (this.isLoading) return;

        // 确定房间号
        let roomId = this.roomNumber;
        if (!roomId && this.$store.getters.isCheckedIn) {
          roomId = this.$store.getters.getRoomNumber;
        }

        if (!roomId) {
          this.error = '请输入房间号';
          return;
        }

        this.isLoading = true;
        this.error = null;

        try {
          // 调用账单接口
          const response = await axios.post(`/api/hotel/checkout/${roomId}`);

          if (response.data) {
            this.billData = response.data;
            console.log('获取账单成功:', this.billData);
          } else {
            this.error = '未找到该房间的账单信息';
          }
        } catch (error) {
          console.error('获取账单失败:', error);
          if (error.response) {
            this.error = `获取账单失败: ${error.response.data.message || error.response.statusText}`;
          } else if (error.request) {
            this.error = '网络连接失败，请检查网络连接';
          } else {
            this.error = '获取账单时发生未知错误';
          }
        } finally {
          this.isLoading = false;
        }
      },
       getFanSpeedValue(fanSpeed) {
        const speedMap = {
          'H': 1,
          'M': 0.5,
          'L': 0.33
        };
        return speedMap[fanSpeed] || fanSpeed;
      },

      formatDateTime(dateTimeStr) {
        if (!dateTimeStr) return '';

        try {
          // 处理格式如 "2025-06-13T11"
          let dateStr = dateTimeStr;
          if (dateStr.includes('T') && !dateStr.includes(':')) {
            dateStr += ':00:00';
          }

          const date = new Date(dateStr);
          if (isNaN(date.getTime())) {
            return dateTimeStr; // 如果无法解析，返回原字符串
          }

          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const seconds = String(date.getSeconds()).padStart(2, '0');

          return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        } catch (error) {
          console.error('日期格式化错误:', error);
          return dateTimeStr;
        }
      },

      calculateTotal() {
        if (!this.billData || !this.billData.bill) return 0;

        const roomFee = parseFloat(this.billData.bill.roomFee) || 0;
        const acFee = parseFloat(this.billData.bill.acFee) || 0;

        return (roomFee + acFee).toFixed(2);
      },

      // 下载CSV文件的通用方法
      downloadCSV(content, filename) {
        const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },

      // 打印账单CSV
      printBillCSV() {
        if (!this.billData) return;

        // 根据图片格式生成账单CSV
        const csvContent = [
          '房间号,入住时间,离开时间,空调总费用,住宿总费用',
          `${this.billData.bill.roomId},${this.formatDateTime(this.billData.bill.checkinTime)},${this.formatDateTime(this.billData.bill.checkoutTime)},${this.billData.bill.acFee},${this.billData.bill.roomFee}`
        ].join('\n');

        const filename = `账单_房间${this.billData.bill.roomId}_${new Date().toISOString().slice(0, 10)}.csv`;
        this.downloadCSV(csvContent, filename);
      },

      // 打印详单CSV
      printDetailCSV() {
        if (!this.billData || !this.billData.detailBill || this.billData.detailBill.length === 0) {
          alert('没有空调使用详单数据');
          return;
        }

        // 生成详单CSV
        const headers = '房间号,请求时间,务开始时,务结束时,服务时长,风速,当前费用,费率';
        const rows = this.billData.detailBill.map(record => {
          return [
            record.roomId,
            this.formatDateTime(record.startTime), // 请求时间用开始时间
            this.formatDateTime(record.startTime), // 务开始时
            this.formatDateTime(record.endTime),   // 务结束时
            record.duration,                       // 服务时长
            record.fanSpeed,                       // 风速
            record.fee,                           // 当前费用
            this.getFanSpeedValue(record.fanSpeed) // 费率
          ].join(',');
        });

        const csvContent = [headers, ...rows].join('\n');
        const filename = `详单_房间${this.billData.bill.roomId}_${new Date().toISOString().slice(0, 10)}.csv`;
        this.downloadCSV(csvContent, filename);
      },

      printBill() {
        if (!this.billData) return;

        const printContent = `
        === 酒店退房账单 ===
        房间号: ${this.billData.bill.roomId}
        入住时间: ${this.formatDateTime(this.billData.bill.checkinTime)}
        退房时间: ${this.formatDateTime(this.billData.bill.checkoutTime)}
        住宿时长: ${this.billData.bill.duration}
        房费: ¥${this.billData.bill.roomFee}
        空调费用: ¥${this.billData.bill.acFee}
        总计: ¥${this.calculateTotal()}
        备注: ${this.remark}
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
            totalAmount: this.calculateTotal()
          });

          // 这里可以调用退房确认的API
          // await axios.post('/api/hotel/checkout/confirm', { ... });

          setTimeout(() => {
            if (confirm('退房结账成功！点击确定返回首页。')) {
              // 清除相关状态
              this.$store.dispatch('clearCheckInInfo');
              localStorage.removeItem('currentRoom');

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