<template>
  <div class="home">
    <!-- 酒店展示区域 -->
    <div class="bg-white shadow-md rounded-lg p-6 mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">欢迎来到巴普特酒店</h1>
      
      <div class="relative h-96 rounded-lg overflow-hidden mb-6">
        <img src="../assets/images/hotel1.jpg" alt="酒店外观" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div class="text-center text-white">
            <h2 class="text-4xl font-bold mb-4">尊享舒适住宿体验</h2>
            <p class="text-xl">为您提供舒适的住宿环境和便捷的服务</p>
          </div>
        </div>
      </div>
      
      <div class="prose max-w-none text-gray-600">
        <p class="mb-4">
          我们的酒店拥有5间豪华客房，配备3台现代化空调系统，为您的住宿提供最佳温度控制体验。
          每个房间都配备了先进的设施，包括高速Wi-Fi、平板电视和舒适的床铺。
        </p>
        <p>
          不论是商务旅行还是休闲度假，我们都能满足您的各种需求。现在就开始您的住宿体验吧！
        </p>
      </div>
    </div>
    
    <!-- 角色选择区域 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div 
        @click="selectRole('customer')" 
        class="bg-white shadow-md rounded-lg p-6 cursor-pointer transition-transform transform hover:scale-105 hover:shadow-lg"
      >
        <div class="flex flex-col items-center">
          <font-awesome-icon icon="user" class="text-5xl mb-4 text-blue-500" />
          <h2 class="text-2xl font-bold text-gray-800 mb-2">顾客入口</h2>
          <p class="text-gray-600 text-center">
            办理入住、使用空调、退房结账等服务
          </p>
          <button class="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
            进入顾客系统
          </button>
        </div>
      </div>
      
      <div 
        @click="selectRole('admin')" 
        class="bg-white shadow-md rounded-lg p-6 cursor-pointer transition-transform transform hover:scale-105 hover:shadow-lg"
      >
        <div class="flex flex-col items-center">
          <font-awesome-icon icon="user-shield" class="text-5xl mb-4 text-green-500" />
          <h2 class="text-2xl font-bold text-gray-800 mb-2">管理员入口</h2>
          <p class="text-gray-600 text-center">
            监控房间状态、管理空调系统、查看统计数据
          </p>
          <button class="mt-4 px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">
            进入管理系统
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView',
  methods: {
    selectRole(role) {
      this.$emit('set-role', role);
      
      // 根据角色重定向到不同页面
      if (role === 'customer') {
        this.$router.push('/check-in');
      } else {
        this.$router.push('/ac-management');
      }
    }
  }
}
</script>
