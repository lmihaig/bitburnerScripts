/** @param {NS} ns */
export function getNodes(ns) {
  var visited = {}, stack = [ns.getHostname()];
  while (stack.length) {
    let node = stack.pop();
    if (!visited[node]) {
      visited[node] = true;
      ns.scan(node).forEach(child => {
        if (!visited[child]) stack.push(child);
      });
    }
  }
  return Object.keys(visited);
}

export function canHack(ns, node, numCracks, SCRIPT_RAM) {
  return ns.getServerNumPortsRequired(node) <= numCracks &&
    ns.getServerMaxRam(node) >= SCRIPT_RAM &&
    ns.getPlayer().skills.hacking >= ns.getServerRequiredHackingLevel(node)
}

export function getPersonalServers(ns) {
  let personalServers = [], i = 0, server;
  while (server = `pserv${i ? '-' + i : ''}`, ns.serverExists(server)) {
    personalServers.push(server);
    i++;
  }
  return personalServers;
}

export function penetrate(ns, node, cracks, homeServer) {
  ns.print(`Penetrating ${node}`);
  for (const crack in cracks) {
    if (ns.fileExists(crack, homeServer)) cracks[crack](node);
  }
}

export function getCracks(ns) {
  return {
    "FTPCrack.exe": ns.ftpcrack,
    "BruteSSH.exe": ns.brutessh,
    "relaySMTP.exe": ns.relaysmtp,
    "HTTPWorm.exe": ns.httpworm,
    "SQLInject.exe": ns.sqlinject
  };
}

export function getNumCracks(ns, cracks) {
  return Object.keys(cracks).filter(file => ns.fileExists(file, 'home')).length;
}

export async function readAndSortChaching(ns) {
    try {
        const fileContent = await ns.read("chaching.txt");
        const serverList = JSON.parse(fileContent);

        serverList.sort((a, b) => b.efficiency - a.efficiency);
        return serverList;
    } catch (error) {
        ns.tprint("Error reading or parsing chaching.txt: " + error);
        return [];
    }
}