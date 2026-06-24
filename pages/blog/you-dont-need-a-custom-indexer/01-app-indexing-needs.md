---
title: "Cardano DApp 101: Tracking Smart Contract State"
date: 2026/05/12
description: "What are the requirements for tracking smart contract state in a DApps based on the different CL nodes and wallets?"
author: paluh
---

> Plan:
> * Should we actually change the approach and make this a three part series?
> * The first part 

## Introduction

As we are designing and working on different flavours of Cardano Lightning nodes/wallets we were forced to iterate over a few architectural choices which were related to the question of how to track the state of our smart contracts on the chain. In this short series of instalments I will focus on a bird eye view of the problem trying to contextualise it using different DApp types and their requirements.
The type of DApp which I will describe is following what we have in Cardano Lightning - a single threaded, single smart contract flow (I will cover those details soon).

<!-- Should we have this resume here - it provides some credibility but probably it just boring as every such a section:
More personally I'm a dev with a five years of experience on Cardano, who contributed to three serious production-grade chain followers and indexers in Haskell:
  * One modular chain follower for the Marlowe Runtime system
  * One based on sync-db and PostgreSQL materialized views + PostgREST
  * One powering the Glacier Drop backend
I also worked with the old plutus-apps framework and shipped a few frontend DApps or prototypes.
-->

### The audience

This article is not some revolutionary piece with a game changing breakthrough. I don't hesitate to dissect some basics of EUTxO in it as well. If you are experienced Cardano developer you can probably just scroll through it or skip it entirely.

## What a DApp Actually Needs?

### Smart Contract Execution Basics

On Cardano, smart contracts together with their state live inside UTxOs. Since every UTxO is immutable any new contract state requires a new UTxO holding it which is locked at the same smart contract address. Of course the old state has to be processed and consumed first, which means that a transaction should grab the current UTxO and create a new one with the updated state.

In a simple case (no forks) this creates an **execution thread** — a linear chain of connected UTxOs linked together by transactions. Each step in this thread is a transaction that:

  * Consumes a contract instance UTxO with the current state.
  * Provides inputs parameters to the smart contract through a redeemer.
  * Outputs a new state and locks it in the UTxO under the same script address.

[Diagram: utxo thread]

From the smart contract perspective a single step is like a method call (or state machine transition if you prefer), where the `redeemer` should indicate which method is actually called and provide arguments for that call. The contract logic then verifies if a proper resulting state given that call is stored in the new UTxO and if all the other expected "side effects" and conditions are correctly implemented by the rest of the transaction. It can check for example, if the right amount of ADA was paid to some address or if a transaction was signed by the right party.

### Tracking an Instance

> Plan:
> * from application perspective we are not necessarily interested in the full history - we want to be able to present the current state and be able to decide who and what can do with it next.
> * that assumption could lead to a design which tries to use snapshots instead of the full thread history.
> * that can lead to a rather problematic situations in the case of rollbacks or mimics/clones which can be created by malicious actors.
> * I don't claim that it is impossible to design a system which can work with snapshots
> * I claim that from my experience it is better to stick to a more honest thread representation of the smart contract state.
> * Even if it pushes a bit of complexity to "the current" state(s) derivation/snapshot it provides means to:
>   * understand the maturity of the current state(s)
>   * explain to the user what happened in the case of rollbacks
>   * present the user full evidence of execution through linking to the block explorer(s)

From the DApp perspective, what is usually needed is the current state of the contract on the chain so that appropriate party can interact with it. This could lead to a design which only needs to query the current UTxOs snapshot instead of the full thread history but the picture can become more murky when we consider rollback recovery and our general understanding of the state maturity.
I don't want to say that it is impossible to design a system which can work with snapshots and snapshot diffing, but from my experience it is better to stick to a more honest thread representation of the smart contract state and derive from it on the app level the current situation. It can be used to better understand what is happening, when to execute an action or present to the user the tx history or explanations in the case of rollbacks.

<!-- Garbage below?
As stated above we really want to preserve an initial state of the contract and a list of transitions (transactions). Every transition consists really of a redeemer (method and its parameters) and an output datum (new contract state) and UTxO id which stores it.
Of course, one problem of tracking is identification of the contract instance between the transaction outputs.
We can see that contract instances from that perspective could be identified by the initial UTxO of a thread. This gives all the parties involved a common value to share
-->

> Should I add comment about rollback and subsequent redeployment as re instantiation?
> Should I mention here "thread token" pattern as a way to keep identification simpler and strategy for witnessing invariants:
>     Thread token - a unique NFT minted in the first transaction and locked with the state until the contract is closed. The minting procedure could witness the initial conditions, and presence of the token in the subsequent UTxOs could prove (in a constant time) invariants preservation.
>     > Is this at all relevant?

### Executing an Action

#### Transaction Building

In addition to indexing, the DApp must facilitate user or system interaction with the smart contract. It should actively build the next transaction in the thread by providing contract specific transaction builder.

[Diagram: app input -> serialisation -> new state -> new UTxO]

It is not enough to provide the smart contract input because it can not cover the transaction fees or required deposits. In order to identify UTxOs which can be used to cover that expenses the DApp should be able to find and select user's funding UTxOs. It is usually impossible to know in advance which addresses the user will use to fund the transaction, so in the most generic case the DApp should be able to query any address from the current full UTxO set or use user's wallet to provide a funding UTxO pool.

> NOTE
> We use term `user` rather freely here, but sometimes your backend can be the user as well. For example, in the case of a Lightning node, the node itself is the user so clearly we have to cover the wallet funding UTxO selection.

[Diagram: user wallet -> funding UTxO(s) -> DApp -> transaction builder]

> WARNING!
> Do not use cardano-node directly for this purpose — AFAIK it is not designed for this kind of concurrent heavy querying by your backend.


#### Transaction Submission

Building a transaction is only half the job — it must also be submitted and confirmed on the chain.

You can let the user's wallet submit the transaction, submit it to your backend node or manage a bit more involved submission queue on your backend which will take care of resubmissions.
Using only the wallet or direct node submission is simple but risky. Standard and very sensible cardano-node behavior is to not care about resubmission - if "its own" transaction was rolled back it won't be reinserted into the mempool so it won't be included in the upcoming blocks. If a user's wallet or you backend uses only this simplified submission method then the transaction can be lost which could be severely consequential for the user and the DApp in the case of timely sensitive transactions.

A backend submission queue gives you full control and reliable resubmission on rollbacks. However, backend-only submission can cause issues because the wallet would not know (till they are included in the block) that some its UTxOs were used in a transaction, potentially leading to double-spends. The recommended approach is a dual submission strategy: submit through your backend queue for reliability, while also forwarding the signed transaction to the wallet for submission so it stays aware of all the spent UTxOs.

<!-- NEEDED?
A more in depth discussion on the design of the tx submission queue will be a topic of another instalment.
-->

### Tools For The Job

The above requirements can look very different depending on the type of application you’re building. A pure frontend DApp (like our Cardano Lightning wallet: https://app.konduit.channel) can often satisfy them using only the wallet and public indexers which expose HTTP APIs, while merchant's or payment processor's Lightning nodes typically need  more involved but robust solution with their own indexer for speed and reliability.

## The Blockchain Reality Check

It’s tempting to think that building your own chain follower gives you a "real-time" view of the blockchain. This is a common misconception.
The truth is, on Cardano you’re never truly up to date. Blocks are produced roughly every 20–30 seconds, and rollbacks can (and do) happen. Your view of the chain is always somewhat temporary or not fully reliable.
A chain follower gives you a stream of events (new blocks and rollbacks), while public APIs give you a queryable UTxO snapshot and also detailed access to the history (!). For tracking execution threads, the snapshot approach works sufficiently well as long as the API facilitates execution thread reconstruction (for example `consumed_by` information for a given UTxO). And for coin selection, the plain snapshot approach is actually ideal.

In most L1 DApp scenarios which are executed on the chain, the difference of a few seconds rarely matters. Additionally whenever we deal with some information from the recent blocks we should still approach that with a healthy dose of scepticism - in some cases it is even better to delay a user action by a few seconds to avoid UX friction in the rollback case.

## You Do Not Need a Custom Indexer

When building a Cardano DApp, a developer actually has three main indexing options:

* Build your own chain follower that connects directly to a Cardano node or connect to it via Ogmios.

* Use existing HTTP REST APIs which provide info of the chain state. There are ready to use public hosted APIs (Blockfrost, Koios, CardanoScan, Cexplorer, etc.).

* Deploy existing indexing software on the own infra (Kupo, DBSync, etc.).

Building your own chain follower using the node’s chain sync protocol is technically interesting (`typed-protocols` are really interesting etc. from a Haskeller perspective ;-)), but in most cases it’s unnecessary cost.

> Mention below the different scope of the frontend indexer which is only interested in tracking a subset of the contracts. In the context of the Cardano Lightning this is a lighting wallet app.

The simplest approach is to use public HTTP APIs like Blockfrost, CardanoScan, Koios or Cexplorer (which plan to add `consumed-by` information to the API). These require no infrastructure and are excellent for lightweight or pure frontend applications.

> Mention here requirement for tracking all the contract and batching need etc. in the context of Cardano Node.

When you need more performance or control, running your own indexer becomes a viable option.
I will focus on Kupo as it is our choice in the recent projects. It’s fast, lightweight, and customizable enough to cover most DApp needs without the overhead of a full chain follower.

## Kupo in Practice (deep dive)

## The Submission Queue Architecture

## Mobile & PWA Considerations (Konduit-specific tips)

## Conclusion



