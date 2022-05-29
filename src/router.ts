import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

import About from './views/About.vue'
import BrowserExtension from './views/BrowserExtension.vue'
import DomainDetails from './views/DomainDetails.vue'
import Home from './views/Home.vue'
import HowItWorks from './views/HowItWorks.vue'
import L2Dao from './views/partners/L2Dao.vue'
import UnstoppablePolygonRefund from './views/partners/UnstoppablePolygonRefund.vue'
import Profile from './views/Profile.vue'
import PunkAngelNft from './views/nft/PunkAngelNft.vue'
import SearchDomains from './views/SearchDomains.vue'
import SendTokens from './views/SendTokens.vue'
import TldBuy from './views/TldBuy.vue'
import TldDetails from './views/TldDetails.vue'
import Tlds from './views/Tlds.vue'
import TransferDomain from './views/TransferDomain.vue'

// For info on using Vue Router with the Composition API, see https://next.router.vuejs.org/guide/advanced/composition-api.html

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/about',
    name: 'About',
    component: About,
  },
  {
    path: '/browser',
    name: 'BrowserExtension',
    component: BrowserExtension,
  },
  {
    path: '/domain/:domainChain/:tld/:domainName',
    name: 'DomainDetails',
    component: DomainDetails,
    props: true
  },
  {
    path: '/how',
    name: 'HowItWorks',
    component: HowItWorks,
  },
  {
    path: '/nft/angel',
    name: 'PunkAngelNft',
    component: PunkAngelNft,
  },
  {
    path: '/partners/l2dao',
    name: 'L2Dao',
    component: L2Dao,
  },
  {
    path: '/partners/udpolygon',
    name: 'UnstoppablePolygonRefund',
    component: UnstoppablePolygonRefund,
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
  },
  {
    path: '/search-domain',
    name: 'SearchDomains',
    component: SearchDomains,
  },
  {
    path: '/send-tokens',
    name: 'SendTokens',
    component: SendTokens,
  },
  {
    path: '/transfer/:tld/:domainName',
    name: 'TransferDomain',
    component: TransferDomain,
    props: true
  },
  {
    path: '/buy-tld',
    name: 'TldBuy',
    component: TldBuy,
    props: true
  },
  {
    path: '/tld/:domainChain/:tld',
    name: 'TldDetails',
    component: TldDetails,
    props: true
  },
  {
    path: '/tlds/',
    name: 'Tlds',
    component: Tlds,
  },
  // Fallback route for handling 404s
  {
    path: '/:pathMatch(.*)*',
    name: '404',
    component: () => import('./views/Error404.vue'),
  },
]

const router = createRouter({
  // If app is not hosted at the domain root, make sure to pass the `base` input here: https://next.router.vuejs.org/api/#parameters
  history: createWebHashHistory(),
  routes,
})

export default router
