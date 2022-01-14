import { createStore } from 'vuex';
import network from "./modules/network";
import user from "./modules/user";
import web3panda from "./modules/web3panda";


const store = createStore({
  modules: {
    network,
    user,
    web3panda
  }
})

export default store;