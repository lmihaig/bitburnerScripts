import { findNode } from "./utils.js";

/** @param {NS} ns */
export async function main(ns) {
  ns.tprint(findNode(ns, ns.args[0]));
  await ns.sleep(100);
}