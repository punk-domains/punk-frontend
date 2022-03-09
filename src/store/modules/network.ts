import { useEthers } from 'vue-dapp';
import tokens from "../../abi/tokens.json";

const { chainId } = useEthers();

export default {
  namespaced: true,
  
  state: () => ({
    networkCurrency: "ETH",
    networkName: "Unsupported Network",
    supportedNetworks: {
      10: "Optimism",
      100: "Gnosis Chain",
      137: "Polygon",
      42161: "Arbitrum"
    }
  }),

  getters: { 
    getBlockExplorerBaseUrl() {
      if (chainId.value === 3) {
        return "https://ropsten.etherscan.io";
      } else if (chainId.value === 4) {
        return "https://rinkeby.etherscan.io";
      } else if (chainId.value === 10) {
        return "https://optimistic.etherscan.io";
      } else if (chainId.value === 69) {
        return "https://kovan-optimistic.etherscan.io";
      } else if (chainId.value === 77) {
        return "https://blockscout.com/poa/sokol";
      } else if (chainId.value === 100) {
        return "https://blockscout.com/xdai/mainnet";
      } else if (chainId.value === 137) {
        return "https://polygonscan.com";
      } else if (chainId.value === 42161) {
        return "https://arbiscan.io";
      } else if (chainId.value === 80001) {
        return "https://mumbai.polygonscan.com";
      } else if (chainId.value === 42161) {
        return "https://arbiscan.io";
      } else if (chainId.value === 421611) {
        return "https://testnet.arbiscan.io";
      }
    },
    
    getChainId() {
      return chainId.value;
    },

    getNetworkCurrency(state) {
      return state.networkCurrency;
    },

    getNetworkName(state) {
      const supportedIds = Object.keys(state.supportedNetworks);

      if (supportedIds && supportedIds.includes(String(chainId.value))) {
        return state.networkName;
      }

      return "Unsupported Network";
    },

    getSupportedNetworks(state) {
      return state.supportedNetworks;
    },

    getSupportedNetworkIds(state) {
      return Object.keys(state.supportedNetworks);
    },

    getSupportedNetworkNames(state) {
      return Object.values(state.supportedNetworks);
    },

    getTokens(state) {
      return tokens[String(chainId.value)]
    },

    isNetworkSupported(state) {
      const supportedIds = Object.keys(state.supportedNetworks);

      if (supportedIds && supportedIds.includes(String(chainId.value))) {
        return true;
      }

      return false;
    }
  },

  mutations: { 
    setNetworkData(state) {
      if (chainId.value === 137) {
        state.networkName = "Polygon";
        state.networkCurrency = "MATIC";
      } else if (chainId.value === 10) {
        state.networkName = "Optimism";
        state.networkCurrency = "ETH";
      } else if (chainId.value === 69) {
        state.networkName = "Optimism Testnet";
        state.networkCurrency = "ETH";
      } else if (chainId.value === 77) {
        state.networkName = "Gnosis Testnet";
        state.networkCurrency = "SPOA";
      } else if (chainId.value === 100) {
        state.networkName = "Gnosis Chain";
        state.networkCurrency = "XDAI";
      } else if (chainId.value === 137) {
        state.networkName = "Polygon";
        state.networkCurrency = "MATIC";
      } else if (chainId.value === 42161) {
        state.networkName = "Arbitrum";
        state.networkCurrency = "ETH";
      } else if (chainId.value === 421611) {
        state.networkName = "Arbitrum Testnet";
        state.networkCurrency = "ETH";
      } else if (chainId.value === 80001) {
        state.networkName = "Mumbai";
        state.networkCurrency = "MATIC";
      } else if (chainId.value === 3) {
        state.networkName = "Ropsten";
        state.networkCurrency = "ETH";
      } else if (chainId.value === 4) {
        state.networkName = "Rinkeby";
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