import { ethers } from 'ethers';

export default {
  namespaced: true,
  
  state: () => ({ 
    factoryAddress: null,
    tlds: null, // object of key/value pairs where key is TLD name and value is TLD address
  }),

  getters: { 
    getTlds(state) {
      return state.tlds;
    }
  },

  mutations: { 
    
  },

  actions: { 
    
  }
};