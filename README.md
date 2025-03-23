# Decentralized Skill-Based Freelance Marketplace

## Overview

The Decentralized Skill-Based Freelance Marketplace is a Web3-powered platform that connects freelancers with clients using blockchain-based smart contracts. The platform ensures secure transactions, transparent reputation tracking, and fair dispute resolution through a DAO governance system.

## Features

- **Smart Contract Escrow:** Ensures secure payments, only released upon project completion.
- **On-Chain Reputation System:** Freelancers earn reputation NFTs based on their performance.
- **Decentralized Dispute Resolution:** Community-based DAO voting for fair dispute settlements.
- **Web3 Authentication:** Users sign in with their crypto wallets.
  
## Tech Stack

- **Frontend:** React, TailwindCSS
- **Blockchain:** Solidity, Hardhat
- **Storage:** IPFS for decentralized data storage
- **Authentication:**  ethers.js with MetaMask
- **Smart Contracts:** Ethereum 

## Installation

### Prerequisites

- Node.js installed
- MetaMask browser extension

### Steps 

1. **Clone the repository:**
   ```bash
   git clone https://github.com/DeFree.git
   cd DeFree
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Open React-vite**
   ```bash
   cd fnd
   npm install
   npm run dev
   ```

## Usage

1. **Connect Wallet:** Users sign in via MetaMask.
2. **Post a Job:** Clients can post job listings with specific requirements.
3. **Freelancer Bidding:** Freelancers bid on projects using their wallet address.
4. **Escrow Payment:** Clients fund the contract, which is locked in escrow.
5. **Project Completion:** Upon approval, the freelancer receives the payment.
6. **Dispute Resolution:** If needed, the DAO votes on disputes.

## Contribution Guidelines

1. Fork the repository.
2. Create a new branch for your feature (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m "Added new feature"`).
4. Push to the branch (`git push origin feature-name`).
5. Create a pull request.

## Demo Video
https://vimeo.com/1068523716?share=copy#t=0

## due to time contraints voting system upon disputes has not been done.


