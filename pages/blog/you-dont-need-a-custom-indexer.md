---
title: "Cardano DApp 101: Kupo Indexer is Enough for Your DApp. Or Maybe Two. Actually, Maybe No Backend at All?"
date: 2026/05/12
description: "Why you should not bother rolling out your own Cardano idexer or even try to drop the backend completely."
author: paluh
---

## Introduction

> This should be as short as possible do not turn this into a résumé. Is this too personal take or would it provide credibility to the post?)

* Nearly five years working on Cardano.
* Contributed to three serious production-grade chain followers and indexers in Haskell:
  * One modular chain follower for the Marlowe Runtime system
  * One based on sync-db and PostgreSQL materialized views + PostgREST
  * One powering the Glacier Drop backend
* Also worked with the old plutus-apps framework and shipped multiple frontend DApps
* Now working on Cardano Lighting stack (and consolidating/rewriting Marlowe runtime) and thinking on that topic.
* Conclusion - my strongest advice is: you probably shouldn’t build your own chain follower and indexer. You should use some existing solution and add a tiny domain specific one on top.

## What a DApp Actually Needs?

### Typical Smart Contract Lifecycle

On Cardano, smart contracts live inside UTxOs. Since UTxOs are immutable, every state change requires consuming the old UTxO and creating a new one with the updated state.
This creates an execution thread — a chain of connected UTxOs linked together by transactions.
Each step in this thread works like a state machine transition (or method call of an object if you prefer ;-)):
  * Transaction consumes the previous state UTxO.
  * It includes parameters in the redeemer.
  * Then it produces a new state UTxO.

  [Diagram]

### Tracking an Instance

To track a contract instance properly, we need to follow and store the full history of this thread, including all transactions (or state extracted from it) and the redeemers used.
Keeping the full history is strongly preferred over keeping only a current snapshot, because rollbacks are possible — it’s much safer to simply drop the tail of the thread when a rollback occurs.
The full transaction history also makes it easier to determine the maturity of the current state and allows users to inspect any step directly on a block explorer.

We can see that contract instances from that perspective could be identified by the initial UTxO of a thread. This gives all the parties involved a common value to share
> Should I add comment about rollback and subsequent redeployment as re instantiation?
> Should I mention here "thread token" pattern as a way to keep identification simpler and strategy for witnessing invariants:
>     Thread token - a unique NFT minted in the first transaction and locked with the state until the contract is closed. The minting procedure could witness the initial conditions, and presence of the token in the subsequent UTxOs could prove (in a constant time) invariants preservation.
>     > Is this at all relevant?

### Executing an Action

#### Transaction Building

In addition to indexing, the DApp must facilitate the actual user or system interaction with the smart contract. It should actively build the next transaction in the thread by providing contract specific transaction builder.
For all the build transactions, an additional funding UTxO are required to pay fees (and required deposits to the contract by the user - ), since the contract’s own UTxO cannot be used for this purpose (ledger rules require at least one extra collateral UTxO which is not on a script address). Usually it is the user responsibility to provide some UTxO which he owns for this purpose and DApp responsibility to do the coin selection (pick only a subset of funding UTxOs which are sufficient to pay for the bill).

You can either let the user’s wallet provide the funding UTxOs pool, or keep track of the current UTxOs set yourself (to be able to query any user address).

```
Do not use cardano-node directly for this purpose — AFAIK it is not designed for this kind of concurrent heavy querying by your backend.
```

#### Transaction Submission

Building a transaction is only half the job — it must also be submitted and confirmed on the chain.

You can let the wallet submit the transaction, or manage a submission queue on your backend.
Using only the wallet is simpler but risky — after a rollback, the node drops the transaction from the mempool and does not resubmit it automatically.
A backend submission queue gives you full control and reliable resubmission on rollbacks.
However, backend-only submission can cause issues because the wallet doesn’t know its funding UTxOs were spent, potentially leading to double-spends.
The recommended approach is a dual submission strategy: submit through your backend queue for reliability, while also forwarding the signed transaction to the wallet so it stays aware of spent UTxOs.

A more in depth discussion on the design of the tx submission queue will be a topic of another instalment.

### Tools For The Job

These requirements can look very different depending on the type of application you’re building. A pure frontend DApp (like a Cardano Lightning wallet) can often satisfy them using only the wallet and public HTTP APIs, while merchant backends and Lightning nodes typically need a more robust backend solution with their own indexer for speed and reliability.


## The Blockchain Reality Check

It’s tempting to think that building your own chain follower gives you a "real-time" view of the blockchain. This is a common misconception.
The truth is, on Cardano you’re never truly up to date. Blocks are produced roughly every 20–30 seconds, and rollbacks can (and do) happen. Your view of the chain is always somewhat temporary.
A chain follower gives you a stream of events (new blocks and rollbacks), while public APIs give you a queryable snapshot. For tracking execution threads, the snapshot approach works very well as long as the API facilitates execution thread reconstruction (for example `consumed_by` information for a given UTxO). For coin selection, these snapshots are actually ideal.

In most DApp scenarios which are executed on the chain, the difference of a few seconds rarely matters. Users should be shown that a transaction is "in progress" rather than treating recent state as final.


## You Do Not Need a Custom Indexer

When building a Cardano DApp, a developer actually has three main options:

* Build your own chain follower that connects directly to a Cardano node (or via Ogmios)
* Use existing HTTP REST APIs which provide info of the chain state. There are ready to use public hosted APIs (Blockfrost, Koios, CardanoScan, Cexplorer).
* Run your own lightweight indexer - we will play this game unfair and focus on Kupo here.

Building your own chain follower using the node’s chain sync protocol is technically interesting (`typed-protocols` are cool from a Haskeller perspective ;-)), but in most cases it’s unnecessary complexity for a production application.

> Mention below the different scope of the frontend indexer which is only interested in tracking a subset of the contracts. In the context of the Cardano Lightning this is a lighting wallet app.

The simplest approach is to use public HTTP APIs like Blockfrost, CardanoScan, Koios or Cexplorer (which plan to add `consumed-by` information to the API). These require no infrastructure and are excellent for lightweight or pure frontend applications.

> Mention here requirement for tracking all the contract and batching need etc. in the context of Cardano Node.

When you need more performance or control, running your own indexer becomes a bit the better choice.
The current best option for most projects is Kupo — it’s fast, lightweight, and very well suited for tracking contract instances using thread tokens.

## Kupo in Practice (deep dive)
## The Submission Queue Architecture
## Mobile & PWA Considerations (Konduit-specific tips)
## Conclusion



