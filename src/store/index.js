import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    currentRoom: null,
    guestInfo: null,
    checkInInfo: null,
    deposit: 0,
    checkInTime: ''
  },
  mutations: {
    setRoomInfo(state, payload) {
      state.currentRoom = payload.room;
      state.guestInfo = payload.guest;
      state.checkInInfo = payload.checkInInfo;
      state.deposit = payload.deposit || 0;
      state.checkInTime = payload.checkInTime || '';
    },
    clearRoomInfo(state) {
      state.currentRoom = null;
      state.guestInfo = null;
      state.checkInInfo = null;
      state.deposit = 0;
      state.checkInTime = '';
    }
  },
  actions: {
    saveCheckInInfo({ commit }, payload) {
      // 同时保存到localStorage以便持久化
      if (payload.room) {
        localStorage.setItem('currentRoom', payload.room);
      }
      if (payload.guest) {
        localStorage.setItem('guestName', payload.guest.name);
        localStorage.setItem('guestIdCard', payload.guest.idCard);
        localStorage.setItem('phone', payload.guest.phone);
      }
      if (payload.checkInInfo) {
        localStorage.setItem('checkInTime', payload.checkInTime || new Date().toString());
        localStorage.setItem('stayDays', payload.checkInInfo.stayDays);
        localStorage.setItem('deposit', payload.deposit);
      }
      
      commit('setRoomInfo', payload);
    },
    loadCheckInInfo({ commit }) {
      // 从localStorage恢复数据
      const currentRoom = localStorage.getItem('currentRoom');
      if (currentRoom) {
        const guest = {
          name: localStorage.getItem('guestName') || '',
          idCard: localStorage.getItem('guestIdCard') || '',
          phone: localStorage.getItem('phone') || ''
        };
        
        const checkInInfo = {
          stayDays: localStorage.getItem('stayDays') || 1
        };
        
        const deposit = parseFloat(localStorage.getItem('deposit')) || 0;
        const checkInTime = localStorage.getItem('checkInTime') || '';
        
        commit('setRoomInfo', {
          room: currentRoom,
          guest,
          checkInInfo,
          deposit,
          checkInTime
        });
      }
    },
    clearCheckInInfo({ commit }) {
      // 清除localStorage
      localStorage.removeItem('currentRoom');
      localStorage.removeItem('checkInTime');
      localStorage.removeItem('guestName');
      localStorage.removeItem('guestIdCard');
      localStorage.removeItem('phone');
      localStorage.removeItem('stayDays');
      localStorage.removeItem('deposit');
      
      commit('clearRoomInfo');
    }
  },
  getters: {
    isCheckedIn: state => !!state.currentRoom,
    currentGuest: state => state.guestInfo,
    checkInDetails: state => state.checkInInfo,
    getRoomNumber: state => state.currentRoom,
    getDeposit: state => state.deposit
  }
})
