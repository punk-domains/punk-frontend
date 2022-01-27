import { ethers } from 'ethers';
import tldAbi from "../../abi/Web3PandaTLD.json";
import { useEthers, displayEther, shortenAddress } from 'vue-dapp';

const { address, balance, signer } = useEthers();

export default {
  namespaced: true,
  
  state: () => ({ 
    defaultNames: [],
    selectedName: [], // domain name that appears as the main profile name
    userAddress: null,
    userShortAddress: null,
    userBalanceWei: 0,
    userBalance: 0
  }),

  getters: { 
    getUserAddress(state) {
      return state.userAddress;
    },
    
    getUserBalance(state) {
      return state.userBalance;
    },
    getUserBalanceWei(state) {
      return state.userBalanceWei;
    },
    getUserDefaultNames(state) {
      return state.defaultNames;
    },
    getUserSelectedName(state) {
      return state.selectedName;
    },
    getUserShortAddress(state) {
      return state.userShortAddress;
    },
  },

  mutations: { 
    setUserData(state) {
      state.userAddress = address.value;
      state.userShortAddress = shortenAddress(address.value);
      state.userBalanceWei = balance.value;
      state.userBalance = displayEther(balance.value);
    },

    setDefaultNames(state, defNames) {
      state.defaultNames = defNames;

      

      // choose the first defaultName as state.selectedName
      state.selectedName = defNames[0];

      // TODO: check if selectedName in local storage
        // if yes, check if selectedName still owned by user
          // if yes, set it as state.selectedName
    }
  },

  actions: { 
    async fetchDefaultNames({ commit, rootState }) {
      // fetch user's default names
      let userDefaultNames = [];

      for (let tldName of rootState.web3panda.tlds) {
        const intfc = new ethers.utils.Interface(tldAbi);
        const contract = new ethers.Contract(rootState.web3panda.tldAddresses[tldName], intfc, signer.value);

        const userDefaultName = await contract.defaultNames(address.value);

        if (userDefaultName) {
          userDefaultNames.push(userDefaultName + tldName);
        }
      }

      commit('setDefaultNames', userDefaultNames);
    }

    // fetch name data
  }

};