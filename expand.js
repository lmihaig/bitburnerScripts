/** @param {NS} ns **/
export async function main(ns) {
  const maxServers = ns.getPurchasedServerLimit();
  const maxRAM = ns.getPurchasedServerMaxRam();
  const money = ns.getPlayer().money;
  const servers = ns.getPurchasedServers();

  if (servers.length < maxServers) {
    buyServers(ns, money, servers, maxServers, 8);
  } else {
    const { optimalRAM, totalCost, nextRAMLevelCost } = findOptimalRAM(ns, money, servers, maxRAM);

    if (optimalRAM === currentMaxRAM(ns, servers)) {
      ns.tprint(`Can't afford upgrade. Next upgrade (to ${optimalRAM * 2}GB) will cost: ${ns.formatNumber(nextRAMLevelCost)}`);
    } else {
      const confirmation = await ns.prompt(`Optimal RAM: ${optimalRAM}GB,
       Total Cost: ${ns.formatNumber(totalCost)},
       Next Level Cost: ${ns.formatNumber(nextRAMLevelCost)}
       Proceed? (yes/no)`);
      if (confirmation) {
        upgradeServers(ns, servers, optimalRAM);
      } else {
        ns.tprint("Upgrade cancelled.");
      }
    }
  }

  await ns.sleep(100);
}

function currentMaxRAM(ns, servers) {
  return Math.max(...servers.map(server => ns.getServerMaxRam(server)));
}

function buyServers(ns, budget, currentServers, maxServers, ram) {
  const serverCost = ns.getPurchasedServerCost(ram);
  let purchasedCount = 0;

  while (budget >= serverCost && currentServers.length + purchasedCount < maxServers) {
    const serverName = `pserv-${purchasedCount}`;
    if (ns.purchaseServer(serverName, ram)) {
      purchasedCount++;
      budget -= serverCost;
    }
  }

  ns.tprint(`Purchased ${purchasedCount} servers with ${ram}GB RAM`);
}

function findOptimalRAM(ns, budget, servers, maxRAM) {
  let optimalRAM = 8;
  let totalCost = 0;
  let nextRAMLevelCost = 0;

  for (let ram = 8; ram <= maxRAM; ram *= 2) {
    const upgradeCost = calculateUpgradeCost(ns, servers, ram);
    if (upgradeCost <= budget) {
      optimalRAM = ram;
      totalCost = upgradeCost;
      nextRAMLevelCost = ram < maxRAM ? calculateUpgradeCost(ns, servers, ram * 2) : 0;
    } else {
      break;
    }
  }

  return { optimalRAM, totalCost, nextRAMLevelCost };
}

function upgradeServers(ns, servers, ram) {
  servers.forEach(server => ns.upgradePurchasedServer(server, ram));
  ns.tprint(`Upgraded ${servers.length} servers to ${ram}GB RAM`);
}

function calculateUpgradeCost(ns, servers, ram) {
  return servers.reduce((sum, server) => {
    const serverRam = ns.getServerMaxRam(server);
    return serverRam < ram ? sum + ns.getPurchasedServerUpgradeCost(server, ram) : sum;
  }, 0);
}
