import { ethers } from 'ethers';
import { useEthers, displayEther, shortenAddress } from 'vue-dapp';
import erc20Abi from '../../abi/Erc20.json';
import useChainHelpers from "../../hooks/useChainHelpers";

const { getFallbackProvider } = useChainHelpers();
const { address, balance, chainId, signer } = useEthers();

export default {
  namespaced: true,
  
  state: () => ({ 
    selectedName: null, // domain name that appears as the main profile name
    selectedNameData: null,
    selectedNameImageSvg: null,
    selectedNameKey: null,
    usdcAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    usdcContract: null,
    usdcAllowance: 0, // user's USDC allowance for wrapper contract
    usdcBalance: 0, // user's USDC balance
    userAddress: null,
    userAllDomainNames: [], // all domain names of current user (default + manually added)
    userDomainNamesKey: null,
    userShortAddress: null,
    userBalanceWei: 0, // MATIC balance in wei
    userBalance: 0 // MATIC balance
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
    getUsdcAddress(state) {
      return state.usdcAddress;
    },
    getUsdcAllowance(state) {
      return state.usdcAllowance;
    },
    getUsdcBalance(state) {
      return state.usdcBalance;
    },
    getUsdcContract(state) {
      return state.usdcContract;
    },
  },

  mutations: { 
    addDomainManually(state, domainName) {
      let userDomainNames = [];

      if (address.value) {
        state.userDomainNamesKey = "userDomainNames" + String(chainId.value) + String(shortenAddress(address.value));
        state.selectedNameKey = "selectedName" + String(chainId.value) + String(shortenAddress(address.value));

        if (localStorage.getItem(state.userDomainNamesKey)) {
          userDomainNames = JSON.parse(localStorage.getItem(state.userDomainNamesKey));
        }

        if (!userDomainNames.includes(domainName)) {
          userDomainNames.push(domainName);
        }

        for (let udName of userDomainNames) {
          if (!state.userAllDomainNames.includes(udName)) {
            state.userAllDomainNames.push(udName);
          }
        }

        localStorage.setItem(state.userDomainNamesKey, JSON.stringify(userDomainNames));
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
      localStorage.setItem(state.selectedNameKey, state.selectedName);
      localStorage.setItem("connected", "metamask");
    },

    setSelectedNameKey(state, selectedNameKey) {
      state.selectedNameKey = selectedNameKey;
    },

    setSelectedNameData(state, nameData) {
      state.selectedNameData = nameData;
    },

    setSelectedNameImageSvg(state, imageSvg) {
      state.selectedNameImageSvg = imageSvg;
    },

    setUserDomainNamesKey(state, key) {
      state.userDomainNamesKey = key;
    },

    setUsdcAllowance(state, allowance) {
      state.usdcAllowance = allowance;
    },

    setUsdcBalance(state, balance) {
      state.usdcBalance = balance;
    },

    setUsdcContract(state, contract) {
      state.usdcContract = contract;
    },

    setUserAllDomainNames(state, domains) {
      state.userAllDomainNames = domains;
    }
  },

  actions: { 
    async fetchUserDomainNames({ dispatch, commit, state, rootState, rootGetters }, newAccount) {
      let userDomainNames = [];
      let userDomainNamesKey = null;
      let selectedNameKey = null;

      if (address.value) {
        userDomainNamesKey = "userDomainNames" + String(chainId.value) + String(shortenAddress(address.value));
        selectedNameKey = "selectedName" + String(chainId.value) + String(shortenAddress(address.value));

        commit("setSelectedNameKey", selectedNameKey);
        commit("setUserDomainNamesKey", userDomainNamesKey);

        // reset user data in case there's a switch between accounts
        if (newAccount) {
          if (localStorage.getItem(selectedNameKey) && localStorage.getItem(selectedNameKey) !== String(null)) {
            commit('setSelectedName', localStorage.getItem(selectedNameKey));
          } else {
            commit('setSelectedName', null);
            commit("setSelectedNameData", null);
            commit("setSelectedNameImageSvg", null);
          }

          commit("setUserAllDomainNames", []);
        }
      
        if (localStorage.getItem(userDomainNamesKey)) {
          userDomainNames = JSON.parse(localStorage.getItem(userDomainNamesKey));
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

        if (localStorage.getItem(selectedNameKey) && localStorage.getItem(selectedNameKey) !== String(null)) {
          commit('setSelectedName', localStorage.getItem(selectedNameKey));
        } else {
          localStorage.setItem(selectedNameKey, state.selectedName);
        }

        localStorage.setItem(userDomainNamesKey, JSON.stringify(userDomainNames));
        
        dispatch("fetchSelectedNameData");
      }
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

    async fetchUserUsdcData({commit, state, rootGetters}) {
        const fProvider = getFallbackProvider(137); // Polygon
  
        const usdcIntfc = new ethers.utils.Interface(erc20Abi);
        const contract = new ethers.Contract(state.usdcAddress, usdcIntfc, fProvider);

        commit('setUsdcContract', contract);
  
        if (address.value) {
          // check allowance for the wrapper contract
          const allowanceMwei = await contract.allowance(address.value, rootGetters["klima/getKlimaWrapperAddress"]);
          const allowance = ethers.utils.formatUnits(allowanceMwei, "mwei"); // USDC has 6 decimals

          commit('setUsdcAllowance', allowance);
    
          // check user's USDC balance
          const balanceMwei = await contract.balanceOf(address.value);
          const balance = ethers.utils.formatUnits(balanceMwei, "mwei"); // USDC has 6 decimals

          commit('setUsdcBalance', balance);
        }  
    },

    async removeDomainFromUserDomains({commit, state}, domainName) {
      if (chainId.value) {
        if (localStorage.getItem(state.userDomainNamesKey)) {
          const userDomainNames = JSON.parse(localStorage.getItem(state.userDomainNamesKey));
          state.userAllDomainNames = [];

          let newDomainNamesArray = [];
          for (let udName of userDomainNames) {
            if (udName != domainName) {
              newDomainNamesArray.push(udName);
              state.userAllDomainNames.push(udName);
            }
          }

          localStorage.setItem(state.userDomainNamesKey, JSON.stringify(newDomainNamesArray));

          // if the removed domain name is currently marked as selected name, replace it with another or null
          if (localStorage.getItem(state.selectedNameKey) && localStorage.getItem(state.selectedNameKey)==domainName) {
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