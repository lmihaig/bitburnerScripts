import {getNumCracks, canHack, getNodes, getCracks} from "./utils.js";

/** @param {NS} ns */
export async function main(ns) {
    const hackableServers = getHackableServers(ns);
    const serverData = hackableServers.map(server => calculateServerData(ns, server));
    const sortedServers = serverData.sort((a, b) => b.efficiency - a.efficiency);
    
    await ns.write("chaching.txt", JSON.stringify(sortedServers, null, 2), "w");
}

function getHackableServers(ns) {
    return getNodes(ns).filter(node => canHack(ns, node, getNumCracks(ns, getCracks(ns), 'home'), 0));
}

function calculateServerData(ns, serverName) {
    const curr = ns.getServer(serverName);

    const maxMoney = ns.getServerMaxMoney(serverName)
    const hackTime = ns.getHackTime(serverName);
    const growTime = ns.getGrowTime(serverName);
    const weakenTime = ns.getWeakenTime(serverName);
    const securityLevel = curr.hackDifficulty;
    const minSecurityLevel = curr.minDifficulty;

    // ns.tprint(`Server: ${serverName}`);
    // ns.tprint(`Max Money: ${maxMoney}`);
    // ns.tprint(`Security Level: ${curr.hackDifficulty}, Min Security Level: ${curr.minDifficulty}`);
    // if (hackTime === 0 || growTime === 0 || weakenTime === 0) {
    //     ns.tprint("Warning: One of the times is zero, causing division by zero.");
    //     return null;
    // }
    // if (securityLevel === 0) {
    //     ns.tprint("Warning: Security level is zero.");
    //     return null;
    // }

    const totalOperationTime = hackTime + growTime + weakenTime;
    const efficiency = (maxMoney / totalOperationTime) * (minSecurityLevel / securityLevel);
    // ns.tprint(`Efficiency: ${efficiency}`);

    return {
        server: serverName,
        maxMoney,
        hackTime,
        growTime,
        weakenTime,
        securityLevel,
        minSecurityLevel,
        efficiency
    };
}
