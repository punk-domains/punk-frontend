import { useEthers } from 'vue-dapp';

const { chainId } = useEthers();

export default {
  namespaced: true,
  
  state: () => ({
    networkCurrency: "ETH",
    networkName: "Unsupported Network",
  }),

  getters: { 
    getChainId() {
      return chainId.value;
    },

    getNetworkCurrency(state) {
      return state.networkCurrency;
    },

    getNetworkName(state) {
      return state.networkName;
    }
  },

  mutations: { 
    setNetworkData(state) {
      if (chainId.value === 137) {
        state.networkName = "Polygon";
        state.networkCurrency = "MATIC";
      } else if (chainId.value === 80001) {
        state.networkName = "Mumbai";
        state.networkCurrency = "MATIC";
      } else if (chainId.value === 3) {
        state.networkName = "Ropsten";
        state.networkCurrency = "ETH";
      } else {
        state.networkName = "Unsupported Network";
        state.networkCurrency = "ETH";
      }
    }
  },

  actions: { 
    
  }

};