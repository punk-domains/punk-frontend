import { ethers } from 'ethers';
import { useEthers } from 'vue-dapp';
import addresses from "../../abi/addresses.json";
import factoryAbi from "../../abi/PunkTLDFactory.json";
import tldAbi from "../../abi/PunkTLD.json";

const { chainId, provider, signer } = useEthers();

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
      let urls;

      if (chainId.value == 137) {
        urls = [
          "https://polygon-rpc.com/", 
          "https://polygon-mainnet.g.alchemy.com/v2/" + import.meta.env.VITE_ALCHEMY_POLYGON_KEY
        ]; 
      } else if (chainId.value == 10) {
        urls = [
          "https://opt-mainnet.g.alchemy.com/v2/" + import.meta.env.VITE_ALCHEMY_OPTIMISM_KEY,
          "https://mainnet.optimism.io", 
        ]; 
      } 

      let fProvider = provider.value;

      if (urls) {
        const providers = urls.map(url => new ethers.providers.JsonRpcProvider(url));
        fProvider = new ethers.providers.FallbackProvider(providers, 1);
      }

      state.factoryAddress = addresses["PunkTLDFactory"][String(chainId.value)];

      if (state.factoryAddress) {
        state.tldsKey = "tlds" + chainId.value;
        state.tldAddressesKey = "tldAddresses" + chainId.value;

        const intfc = new ethers.utils.Interface(factoryAbi);
        state.factoryContract = new ethers.Contract(state.factoryAddress, intfc, fProvider);
      }
      
    }
  },

  actions: { 
    async fetchTlds({ dispatch, commit, state }) {
      commit("setFactoryContract");

      state.tlds = [];
      
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

          state.domainPrices[tldName] = price;
        }
      }
    }
  }
};