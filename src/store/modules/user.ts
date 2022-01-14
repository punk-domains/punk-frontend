import { useEthers, displayEther, shortenAddress } from 'vue-dapp';
const { address, balance } = useEthers();

export default {
  namespaced: true,
  
  state: () => ({ 
    userAddress: null,
    userShortAddress: null,
    userBalanceWei: 0,
    userBalance: 0
  }),

  getters: { 
    getUserAddress(state) {
      return state.userAddress;
    },
    getUserShortAddress(state) {
      return state.userShortAddress;
    },
    getUserBalance(state) {
      return state.userBalance;
    },
    getUserBalanceWei(state) {
      return state.userBalanceWei;
    }
  },

  mutations: { 
    setUserData(state) {
      state.userAddress = address.value;
      state.userShortAddress = shortenAddress(address.value);
      state.userBalanceWei = balance.value;
      state.userBalance = displayEther(balance.value);
    }
  },

  actions: { 
    
  }

};