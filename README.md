# Rewind Bitcoin Community Backups

Rewind Bitcoin is a secure, feature-rich Bitcoin wallet designed to protect users' funds from theft and extortion through advanced vaulting mechanisms. This repository contains a core component of the [Rewind Bitcoin](https://rewindbitcoin.com) project, allowing for decentralized, peer-to-peer backups of user vaults, ensuring data integrity and security.

## Introduction

The Community Backups functionality enables users to securely back up their vaults in a decentralized manner. The primary goal is to provide a secure, non-centralized backup solution that leverages peer-to-peer technology, ensuring users retain control over their encrypted backups, even if Rewind Bitcoin ceases to operate for any reason.

Key benefits:

- **Decentralized backups**: Users can maintain backups of their own vaults and backup vaults for all Rewind Bitcoin users, ensuring their data remains secure as long as a node is running.
- **Secure and Encrypted**: Backups are fully encrypted using a key derived from the mnemonic and vault id, ensuring that users who back up others' vaults cannot access the actual contents. Security is guaranteed as long as the mnemonic is securely stored.
- **Community-driven**: Encourage friends or family to use Rewind Bitcoin with confidence, knowing their vaults will be securely backed up by peers running Community Backup nodes.

## Features

### Interactive Mode

- Allows users to input a recovery mnemonic to identify and restore vaults.
- Supports automated decryption and storage of recovered vault data.

### REST API

- Offers endpoints to check vault status and retrieve encrypted vault data.
- This API can be configured as the data source in the Rewind Bitcoin wallet, allowing users to bypass Rewind's servers for enhanced privacy, even though all data is already encrypted.

The application supports multiple networks, including Bitcoin Mainnet, Testnet, and Tape (Rewind's test network). By default, all networks are enabled, but specific ones can be disabled using command-line options. The Tape Network offers a dedicated testing environment with free coins available through a faucet for experimentation.

## Installation

Rewind Bitcoin Community Backups is built on the [Pears](https://pears.com) platform, a peer-to-peer runtime environment for decentralized applications. By leveraging Pears, this program ensures that the application operates without relying on central servers, with the community maintaining the P2P network where the program lives.

### Prerequisites

- **Pears Runtime**: Required to run this program. If you already use Pears applications like Keet, the runtime is likely already installed.
- **Node.js**: Needed to install the Pears runtime if it is not already set up.

### Pears Installation

1. Install the Pears runtime:

   ```bash
   npm i -g pear
   ```

2. To complete the setup, run the `pear` command:

   ```bash
   pear
   ```

### Run the Program

Run the application using `pear`:

```bash
pear run <app-id> [options]
```

Replace `<app-id>` with the provided app key for this program.

### Seeding the Program

To make the application available in a decentralized manner, you can optionally seed it (we kindly encourage you to do so):

```bash
pear seed <app-id>
```

### Verify the Code

To ensure the integrity of the program, you can inspect its codebase directly:

```bash
pear dump <app-id> <folder>
```

## Usage

### Command-Line Options

```bash
Usage: pear run <app-id> [options]

Options:
  --help                    Show this help message
  --enable-api              Enable the REST API
  --port <number>           Specify the port for the REST API (default: random)
  --interactive             Enable interactive mode
  --disable-bitcoin         Disable Bitcoin P2P network
  --disable-testnet         Disable Testnet P2P network
  --disable-tape            Disable Tape P2P network
  --enable-regtest <pubKey> Enable Regtest network with the specified public key
```

By default, all public networks are enabled. At least one network must remain enabled.

### Example Commands

#### Run with The Rest API Enabled on Port 8080 With All Networks Enabled

```bash
pear run <app-id> --enable-api --port 8080
```

#### Disable Tape Network

```bash
pear run <app-id> --disable-tape
```

## Interactive Mode

Interactive mode allows users to restore vaults using their recovery mnemonics.

1. Run the program in interactive mode:

   ```bash
   pear run <app-id> --interactive
   ```

2. Enter your recovery mnemonic when prompted.
3. The program will:
   - Search for matching vaults across enabled networks.
   - Decrypt and save the vault data locally.

## REST API

### API Endpoints

#### `GET /[:networkId]/vaults/:vaultId/get`

- **Description**: Retrieve vault data by `vaultId`. The optional `networkId` specifies the network (e.g., `testnet`, `tape`). If `networkId` is omitted, the default is `bitcoin`.
- **Response**:
  - `200 OK`: Returns the encrypted vault data as a binary stream.
  - `404 Not Found`: Vault not found.

#### `GET /[:networkId]/vaults/:vaultId/check`

- **Description**: Check if a vault exists by `vaultId`. The optional `networkId` specifies the network (e.g., `testnet`, `tape`). If `networkId` is omitted, the default is `bitcoin`.
- **Response**:
  - `200 OK`: `{ exists: true, message: "Data exists for vaultId: <vaultId>" }`
  - `404 Not Found`: `{ exists: false, message: "No data found for vaultId: <vaultId>" }`

#### `GET /generate-204`

- **Description**: Returns a `204 No Content` status. This endpoint can be used as a health check or a lightweight API response.
- **Response**:
  - `204 No Content`: Indicates the server is operational.

### Example Run

Start the server:

```bash
pear run <app-id> --enable-api --port 8080
```

Access the endpoints:

- **Check vault**:

  ```bash
  curl http://localhost:8080/vaults/<vaultId>/check
  ```

- **Get vault**:

  ```bash
  curl http://localhost:8080/vaults/<vaultId>/get
  ```

If you're using a specific network (e.g., `testnet` or `tape`), include the `networkId` in the URL:

- **Check vault**:

  ```bash
  curl http://localhost:8080/testnet/vaults/<vaultId>/check
  ```

- **Get vault**:

  ```bash
  curl http://localhost:8080/tape/vaults/<vaultId>/get
  ```

## License

This project is licensed under the MIT License.

---

For more information, visit [Rewind Bitcoin](https://rewindbitcoin.com).
