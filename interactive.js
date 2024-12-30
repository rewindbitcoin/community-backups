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

import readline from "bare-readline";
import tty from "bare-tty";
import fs from "bare-fs";
import path from "bare-path";
import { deriveVault } from "./vaults";
import { decrypt } from "./cipher";
import { validateMnemonic } from "bip39";

import { GAP_LIMIT, NETWORKS } from "./constants";

export default function interactive(bees) {
  console.log(`[info] Interactive mode On. Enter mnemonic and press ENTER.`);

  const rl = readline.createInterface({
    input: new tty.ReadStream(0),
    output: new tty.WriteStream(1),
  });

  rl.on("data", async (line) => {
    line = line.trim();
    if (validateMnemonic(line)) {
      console.log("[info] Valid mnemonic.");

      let found = false;
      for (const networkId of Object.keys(bees)) {
        const network = NETWORKS[networkId];
        const bee = bees[networkId];
        let skipped = 0;
        for (let vaultIndex = 0; skipped < GAP_LIMIT; vaultIndex++) {
          const { vaultId, cipherKey } = deriveVault({
            mnemonic: line,
            index: vaultIndex,
            network,
          });
          const node = await bee.get(vaultId);
          if (!node || !node.value) {
            skipped++;
          } else {
            found = true;
            const decrypted = decrypt(node.value, cipherKey);
            if (decrypted) {
              const filePath = path.join(
                networkId,
                "restored",
                `${vaultId}.json.gz`,
              );
              // Ensure the directory exists
              const directoryPath = path.dirname(filePath);
              fs.mkdirSync(directoryPath, { recursive: true });

              const fileSizeInMB = (node.value.length / 1024 / 1024).toFixed(2);
              console.log(
                `[info] Vault index ${vaultIndex} for ${networkId} saved to ${filePath} (${fileSizeInMB} MB).`,
              );
              // Write the decrypted data to a file named <vaultId>.json.gz
              fs.writeFileSync(filePath, decrypted);
            } else {
              console.log(
                `[error] Could not decrypt vaultId ${vaultId} for ${networkId}`,
              );
            }
          }
        }
      }
      if (!found) console.log(`[info] No backed up vaults for mnemonic.`);
    } else console.log("[info] Mnemonic not valid.");
    console.log(`[info] Enter mnemonic and press ENTER.`);
    rl.prompt();
  });
  rl.prompt();

  return rl;
}
