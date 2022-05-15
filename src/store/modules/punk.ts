import { ethers } from 'ethers';
import { useEthers } from 'vue-dapp';
import addresses from "../../abi/addresses.json";
import tldsJson from "../../abi/tlds.json";
import factoryAbi from "../../abi/PunkTLDFactory.json";
import tldAbi from "../../abi/PunkTLD.json";

const { chainId, signer } = useEthers();

export default {
  namespaced: true,
  
  state: () => ({ 
    domainPrices: null, // object of key/value pairs where key is TLD name and value is domain price
    factoryAddress: null,
    tlds: [],
    tldsKey: null,
    tldAddresses: {}, // object of key/value pairs where key is TLD name and value is TLD address
    tldAddressesKey: null
  }),

  getters: { 
    getDomainPrices(state) {
      return state.domainPrices;
    },
    getTlds(state) {
      return state.tlds;
    },
    getTldAddresses(state) {
      return state.tldAddresses;
    },
    getTldAddressesKey(state) {
      return state.tldAddressesKey;
    },
    getTldAbi() {
      return tldAbi;
    },
    getFactoryAbi() {
      return factoryAbi;
    }
  },

  actions: { 
    async fetchTlds({ dispatch, commit, state, getters }) {
      let networkId = 137;

      if (chainId.value) {
        networkId = chainId.value;
      }

      state.tlds = [];

      for (let tld of Object.keys(tldsJson[networkId])) {
        state.tlds.push(tld);
        state.tldAddresses[tld] = tldsJson[networkId][tld];

        const intfc = new ethers.utils.Interface(getters.getTldAbi);
        const contract = new ethers.Contract(tldsJson[networkId][tld], intfc, signer.value);

        const price = await contract.price();

        if (!state.domainPrices) {
          state.domainPrices = {}
        }

        state.domainPrices[tld] = price;
      }

      // fetch user's default names
      dispatch('user/fetchUserDomainNames', null, { root: true });
    }
  }
};