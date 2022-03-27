export default function useDomainHelpers() {
  // COMPUTED
  function buyNotValid(domainName: string) {
    if (domainName === "") {
      return true;
    } else if (domainName === null) {
      return true;
    } else if (domainName.includes(".")) {
      return true;
    } else if (domainName.includes(" ")) {
      return true;
    } else if (domainName.includes("%")) {
      return true;
    } else if (domainName.includes("&")) {
      return true;
    } else if (domainName.includes("?")) {
      return true;
    } else if (domainName.includes("#")) {
      return true;
    } else if (domainName.includes("/")) {
      return true;
    }

    return false;
  }

  // RETURN
  return {
    buyNotValid
  }
}