import { ethers } from 'ethers';
import tlds from "../../abi/tlds.json";
import tldAbi from '../../abi/PunkTLD.json';
import KlimaPunkDomainsAbi from "../../abi/KlimaPunkDomains.json";
import useChainHelpers from "../../hooks/useChainHelpers";

const { getFallbackProvider } = useChainHelpers();

export default {
  namespaced: true,
  
  state: () => ({ 
    klimaTldAddress: tlds["137"][".klima"],
    klimaTldName: ".klima",
    tldAddr: "0xe8b97542A433e7eCc7bB791872af04DF02A1a6E4",
    tldContract: null,
    wrapperAddress: "0xf7E89ED8106cBa1335e04837E59a28ae1A3D580c",
    wrapperContract: null,
    wrapperPaused: true,
    wrapperTldPrice: null
  }),

  getters: { 
    getKlimaTldAddress(state) {
      return state.klimaTldAddress;
    },
    getKlimaTldContract(state) {
      return state.klimaTldContract;
    },
    getKlimaTldName(state) {
      return state.klimaTldName;
    },
    getKlimaWrapperAddress(state) {
      return state.wrapperAddress;
    },
    getWrapperContract(state) {
      return state.wrapperContract;
    },
    getWrapperPaused(state) {
      return state.wrapperPaused;
    },
    getWrapperTldPrice(state) {
      return state.wrapperTldPrice;
    }
  },

  mutations: {
    setTldContract(state) {
      let fProvider = getFallbackProvider(137); // Polygon

      const tldIntfc = new ethers.utils.Interface(tldAbi);
      state.tldContract = new ethers.Contract(state.tldAddr, tldIntfc, fProvider);
    },

    setWrapperContract(state, contract) {
      state.wrapperContract = contract;
    },

    setWrapperPaused(state, paused) {
      state.wrapperPaused = paused;
    },

    setWrapperTldPrice(state, price) {
      state.wrapperTldPrice = price;
    },
  },

  actions: {
    async fetchWrapperContractData({commit, state}) {
      let fProvider = getFallbackProvider(137); // Polygon

      // Wrapper contract
      const wrapperIntfc = new ethers.utils.Interface(KlimaPunkDomainsAbi);
      const contract = new ethers.Contract(state.wrapperAddress, wrapperIntfc, fProvider);

      commit("setWrapperContract", contract);

      // check if wrapper contract is paused
      const paused = await contract.paused();
      commit("setWrapperPaused", paused);

      // get price
      const priceMwei = await contract.price();
      const domainPrice = ethers.utils.formatUnits(priceMwei, "mwei"); // USDC has 6 decimals
      commit("setWrapperTldPrice", domainPrice);
      
      //this.chosenAllowance = this.domainPrice;
    }
  }
};
