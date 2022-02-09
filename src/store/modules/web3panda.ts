import { ethers } from 'ethers';
import { displayEther, useEthers } from 'vue-dapp';
import addresses from "../../abi/addresses.json";
import factoryAbi from "../../abi/Web3PandaTLDFactory.json";
import tldAbi from "../../abi/Web3PandaTLD.json";

const { chainId, signer } = useEthers();

export default {
  namespaced: true,
  
  state: () => ({ 
    domainPrices: null, // object of key/value pairs where key is TLD name and value is domain price
    factoryAddress: null,
    factoryContract: null,
    tlds: [],
    tldsKey: null,
    tldAddresses: {}, // object of key/value pairs where key is TLD name and value is TLD address
    tldAddressesKey: null
  }),

  getters: { 
    getDomainPrices(state) {
      return state.domainPrices;
    },
    getFactoryContract(state) {
      return state.factoryContract;
    },
    getTlds(state) {
      return state.tlds;
    },
    getTldAddresses(state) {
      return state.tldAddresses;
    },
    getTldAddressesKey(state) {
      return state.tldAddressesKey;
    }
  },

  mutations: { 
    setFactoryContract(state) {
      state.factoryAddress = addresses["Web3PandaTLDFactory"][String(chainId.value)];

      if (state.factoryAddress) {
        state.tldsKey = "tlds" + chainId.value;
        state.tldAddressesKey = "tldAddresses" + chainId.value;

        const intfc = new ethers.utils.Interface(factoryAbi);
        state.factoryContract = new ethers.Contract(state.factoryAddress, intfc, signer.value);
      }
      
    }
  },

  actions: { 
    async fetchTlds({ dispatch, commit, state }) {
      commit("setFactoryContract");

      if (state.factoryContract) {
        state.tlds = await state.factoryContract.getTldsArray();

        // fetch TLDs array from local storage
        let lsTlds = [];
  
        if (state.tlds) {
          lsTlds = JSON.parse(localStorage.getItem(state.tldsKey));
  
          if (lsTlds === null) {
            lsTlds = [];
          }
        }
  
        // if length in local storage is less than what was just fetched from blockchain, do these:
        if (lsTlds.length < state.tlds.length) {
          localStorage.setItem(state.tldsKey, JSON.stringify(state.tlds));
  
          // fetch TLD addresses from blockchain and update local storage
          for (let tldName of state.tlds) {
            let tldAddress = await state.factoryContract.tldNamesAddresses(tldName);
            state.tldAddresses[tldName] = tldAddress;
          }
  
          localStorage.setItem(state.tldAddressesKey, JSON.stringify(state.tldAddresses));
        } else {
  
          try {
            state.tldAddresses = JSON.parse(localStorage.getItem(state.tldAddressesKey));
          } catch {
            console.log("Error getting tldAddresses from local storage.")
          }
        }

        // fetch user's default names
        dispatch('user/fetchUserDomainNames', null, { root: true });

        // fetch domain prices
        for (let tldName of state.tlds) {
          const intfc = new ethers.utils.Interface(tldAbi);
          const contract = new ethers.Contract(state.tldAddresses[tldName], intfc, signer.value);

          const price = await contract.price();

          if (!state.domainPrices) {
            state.domainPrices = {}
          }

          state.domainPrices[tldName] = displayEther(price);
        }
      }
    }
  }
};