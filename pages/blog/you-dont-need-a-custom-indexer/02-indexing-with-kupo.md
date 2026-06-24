---
title: "Cardano DApp 101: Indexing with Kupo"
date: 2026/05/12
description: "What are the requirements for tracking smart contract state in a DApps based on the different CL nodes and wallets?"
author: paluh
---

> Plan:
> - What is Kupo.
>   - Indexing.
>   - Current UTxO set querying.
> - Outline the procedure for the thread indexing 
-

## What is Kupo?

### UTxO Centric Indexer

Kupo is a fast and lightweight indexer. Its data model focuses on UTxOs and not on transactions themselves at the moment. What I mean by that is that the [main query data endpoint](https://cardanosolutions.github.io/kupo/#operation/getAllMatches) returns UTxOs and not transactions and there is no way to get the transactions themselves.
This can be problematic whenever DApp wants to access detailed minting context redeemers or some other transaction level information (ceritificates registration, governance actions etc.).


### Indexing the DApp State

Core flexibility of this indexer is expressed through pattern matching on different UTxOs. The set of patterns can be dynamically managed but in our smart contract case you can imagine that the baseline filter will by just a hash of that smart contract - UTxOs which are locked by that smart contract are possible suspects - they could but don't have to be our instances.

### Searching For Funding UTxOs

Beside instance tracking we need to create and fund transactions. In order to find present UTxOs for an arbitrary address we need an unfiltered set of UTxOs but we are interested in the real ones not the historical ones ("spent unspent outputs" :-P).
In theory you could try to use `cardano-node` [directly] which exposes a querying API for the UTxO set but it is not intended to be used that way. Please note that the UTxO set maintained by the node is not indexed by address and in order to find that kind of subset of UTxOs requires a linear scan of the whole UTxO which in the context of UTxO-HD (UTxO storage on the hard drive) can be even more 
expensive.

Kupo comes with an [excellent documentation](https://cardanosolutions.github.io/kupo/) so we won't be trying to repeat it here but we will try to outline the pieces which are relevant for our core use case - smart contract thread indexing.

> Move this "somewhere":
> malicious actor could create UTxOs at the smart contract address which are not valid or mimic existing instances to mislead the app



### A Closer Look at our Thread Indexing Needs

but our both our protocols are transaction centric to facilitate batching. We still want to explore that possibility before we move to a direct chain follower implementations.

What transaction centric really means in our case is that we use transaction level validator which goes over the transaction and validates it as a set of cardano-lightning smart contract instances.


## Indexing The Thread

Our tech choices:

* [ ] SQLite for the storage.

* [ ] TypeScript for coding.


Requirements:

* [ ] Expose the thread information in domain specific way (not just UTxOs)

* [ ] Connect domain information to the maturity etc. to facilitate interaction and UX.

* [ ] Handle rollbacks and keep the thread information consistent.


Let's y start with the last requirement - rollbacks. On the storage level we will approach this through a simple SQL `ON DELETE CASCADE` approach meaning we will have a table `block`:

```sql
CREATE TABLE block (
  header_hash BLOB NOT NULL,
  block_no INTEGER NOT NULL,
  slot_no INTEGER NOT NULL,
  PRIMARY KEY (slot_no)
);
```

All our domain level information will be connected to the block. 

```sql
CREATE TABLE thread_output (
  block_header_hash BLOB NOT NULL,

)
```


