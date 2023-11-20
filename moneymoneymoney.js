/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  let securityThreshold = ns.getServerMinSecurityLevel(target) + 5;
  let moneyThreshold = ns.getServerMaxMoney(target) * 0.6;

  while (true) {
    if (ns.getServerSecurityLevel(target) > securityThreshold) {
      await ns.weaken(target)
    }
    else if (ns.getServerMoneyAvailable(target) < moneyThreshold) {
      await ns.grow(target)
    }
    else {
      await ns.hack(target)
    }
  }
}
