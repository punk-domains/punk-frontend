import { ethers } from 'ethers';
import tldAbi from "../../abi/Web3PandaTLD.json";
import { useEthers, displayEther, shortenAddress } from 'vue-dapp';

const { address, balance, signer } = useEthers();

export default {
  namespaced: true,
  
  state: () => ({ 
    defaultNames: [],
    selectedName: [], // domain name that appears as the main profile name
    selectedNameData: null,
    selectedNameImageSvg: null,
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
    getUserSelectedNameData(state) {
      return state.selectedNameData;
    },
    getUserSelectedNameImageSvg(state) {
      return state.selectedNameImageSvg;
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
    },

    setSelectedName(state, selectedName) {
      state.selectedName = selectedName;
    },

    setSelectedNameData(state, nameData) {
      state.selectedNameData = nameData;
    },

    setSelectedNameImageSvg(state, imageSvg) {
      state.selectedNameImageSvg = imageSvg;
    }
  },

  actions: { 
    async fetchDefaultNames({ dispatch, commit, rootState }) {
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
      commit('setSelectedName', userDefaultNames[0]);

      // TODO: check if selectedName in local storage
        // if yes, check if selectedName still owned by user
          // if yes, set it as state.selectedName
      
      dispatch("fetchSelectedNameData");
    },

    // fetch selectedName data (image etc.)
    async fetchSelectedNameData({commit, state, rootState}) {

      if (state.selectedName) {
        const nameArr = state.selectedName.split(".");
        const name = nameArr[0];
        const domain = "." + nameArr[1];
        
        const intfc = new ethers.utils.Interface(tldAbi);
        const contract = new ethers.Contract(rootState.web3panda.tldAddresses[domain], intfc, signer.value);

        const nameData = await contract.domains(name);

        commit("setSelectedNameData", nameData);
        
        if (nameData.pfpAddress != ethers.constants.AddressZero) {
          // fetch image URL of that PFP
        } else {
          // get contract image for that token ID
          const metadata = await contract.tokenURI(nameData.tokenId);

          if (metadata) {
            const json = atob(metadata.substring(29));
            const result = JSON.parse(json);

            if (result && result.image) {
              commit("setSelectedNameImageSvg", result.image);
            }
            
          }
          
        }
      }
      
    }
  }

};