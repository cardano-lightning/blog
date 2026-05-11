---
title: "Cardano Lightning Protocol Suite"
date: 2026/05/11
description: "Why and how we grew a small family of lightning protocols."
author: paluh, waalge
---

# Cardano Lightning Protocol Suite

## Different Adoption Paths

Protocols (in web, finance, communication etc.) to be useful require a whole ecosystem around them — libraries in different languages, great docs/specs, good user facing apps and users themselves. All that requires stability of the protocol itself and a lot of work on top of it.
From that angle it seems reasonable to be really focused on the spec and cut the number of flavours and build an umbrella protocol which can be used in different contexts (like HTTP or Bitcoin Lightning Network L2 node-to-node).
However, in the case of Cardano Lightning, when we looked really closely at two specific strains of the lightning channels we discovered that they offer different trade-offs which are worth keeping separate. Let's first consider the use cases and then the protocols themselves.

## Meet the Users

Not everyone uses a payment protocol the same way.

The Casual Spender wants to make payments easily. They need a simple mobile/desktop app (ideally integrated with their wallet) that allows them to quickly launch and pay. They occasionally top up their balance, but their main goal is simplicity. They don’t want to run a complex software or background processes which constantly monitor the blockchain. They Liquidity at stake in this case is usually smallish so they can trust third party API providers to sync with the blockchain.

The High-Throughput Payment Gateway has completely different needs. It is a node which forms a backbone of the network together with other similar nodes. They mediate payments for many customers and merchants. They need to handle large volumes of payments in both directions (from the neighbour or to it), maintain good liquidity (keep money in channels with high volume of traffic), and optimize for efficiency (like processing and communication speed, batched L1 operations etc.). They are willing to run more demanding software if it brings operational benefits. They profit relies on the liquidity which they provide and its movement (they cut fee per the amount of money routed through them).

<!-- Not sure if we should preserve the below paragraph - it completes the picture but on the other hand messes the structure the simple dichotomy between protocol flavors. -->

There are also Merchants who are somewhat in between regarding the requirements. They need to be online and able to receive payments, but usually the volume of payments is not as high as for the High-Throughput Payment Gateway, and liquidity flow is not as dynamic and critical. These users though could benefit from bidirectional flow as they can actually order supplies and pay for them using the same channels or execute refunds. At the end we can classify them as a group which can sometimes effort running a more complex software like payment gateways where their volumes are high or they can be closer to the Casual Spender when their volumes are low and they want to keep things simple.

These two users have fundamentally different requirements.

## The Two Protocols

### Unidirectional Channels

For the casual spender, unidirectional channels are often the perfect fit.

In this design, the customer locks funds once and then sends a series of signed "cheque" that can only flow in one direction. Once a cheque is issued, it cannot be taken back (it is impossible to tear down a signed digital message ;-)).
Because the commitments are made by the customer only, the final version of the L2 story is just a "pile of cheques" that the recipient (like intermediary node - Payment Gateway) has to present to the cashier-blockchain smart contract to **instantly** get the money. Additionally as long as the other end accepted the payment, the customer does not really care about the state of the channel on the blockchain - nothing really beside he committed to pay can be withdrawn from the channel. The communication with L1 can be minimized to the individual events like opening, topping up or final withdrawal of the remaining balance.

At the end their lighting wallet app can remain very lightweight and doesn't need to constantly watch the blockchain and can rely on "somewhat trusted" third party L1 connector APIs like Blockfrost, Cardanoscan or Cexplorer.io to execute the charging transactions or the final withdrawal. It can do this without any risk of losing money.

There is of course a downside to this simplicity - the channel is unidirectional, so the customer cannot receive payments or receive refunds in a trust less way.

* Describe a flow with a bit of trust.
* Shortly mention that unidirectionality means that the channel is just drained and there is no possible liquidity re-balancing.


## Bidirectional Channels

When both sides need to send and receive payments intensely, bidirectional channels become much more attractive. These channels allow money to flow freely in both directions. One important aspect of these channels is that the liquidity flows in opposite directions can naturally balance  each other:

* Let's say that Alice locked 10 ADA and Bob locked 10 ADA in a bidirectional channel (so the on-chain state is 20 ADA total).
* If Alice gives a off-chain cheque for 10 ADA to Bob, then she can not send any more payments to Bob because the baking on the L1 covers only that 10 ADA.
* When Bobs issues a off-chain cheque for 7 ADA to Alice, then in some sens those two cheques cancel each other and the on-chain 20 ADA is now sufficient to cover some future payments in both directions. Alice has 7 ADA to spend or Bob has 13 ADA to spend at the moment.

This makes them especially useful between routing nodes, where traffic can naturally balance over time. They also enable fully trustless refunds and cancellations.

However, this flexibility comes at a cost. Both parties have liquidity at stake - the final settlement is not one side story any more because Alice can not just present to the on-chain cashier cheques from Bob and right away cash them out. Bob should be able to present his cheques as well. This possible dispute (it is optional because in a full consensus happy path it could be one shot resolution) means possible extra time requirement and necessity to monitor the chain more closely and in a more reliable way (ideally using a full node with own chain indexer etc.).

<!--
Properties:
* Funds can flow freely in both directions
* Supports atomic refunds and cancellations using shared secrets
* Channels can stay open much longer as payments in opposite directions can naturally balance each other
* Requires both parties to stay synchronized and monitor the chain
* More complex security model — both sides must be ready to respond during the settlement window
-->

## Other flavors

There are even more possible categories lightning channels which can distinguished based on compostability (a prominent example is https://subbit.xyz by @waalge) or multi token support (our protocols support different tokens but are mono asset - either USDM, ADA or some other **specific** token can flow through a particular channel). We want to stop here for now though as we think that the two flavours described above are the most important ones.

## Why We Chose a Ladder of Specialized Protocols

After seeing these differences, our design philosophy becomes clear.
Instead of forcing everyone into one universal bidirectional protocol, we are sticking at the moment to two protocols (plus a separate one https://subbit.xyz for direct customer-provider micro-payments ;-)). Each flavor is optimized for specific user needs — from simple spending to high-throughput routing. We believe this approach brings significant benefits in simplicity, performance, and ultimately adoption. The time will tell if we are right.

