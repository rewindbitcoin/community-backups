/**
 * Project: Rewind Bitcoin
 * Website: https://rewindbitcoin.com
 *
 * Author: Jose-Luis Landabaso
 * Email: landabaso@gmail.com
 *
 * Contact Email: hello@rewindbitcoin.com
 *
 * License: MIT License
 *
 * Copyright (c) 2025 Jose-Luis Landabaso, Rewind Bitcoin
 */

/** @typedef {import('pear-interface')} */ /* global Pear */

import { PUBKEYS } from "./constants";
import process from "bare-process";
import Hyperswarm from "hyperswarm";
import Hyperbee from "hyperbee";
import Corestore from "corestore";
import b4a from "b4a";

import interactive from "./interactive";
import webApi from "./webApi";

const { teardown, argv } = Pear;

const args = argv.slice(0);

// Define networks and disable flags
const defaultNetworks = ["bitcoin", "testnet", "tape"];
const disabledNetworks = defaultNetworks.filter((network) =>
  args.includes(`--disable-${network}`),
);

// Determine active networks
const activeNetworks = defaultNetworks.filter(
  (network) => !disabledNetworks.includes(network),
);

// Handle regtest explicitly
const regtestIndex = args.indexOf("--enable-regtest");
if (regtestIndex !== -1) {
  if (!args[regtestIndex + 1]) {
    console.error("[error] The --enable-regtest option requires a public key.");
    process.exit(1);
  }
  try {
    const regtestPubKey = b4a.from(args[regtestIndex + 1], "hex");
    if (regtestPubKey.length !== 32) 
      throw new Error("Invalid public key length. Expected 32 bytes.");
    activeNetworks.push("regtest");
    PUBKEYS["regtest"] = regtestPubKey;
  } catch (err) {
    console.error(
      `[error] Invalid Regtest public key: ${args[regtestIndex + 1]}`,
    );
    console.error(`[error] ${err.message}`);
    process.exit(1);
  }
}

// Check if at least one network is enabled
if (args.includes("--help") || activeNetworks.length === 0) {
  console.log(`
Usage: program [options]

Options:
  --help                    Show this help message
  --enable-api              Enable the REST API
  --port <number>           Specify the port for the REST API (default: random)
  --interactive             Enable interactive mode
  --disable-bitcoin         Disable Bitcoin P2P network
  --disable-testnet         Disable Testnet P2P network
  --disable-tape            Disable Tape P2P network
  --enable-regtest <pubKey> Enable Regtest network with the specified public key

By default, all networks are enabled. At least one network must remain enabled.
`);
  process.exit(0);
}

console.log("Welcome to Rewind Bitcoin Community Backups");

const swarms = {};
const bees = {};

for (const networkId of activeNetworks) {
  const pubKey = PUBKEYS[networkId];
  const swarm = new Hyperswarm();
  const store = new Corestore(networkId);
  swarm.on("connection", (conn) => store.replicate(conn));
  const core = store.get({ key: b4a.from(pubKey, "hex") });
  await core.ready();
  swarm.join(core.discoveryKey);

  console.log(
    `[info] Starting with ${core.length} blocks on ${networkId}. Awaiting additional blocks...`,
  );
  core.download({ start: 0, end: -1 });

  // Listen for new blocks and download them
  core.on("append", () => {
    if (core.length === 1) {
      console.log(
        `[info] A new block has been appended on ${networkId}. Awaiting more blocks...`,
      );
    } else {
      console.log(
        `[info] ${core.length} blocks have been appended on ${networkId}. Awaiting additional blocks...`,
      );
    }
  });

  const bee = new Hyperbee(core, {
    keyEncoding: "utf-8",
    valueEncoding: "binary",
  });
  bees[networkId] = bee;
  swarms[networkId] = swarm;
}

let streamsInterface, server;

//Api mode
if (args.includes("--enable-api")) {
  let port = 0; // Default to random
  const portIndex = args.indexOf("--port");
  if (portIndex !== -1 && args[portIndex + 1]) {
    port = parseInt(args[portIndex + 1], 10);
    if (isNaN(port) || port <= 0 || port > 65535) {
      console.error("[error] Invalid port specified.");
      process.exit(1);
    }
  }
  server = await webApi(port, bees);
}

//Interactive mode
if (args.includes("--interactive")) streamsInterface = interactive(bees);

teardown(() => {
  console.log("[info] Initiating graceful shutdown...");

  for (const swarm of Object.values(swarms)) swarm.destroy();

  if (streamsInterface) {
    streamsInterface.close();
    streamsInterface.input.destroy();
    console.log("[info] tty streams closed.");
  }

  if (server)
    server.close(() => {
      console.log("[info] API server closed.");
    });
});
