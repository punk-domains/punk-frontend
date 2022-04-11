import tlds from "../../abi/tlds.json";

export default {
  namespaced: true,
  
  state: () => ({ 
    klimaTldAddress: tlds["137"][".klima"],
    klimaTldName: ".klima"
  }),

  getters: { 
    getKlimaTldAddress(state) {
      return state.klimaTldAddress;
    },
    getKlimaTldName(state) {
      return state.klimaTldName;
    }
  },
};
