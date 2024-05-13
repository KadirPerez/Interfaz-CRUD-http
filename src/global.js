import { createStore } from 'vuex';

export default createStore({
  state: {
    token: null,
    autorizacion: false, 
  },
  mutations: {
    setToken(state, token) {
      state.token = token;
    },
    setAutorizacion(state, authorized) { 
      state.autorizacion = authorized;
    },
  },
  actions: {
    updateToken({ commit }, token) {
      commit('setToken', token);
    },
    updateAutorizacion({ commit }, authorized) {
      commit('setAutorizacion', authorized);
    },
  },
});
