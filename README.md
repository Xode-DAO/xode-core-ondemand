<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://xode-node.staginglab.info/_next/image?url=%2Fassets%2FXode_logo_white.png&w=256&q=75" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

## Description

This API monitors pending extrinsics in the Xode parachain, which operates under the Polkadot relay chain. When a pending extrinsic is detected, the API triggers an on-demand operation to help finalize the extrinsic and ensure block production within the Xode parachain. This mechanism is designed to support reliable execution and timely block inclusion of critical transactions.

## Project setup
1. Fork and Clone repository

2. Install dependencies
```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

```

## Resources
Before deploying the application, ensure the following services and tools are available:

### 🛠️ Required Services
- **MySQL**  
  Ensure a MySQL database is available and accessible to the application.

- **Node.js**  
  Recommended: v18.x or later

- **npm** or **yarn**

---

## 🌍 Environment Variables

Create a `.env` file in the root of the project and define the following variables:

```env
# Wallet seed phrase (DO NOT expose this publicly)
MNEMONIC="your twelve word seed phrase here"

# Public RPC endpoints for the supported chains
PASEO_RPC_ENDPOINT="https://example-rpc.paseo.network"
KUSAMA_RPC_ENDPOINT="https://kusama-rpc.polkadot.io"
POLKADOT_RPC_ENDPOINT="https://rpc.polkadot.io"

# Xode RPC endpoints for various networks
XODE_PASEO_RPC_ENDPOINT="https://rpc.xode-paseo.network"
XODE_KUSAMA_RPC_ENDPOINT="https://rpc.xode-kusama.network"
XODE_POLKADOT_RPC_ENDPOINT="https://rpc.xode-polkadot.network"

# DATABASE
DB_HOST="Host"
DB_PORT="Port or 3306"
DB_USERNAME="Username"
DB_PASSWORD="Password"
DB_NAME="Darabase Name"