import { getNodes, canHack, getPersonalServers, penetrate, getCracks, getNumCracks, readAndSortChaching} from "./utils.js";

/** @param {NS} ns */
export async function main(ns) {
  let nodes = [];
  const SCRIPT = "moneymoneymoney.js";
  let SCRIPT_RAM = ns.getScriptRam(SCRIPT);
  const homeServer = ns.getHostname();
  const cracks = getCracks(ns);
  let numCracks = getNumCracks(ns, cracks);
  ns.tprint(`Number of available cracks: ${numCracks}`);
  const targetList = await readAndSortChaching(ns)
  const target = targetList[0]["server"]

  ns.tprint(`Targeting ${target}`)

  function getHackableNodes() {
    return getNodes(ns).filter(node => canHack(ns, node, numCracks, SCRIPT_RAM))
      .concat(getPersonalServers(ns)).concat(["home"]);
  }

  function deployHack(node) {
    ns.print(`Deploying to ${node}`);
    ns.scp(SCRIPT, node);

    if (!ns.hasRootAccess(node) && numCracks >= ns.getServerNumPortsRequired(node)) {
      penetrate(ns, node, cracks, homeServer);
      ns.nuke(node);
    }

    ns.scriptKill(SCRIPT, node);
    let maxThreads = Math.floor((ns.getServerMaxRam(node) - ns.getServerUsedRam(node)) / SCRIPT_RAM);
    ns.exec(SCRIPT, node, maxThreads, target);
  }

  var i = 0;
  // Main loop
  while (true) {
    let newNodes = getHackableNodes();
    if (SCRIPT_RAM != ns.getScriptRam(SCRIPT)) {
      newNodes.forEach(node => deployHack(node));
    } else {
      newNodes.filter(node => !nodes.includes(node)).forEach(node => deployHack(node));
    }

    nodes = newNodes;
    ns.print(`Hacking nodes: ${nodes.join(', ')}`);
    ns.print(`${i}`);
    i++;
    SCRIPT_RAM = ns.getScriptRam(SCRIPT);
    await ns.sleep(1000);
  }
}
