---
title: Home
description: "Scalable, Instant L2 on Cardano"
type: page
---

## Why Lightning?

+ Secure: The integrity of the L1

+ Near instant settlement

+ Highly scalable 

## Catalyst Proposal

Vote for us [here](https://cardano.ideascale.com/c/idea/122403)

## How it works

As the name suggests, Cardano Lightning is to be a port of [Bitcoin Lightning](https://lightning.network) to Cardano. 

The network is made up of bidirectional payment channels. 
A payment channel is some means by which one party can make a payment,
and the other party can receive it. 
Either party can close the channel at any time at no risk to the other party. 
In a bidirectional payment channel, payment can be made in both directions. 

The magic really happens in **hopping** from one payment channel to another. 
For example, if Bob has a payment channel with both Alice and Charlie,
then Alice can pay Charlie by effectively paying Bob and Bob paying Charlie.

## Roadmap

### Phase 1: Payment gateways

1. Protocol spec: Based on a lit review, together with a set of ADRs.
2. Smart contracts: Together with a full test coverage, and tx-building code.
3. Docs and SDKs: To build dapps atop Cardano Lightning, and facilitate product integrations.
4. POC: Hub and spoke network. 

### Phase 2: Routing & Discoverability

Continuing the work of phase 1 to a fully decentralised network with optimal channel routing.
