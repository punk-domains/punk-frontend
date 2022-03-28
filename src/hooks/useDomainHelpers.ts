export default function useDomainHelpers() {
  // COMPUTED
  function buyNotValid(domainName: string) {
    if (domainName === "") {
      return {invalid: true, message: null};
    } else if (domainName === null) {
      return {invalid: true, message: null};
    } else if (domainName.includes(".")) {
      return {invalid: true, message: "Dots not allowed"};
    } else if (domainName.includes(" ")) {
      return {invalid: true, message: "Spaces not allowed"};
    } else if (domainName.includes("%")) {
      return {invalid: true, message: "% not allowed"};
    } else if (domainName.includes("&")) {
      return {invalid: true, message: "& not allowed"};
    } else if (domainName.includes("?")) {
      return {invalid: true, message: "? not allowed"};
    } else if (domainName.includes("#")) {
      return {invalid: true, message: "# not allowed"};
    } else if (domainName.includes("/")) {
      return {invalid: true, message: "/ not allowed"};
    }

    return false;
  }

  // RETURN
  return {
    buyNotValid
  }
}