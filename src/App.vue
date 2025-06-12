<template>
  <div id="app" class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-md">
      <div class="container mx-auto px-6 py-3 flex justify-between items-center">
        <div class="text-xl font-bold text-gray-800">酒店管理系统</div>
        <div class="space-x-4">
          <router-link to="/" class="nav-link">
            <font-awesome-icon icon="home" class="mr-1" />首页
          </router-link>
          <router-link to="/check-in" class="nav-link">
            <font-awesome-icon icon="user-plus" class="mr-1" />入住登记
          </router-link>
          <router-link to="/check-out" class="nav-link">
            <font-awesome-icon icon="sign-out-alt" class="mr-1" />退房结账
          </router-link>
          <router-link to="/air-conditioning" class="nav-link">
            <font-awesome-icon icon="thermometer-half" class="mr-1" />空调控制
          </router-link>
          <!-- <router-link to="/ac-management" class="nav-link">
            <font-awesome-icon icon="cogs" class="mr-1" />空调监控
          </router-link> -->
          <router-link to="/room-monitoring" class="nav-link">
            <font-awesome-icon icon="tachometer-alt" class="mr-1" />监控面板
          </router-link>
          <router-link to="/about" class="nav-link">
            <font-awesome-icon icon="info-circle" class="mr-1" />关于
          </router-link>
        </div>
      </div>
    </nav>
    <main class="container mx-auto px-6 py-8">
      <router-view />
    </main>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.nav-link {
  @apply font-medium text-gray-600 hover:text-green-500 transition duration-150 ease-in-out;
}

.nav-link.router-link-exact-active {
  @apply text-green-500;
}
</style>
