import { ethers } from 'ethers';
import { useEthers, displayEther, shortenAddress } from 'vue-dapp';

const { address, balance, chainId, signer } = useEthers();

export default {
  namespaced: true,
  
  state: () => ({ 
    selectedName: null, // domain name that appears as the main profile name
    selectedNameData: null,
    selectedNameImageSvg: null,
    selectedNameKey: null,
    userAddress: null,
    userAllDomainNames: [], // all domain names of current user (default + manually added)
    userDomainNamesKey: null,
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
    getUserAllDomainNames(state) {
      return state.userAllDomainNames;
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
    addDomainManually(state, domainName) {
      let userDomainNames = [];

      if (chainId.value) {
        this.userDomainNamesKey = "userDomainNames" + String(chainId.value) + String(shortenAddress(address.value));
        this.selectedNameKey = "selectedName" + String(chainId.value) + String(shortenAddress(address.value));

        if (localStorage.getItem(this.userDomainNamesKey)) {
          userDomainNames = JSON.parse(localStorage.getItem(this.userDomainNamesKey));
        }

        if (!userDomainNames.includes(domainName)) {
          userDomainNames.push(domainName);
        }

        for (let udName of userDomainNames) {
          if (!state.userAllDomainNames.includes(udName)) {
            state.userAllDomainNames.push(udName);
          }
        }

        localStorage.setItem(this.userDomainNamesKey, JSON.stringify(userDomainNames));
      }
      
    },

    setUserData(state) {
      state.userAddress = address.value;
      state.userShortAddress = shortenAddress(address.value);
      state.userBalanceWei = balance.value;
      state.userBalance = displayEther(balance.value);
    },

    setDefaultName(state, defName) {
      if (!state.userAllDomainNames.includes(defName)) {
        state.userAllDomainNames.push(defName);
      }
    },

    setSelectedName(state, selectedName) {
      state.selectedName = selectedName;
      localStorage.setItem(this.selectedNameKey, state.selectedName);
      localStorage.setItem("connected", "metamask");
    },

    setSelectedNameData(state, nameData) {
      state.selectedNameData = nameData;
    },

    setSelectedNameImageSvg(state, imageSvg) {
      state.selectedNameImageSvg = imageSvg;
    },

    setUserAllDomainNames(state, domains) {
      state.userAllDomainNames = domains;
    }
  },

  actions: { 
    async fetchUserDomainNames({ dispatch, commit, state, rootState, rootGetters }, newAccount) {
      let userDomainNames = [];

      if (chainId.value) {
        this.userDomainNamesKey = "userDomainNames" + String(chainId.value) + String(shortenAddress(address.value));
        this.selectedNameKey = "selectedName" + String(chainId.value) + String(shortenAddress(address.value));
      }

      // reset user data in case there's a switch between accounts
      if (newAccount) {
        if (localStorage.getItem(this.selectedNameKey) && localStorage.getItem(this.selectedNameKey) !== String(null)) {
          commit('setSelectedName', localStorage.getItem(this.selectedNameKey));
        } else {
          commit('setSelectedName', null);
          commit("setSelectedNameData", null);
          commit("setSelectedNameImageSvg", null);
        }

        commit("setUserAllDomainNames", []);
      }
      
      if (localStorage.getItem(this.userDomainNamesKey)) {
        userDomainNames = JSON.parse(localStorage.getItem(this.userDomainNamesKey));
      }

      for (let udName of userDomainNames) {
        commit('setDefaultName', udName);
      }
      
      // fetch user's default name
      const intfc = new ethers.utils.Interface(rootGetters["punk/getTldAbi"]);
      const contract = new ethers.Contract(rootGetters["klima/getKlimaTldAddress"], intfc, signer.value);

      const userDefaultName = await contract.defaultNames(address.value);

      if (userDefaultName) {
        commit('setDefaultName', userDefaultName + rootState.klima.klimaTldName);

        if (!userDomainNames.includes(userDefaultName + rootState.klima.klimaTldName)) {
          userDomainNames.push(userDefaultName + rootState.klima.klimaTldName);
        }

        if (!state.selectedName) {
          commit('setSelectedName', userDefaultName + rootState.klima.klimaTldName);
        }
      }

      if (localStorage.getItem(this.selectedNameKey) && localStorage.getItem(this.selectedNameKey) !== String(null)) {
        commit('setSelectedName', localStorage.getItem(this.selectedNameKey));
      } else {
        localStorage.setItem(this.selectedNameKey, state.selectedName);
      }

      localStorage.setItem(this.userDomainNamesKey, JSON.stringify(userDomainNames));
      
      dispatch("fetchSelectedNameData");
    },

    // fetch selectedName data (image etc.)
    async fetchSelectedNameData({commit, state, rootGetters}) {

      if (state.selectedName) {
        const nameArr = state.selectedName.split(".");
        const name = nameArr[0];
        
        if (name) {
          const intfc = new ethers.utils.Interface(rootGetters["punk/getTldAbi"]);
          const contract = new ethers.Contract(rootGetters["klima/getKlimaTldAddress"], intfc, signer.value);

          const nameData = await contract.domains(name);

          commit("setSelectedNameData", nameData);

          // get contract image for that token ID
          let metadata = await contract.tokenURI(nameData.tokenId);
          let imgFound = false;

          if (nameData.data) {
            const customData = JSON.parse(nameData.data);
          
            if (customData.imgAddress && !customData.imgAddress.startsWith("0x")) {
              commit("setSelectedNameImageSvg", customData.imgAddress.replace("ipfs://", "https://ipfs.io/ipfs/"));
              imgFound = true;
            } else if (customData.imgAddress) {
              // fetch image URL of that PFP
              const pfpInterface = new ethers.utils.Interface([
                "function tokenURI(uint256 tokenId) public view returns (string memory)"
              ]);
              const pfpContract = new ethers.Contract(customData.imgAddress, pfpInterface, signer.value);
              metadata = await pfpContract.tokenURI(customData.imgTokenId);
            }

            if (metadata.includes("ipfs://")) {
              metadata = metadata.replace("ipfs://", "https://ipfs.io/ipfs/");
            } 
            
            if (metadata.includes("http")) {
              const response = await fetch(metadata);
              const result = await response.json();

              if (result && result.image) {
                commit("setSelectedNameImageSvg", result.image.replace("ipfs://", "https://ipfs.io/ipfs/"));
                imgFound = true;
              } else {
                commit("setSelectedNameImageSvg", null);
              }
            }
          }

          if (metadata && !imgFound) {
            const json = atob(metadata.substring(29));
            const result = JSON.parse(json);

            if (result && result.image) {
              commit("setSelectedNameImageSvg", result.image);
            } else {
              commit("setSelectedNameImageSvg", null);
            }
          }
        }
      }
      
    },

    async removeDomainFromUserDomains({commit, state}, domainName) {
      if (chainId.value) {
        this.userDomainNamesKey = "userDomainNames" + String(chainId.value) + String(shortenAddress(address.value));
        this.selectedNameKey = "selectedName" + String(chainId.value) + String(shortenAddress(address.value));

        if (localStorage.getItem(this.userDomainNamesKey)) {
          const userDomainNames = JSON.parse(localStorage.getItem(this.userDomainNamesKey));
          state.userAllDomainNames = [];

          let newDomainNamesArray = [];
          for (let udName of userDomainNames) {
            if (udName != domainName) {
              newDomainNamesArray.push(udName);
              state.userAllDomainNames.push(udName);
            }
          }

          localStorage.setItem(this.userDomainNamesKey, JSON.stringify(newDomainNamesArray));

          // if the removed domain name is currently marked as selected name, replace it with another or null
          if (localStorage.getItem(this.selectedNameKey) && localStorage.getItem(this.selectedNameKey)==domainName) {
            if (newDomainNamesArray.length > 0) {
              commit('setSelectedName', newDomainNamesArray[0]);
            }
            commit('setSelectedName', null);
          }
        }
  
        
      }
    }
  }

};