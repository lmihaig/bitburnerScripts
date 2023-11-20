/** @param {NS} ns **/
export async function main(ns) {
  let maxServers = ns.getPurchasedServerLimit();
  let maxRAM = ns.getPurchasedServerMaxRam();
  let money = ns.getPlayer().money;

  let servers = ns.getPurchasedServers();
  let ramSizes = servers.map(server => ns.getServerMaxRam(server));
  let curMaxSize = Math.max(...ramSizes);

  let { optimalRAM, curPrice, priceForNextRAMLevel } = findOptimalRAM(ns, money, servers, maxServers, maxRAM);


  let confirmation = await ns.prompt(`Current Max RAM Size: ${curMaxSize}
  Affordable RAM Size for Upgrade/Purchase: ${optimalRAM}
  Price for affordable step: ${ns.formatNumber(curPrice)}
  Price for upgrading to the next level of RAM: ${ns.formatNumber(priceForNextRAMLevel)}
  Do you want to proceed with the upgrade? (yes/no)`);
  if (confirmation) {
    var i = 0;
    servers.forEach(server => ns.upgradePurchasedServer(server, optimalRAM));
    while (ns.purchaseServer("pserv", optimalRAM) != "" && i < maxServers) {
      i++;
    }
    ns.tprint(`Purchased ${i} servers`);
  } else {
    ns.tprint("Upgrade cancelled.");
  }

  await ns.sleep(100)
}


function findOptimalRAM(ns, budget, currentServers, maxServers, maxRAM) {
  let optimalRAM = 0;
  let curPrice = 0;
  let priceForNextRAMLevel = 0;

  for (let ram = 8; ram <= maxRAM; ram *= 2) {
    let totalUpgradeCost = calculateTotalUpgradeCost(ns, currentServers, ram);
    let totalNewServersCost = calculateTotalNewServersCost(ns, budget, currentServers.length, maxServers, ram);

    if (totalUpgradeCost + totalNewServersCost <= budget) {
      optimalRAM = ram;
      curPrice = totalUpgradeCost + totalNewServersCost;
      if (ram * 2 <= maxRAM) {
        let nextLevelUpgradeCost = calculateTotalUpgradeCost(ns, currentServers, ram * 2);
        let nextLevelNewServersCost = calculateTotalNewServersCost(ns, budget, currentServers.length, maxServers, ram * 2);
        priceForNextRAMLevel = nextLevelUpgradeCost + nextLevelNewServersCost;
      }
    }
  }

  return { optimalRAM, curPrice, priceForNextRAMLevel };
}

function calculateTotalUpgradeCost(ns, servers, ram) {
  return servers.reduce((sum, server) => {
    let serverRam = ns.getServerMaxRam(server);
    return serverRam < ram ? sum + ns.getPurchasedServerUpgradeCost(server, ram) : sum;
  }, 0);
}

function calculateTotalNewServersCost(ns, budget, currentServerCount, maxServers, ram) {
  if (currentServerCount >= maxServers) {
    return 0;
  }
  let newServerCost = ns.getPurchasedServerCost(ram);
  let availableSlots = maxServers - currentServerCount;
  let maxNewServers = Math.floor((budget - calculateTotalUpgradeCost(ns, servers, ram)) / newServerCost);
  maxNewServers = Math.min(maxNewServers, availableSlots);
  return maxNewServers * newServerCost;
}
