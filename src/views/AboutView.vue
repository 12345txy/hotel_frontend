<template>
  <div class="about">
    <div class="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <font-awesome-icon icon="info-circle" class="mr-2 text-indigo-500" /> 关于系统
      </h1>
      
      <div class="bg-gray-50 p-6 rounded-lg mb-6">
        <h2 class="text-lg font-semibold text-gray-700 mb-4">酒店管理系统</h2>
        <p class="text-gray-600 mb-4">
          本系统是一个综合性酒店管理平台，集客房预订、入住登记、退房结账、空调控制及房间监控等功能于一体，
          旨在提高酒店管理效率，优化客户体验，实现智能化酒店管理。
        </p>
        <p class="text-gray-600">
          系统采用现代化的前端技术栈构建，包括Vue.js、Tailwind CSS和Font Awesome等，
          提供了友好的用户界面和流畅的操作体验。
        </p>
      </div>
      
      <div class="bg-gray-50 p-6 rounded-lg mb-6">
        <h2 class="text-lg font-semibold text-gray-700 mb-4">主要功能</h2>
        <ul class="space-y-2 text-gray-600">
          <li class="flex items-center">
            <font-awesome-icon icon="user-plus" class="mr-2 text-green-500" />
            客人入住登记管理
          </li>
          <li class="flex items-center">
            <font-awesome-icon icon="sign-out-alt" class="mr-2 text-red-500" />
            客人退房结账处理
          </li>
          <li class="flex items-center">
            <font-awesome-icon icon="thermometer-half" class="mr-2 text-blue-500" />
            客房空调智能控制
          </li>
          <li class="flex items-center">
            <font-awesome-icon icon="video" class="mr-2 text-purple-500" />
            房间状态实时监控
          </li>
        </ul>
      </div>
      
      <div class="bg-gray-50 p-6 rounded-lg">
        <h2 class="text-lg font-semibold text-gray-700 mb-4">技术支持</h2>
        <p class="text-gray-600 mb-4">
          如果您在使用过程中遇到任何问题，或对系统有任何建议，请联系我们的技术支持团队：
        </p>
        <div class="flex items-center text-gray-600">
          <font-awesome-icon icon="envelope" class="mr-2 text-indigo-500" />
          <span>support@hotelmanagementsystem.com</span>
        </div>
        <div class="flex items-center text-gray-600 mt-2">
          <font-awesome-icon icon="phone" class="mr-2 text-indigo-500" />
          <span>400-123-4567</span>
        </div>
      </div>
      
      <div class="mt-6 text-center text-gray-500 text-sm">
        © 2023 酒店管理系统 版本 1.0.0
      </div>
    </div>
  </div>
</template>
