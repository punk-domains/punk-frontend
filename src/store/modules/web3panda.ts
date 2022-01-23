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
    tlds: [],
    tldAddresses: {}, // object of key/value pairs where key is TLD name and value is TLD address
  }),

  getters: { 
    getTlds(state) {
      return state.tlds;
    },
    getTldAddresses(state) {
      return state.tldAddresses;
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
      commit("setFactoryContract");

      state.tlds = await state.factoryContract.getTldsArray();

      // fetch TLDs array from local storage
      let lsTlds = JSON.parse(localStorage.getItem("tlds"));

      if (!lsTlds) {
        lsTlds = [];
      }

      // if length in local storage is less than what was just fetched from blockchain, do these:
      if (lsTlds.length < state.tlds.length) {
        localStorage.setItem("tlds", JSON.stringify(state.tlds));

        // fetch TLD addresses from blockchain and update local storage
        for (let tldName of state.tlds) {
          let tldAddress = await state.factoryContract.tldNamesAddresses(tldName);
          state.tldAddresses[tldName] = tldAddress;
        }

        localStorage.setItem("tldAddresses", JSON.stringify(state.tldAddresses));
      } else {

        try {
          state.tldAddresses = JSON.parse(localStorage.getItem("tldAddresses"));
        } catch {
          console.log("Error getting tldAddresses from local storage.")
        }
      }

    }
  }
};