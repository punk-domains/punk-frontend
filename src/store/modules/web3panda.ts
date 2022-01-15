import { ethers } from 'ethers';
import { useEthers } from 'vue-dapp';
import addresses from "../../abi/addresses.json";
import factoryAbi from "../../abi/Web3PandaTLDFactory.json";

const { chainId, signer } = useEthers();

export default {
  namespaced: true,
  
  state: () => ({ 
    factoryAddress: null,
    factoryContract: null,
    tlds: [], // object of key/value pairs where key is TLD name and value is TLD address
  }),

  getters: { 
    getTlds(state) {
      return state.tlds;
    }
  },

  mutations: { 
    setFactoryContract(state) {
      state.factoryAddress = addresses["Web3PandaTLDFactory"][String(chainId.value)];

      const intfc = new ethers.utils.Interface(factoryAbi);
      state.factoryContract = new ethers.Contract(state.factoryAddress, intfc, signer.value);
    }
  },

  actions: { 
    async fetchTlds({ commit, state }) {
      console.log(chainId.value);

      commit("setFactoryContract");

      

      state.tlds = await state.factoryContract.getTldsArray();

      console.log(state.tlds);
    }
  }
};