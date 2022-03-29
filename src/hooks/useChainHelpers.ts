export default function useChainHelpers() {

  function getChainName(chainId) {
    if (chainId === 137) {
      return "Polygon";
    } else if (chainId === 10) {
      return "Optimism";
    } else if (chainId === 69) {
      return "Optimism Testnet";
    } else if (chainId === 77) {
      return "Gnosis Testnet";
    } else if (chainId === 100) {
      return "Gnosis Chain";
    } else if (chainId === 137) {
      return "Polygon";
    } else if (chainId === 42161) {
      return "Arbitrum";
    } else if (chainId === 421611) {
      return "Arbitrum Testnet";
    } else if (chainId === 80001) {
      return "Polygon Testnet";
    } else if (chainId === 3) {
      return "Ropsten";
    } else if (chainId === 4) {
      return "Rinkeby";
    } else {
      return "Unsupported Network";
    }
  }

  function switchNetwork(networkName) {
    let method;
    let params;

    if (networkName == "Ropsten") {
      method = "wallet_switchEthereumChain"
      params = [{ chainId: "0x3" }] 
    } else if (networkName == "Rinkeby") {
      method = "wallet_switchEthereumChain"
      params = [{ chainId: "0x4" }] 
    } else if (networkName == "Polygon Testnet") {
      method = "wallet_addEthereumChain"
      params = [{ 
        blockExplorerUrls: [ "https://mumbai.polygonscan.com" ],
        chainId: "0x13881",
        chainName: "Mumbai Testnet",
        nativeCurrency: { decimals: 18, name: "Matic", symbol: "MATIC" }, 
        rpcUrls: ["https://matic-mumbai.chainstacklabs.com"]
      }] 
    } else if (networkName == "Arbitrum Testnet") {
      method = "wallet_addEthereumChain"
      params = [{ 
        blockExplorerUrls: [ "https://testnet.arbiscan.io" ],
        chainId: "0x66EEB",
        chainName: "Arbitrum Testnet",
        nativeCurrency: { decimals: 18, name: "ETH", symbol: "ETH" }, 
        rpcUrls: ["https://rinkeby.arbitrum.io/rpc"]
      }] 
    } else if (networkName == "Arbitrum") {
      method = "wallet_addEthereumChain"
      params = [{ 
        blockExplorerUrls: [ "https://arbiscan.io" ],
        chainId: "0xA4B1",
        chainName: "Arbitrum One",
        nativeCurrency: { decimals: 18, name: "ETH", symbol: "ETH" }, 
        rpcUrls: ["https://arb1.arbitrum.io/rpc"]
      }] 
    } else if (networkName == "Optimism") {
      method = "wallet_addEthereumChain"
      params = [{ 
        blockExplorerUrls: [ "https://optimistic.etherscan.io/" ],
        chainId: "0xA",
        chainName: "Optimism",
        nativeCurrency: { decimals: 18, name: "ETH", symbol: "ETH" }, 
        rpcUrls: ["https://mainnet.optimism.io"]
      }] 
    } else if (networkName == "Optimism Testnet") {
      method = "wallet_addEthereumChain"
      params = [{ 
        blockExplorerUrls: [ "https://kovan-optimistic.etherscan.io/" ],
        chainId: "0x45",
        chainName: "Optimism Testnet",
        nativeCurrency: { decimals: 18, name: "ETH", symbol: "ETH" }, 
        rpcUrls: ["https://kovan.optimism.io"]
      }] 
    } else if (networkName == "Polygon") {
      method = "wallet_addEthereumChain"
      params = [{ 
        blockExplorerUrls: [ "https://polygonscan.com" ],
        chainId: "0x89",
        chainName: "Polygon PoS Chain",
        nativeCurrency: { decimals: 18, name: "MATIC", symbol: "MATIC" }, 
        rpcUrls: ["https://polygon-rpc.com/"]
      }] 
    } else if (networkName == "Gnosis Testnet") {
      method = "wallet_addEthereumChain"
      params = [{ 
        blockExplorerUrls: [ "https://blockscout.com/poa/sokol" ],
        chainId: "0x4D",
        chainName: "Gnosis Testnet",
        nativeCurrency: { decimals: 18, name: "SPOA", symbol: "SPOA" }, 
        rpcUrls: ["https://sokol.poa.network"]
      }] 
    } else if (networkName == "Gnosis Chain") {
      method = "wallet_addEthereumChain"
      params = [{ 
        blockExplorerUrls: [ "https://blockscout.com/xdai/mainnet" ],
        chainId: "0x64",
        chainName: "Gnosis Chain",
        nativeCurrency: { decimals: 18, name: "XDAI", symbol: "XDAI" }, 
        rpcUrls: ["https://rpc.gnosischain.com"]
      }] 
    }

    return { 
      method: method, 
      params: params
    }
  }

  // RETURN
  return {
    getChainName,
    switchNetwork
  }
}