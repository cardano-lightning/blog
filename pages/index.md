---
title: Cardano Lightning
description: "Permissionless and secure, near instant, and highly scalable"
type: index
---

# Cardano Lightning

## Why Lightning?

- Secure: The integrity of the L1
- Near instant settlement
- Highly scalable 

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

See our [roadmap](./roadmap)! 
