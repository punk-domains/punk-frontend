import { createStore } from 'vuex';
import network from "./modules/network";
import user from "./modules/user";
import punk from "./modules/punk";


const store = createStore({
  modules: {
    network,
    user,
    punk
  }
})

export default store;