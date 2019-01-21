import Vue from 'vue'
import Vuex from 'vuex'
import mutations from './mutations'
import getters from './getters'
Vue.use(Vuex)
const state = {
  audio: ''
}
export default new Vuex.Store({
  state,
  mutations,
  getters
})
