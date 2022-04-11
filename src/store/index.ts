import { createStore } from 'vuex';
import network from "./modules/network";
import user from "./modules/user";
import punk from "./modules/punk";
import klima from "./modules/klima";


const store = createStore({
  modules: {
    network,
    user,
    punk,
    klima
  }
})

export default store;