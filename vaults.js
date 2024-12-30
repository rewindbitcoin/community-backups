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

import { SIGNING_MESSAGE, VAULT_PATH } from "./constants";
import { mnemonicToSeedSync, validateMnemonic } from "bip39";
import { sha256 } from "@noble/hashes/sha2";
import * as networks from "./networks";
import { BIP32Factory } from "bip32";
import { MessageFactory } from "bitcoinjs-message";
import * as secp256k1 from "@bitcoinerlab/secp256k1";
const BIP32 = BIP32Factory(secp256k1);
const MessageAPI = MessageFactory(secp256k1);

export const deriveVault = ({ mnemonic, index, network }) => {
  if (!validateMnemonic(mnemonic))
    throw new Error(`Invalid mnemonic ${mnemonic}`);
  const vaultPath = VAULT_PATH.replace(
    "<network>",
    network === networks.bitcoin ? "0" : "1",
  ).replace("<index>", index.toString());
  const masterNode = BIP32.fromSeed(mnemonicToSeedSync(mnemonic), network);
  const vaultNode = masterNode.derivePath(vaultPath);
  const vaultId = vaultNode.publicKey.toString("hex");
  if (!vaultNode.privateKey) throw new Error("Could not generate a privateKey");

  const signature = MessageAPI.sign(
    SIGNING_MESSAGE,
    vaultNode.privateKey,
    true, // assumes compressed
  );
  const cipherKey = sha256(signature);

  return { vaultId, cipherKey };
};
