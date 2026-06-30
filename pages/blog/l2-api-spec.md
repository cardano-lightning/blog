---
title: "The (a) L2 API spec"
date: 2026/06/30
description: "A brief tour of our L2 API spec and how it came to be how it is. "
author: paluh, waalge
---

The following is a brief tour of our L2 API spec and how it came to be how it is.
The primary audience for this account is the assessors of Catalyst [Milestone 3][catalyst-m3].
As the original proposal makes clear that we knew there would be iterations.
The API design has indeed gone through many iterations and changes. Too many.
Here is a rough account of some of our lessons.

## Before

There was an ambiguity in our original Milestones.
M1 deliverables says words to the effect of "protocol specs".
M3 says "L2 spec".
Due to this ambiguity, a document that should qualify for this Milestone (M3)
has been present since our first submission M1 [here][original-l2-spec].

## Currently...

Our current API spec is found [here][konduit-wire].
It is a rust crate that defines the wire types and the API interface between client and server.

## Reflections on BLN

BLN is the trailblazer and our obvious blueprint.
We considered BLN closely while considering design choices.

BLN uses Noise over TCP for its transport layer and a custom binary length-value / TLV (Type-Length-Value) encoding for its message framing.
Specifically, the BLN wire protocol breaks down like this:

- Transport Layer (BOLT \#8): It uses the Noise Protocol Framework (specifically Noise_XK_secp256k1_ChaChaPoly_SHA256) wrapped over standard TCP.
  It enforces constant authenticated handshakes and rapid key rotation.
- Framing Layer (BOLT \#8): Every packet sent over the wire is prefixed by an encrypted 2-byte length value (plus a 16-byte MAC)
  so the receiver knows exactly how many bytes of encrypted payload to pull off the TCP stream next.
- Serialization Layer (BOLT \#1): The actual payloads use a custom binary TLV (Type-Length-Value) stream format, using their own variable-length integer encoding (BigSize).

Its standard payment request an invoice (BOLT \#11), has a custom Bech32 encoding.

It is an impressive stack, and well documented.
However, it's too complicated, too low level, and is over optimized in directions we don't care for.
Using "raw" TCP rules out running things in a browser engine - by far the easiest way to get running on mobile.
At some stage we ended up needing to write our own invoice parser.
It was a PITA, and so hard to justify when cbor would be so much easier and still more efficient.

## Buy coffee, no infra

See our other post on [roles](#todo!) for a fuller explanantion of the following point.

We became convinced that one of the shortcomings of BLN is its failure
to accommodate different user types/ roles. Most abundantly, the group of "I want to buy coffee, and I don't want to run infra".
That's most of us.
BLN doesn't let you do this without compromising fundamental principles, such as paying someone else to run your infra.

We want first class mobile only clients.
That requires minimal resource usage to have the guarantees of lightning (trustless, permissionless),
and the benefits (low fees, instant settlement) without the overheads.
To do that we have to make different compromises but that's a different story.

To serve the needs of this group, "REST" (or what every calls REST) is fine.
It's more than fine, its the right choice.

For other users, particularly inter-"gateway" node channels, the benefits of other protocols is more apparent.
And perhaps we can revist the choices of noise + TLV in this context.

## Awkward Fantastic CBOR

A key awkwardness is CBOR.
CBOR is fantastic. In many ways superior to either protobuf binary or JSON.
We are compelled, or at least strongly incentivised, to use it in some places because it is first class in Cardano, our L1.
If we use it somewhere, why not use it everywhere!

The extent to which CBOR serialization needed to be persisted across the stack,
was due to a historical misunderstanding on my part.
I had internalised the advice "never reserialise" deeper than I appreciated.
I academically understood we frequently reserialise and, critically, do so in construction of a script context in script evaluation,
However, I habitually kept handing round bits of To-Be-Signed.

This bled into mixing protocols. Mixing protocol went badly.
Embedding CBOR into JSON just seemed weird. JSON is already bad with bytes,
which need a second encoding into, say, hex.
Embedding CBOR into protobuf, didn't seem to make sense either.

Protobuf was shelved for now.
JSON is still supported but no more mixing.
In JSON All bytes are hex encoded, and these correspond to keys, or hashes, or signatures, and never to CBOR data.

## Irritating Iterating

The original proposition was to specify the API in some standard format such as Protobuf, or OpenAPI.
A reasonable initial aim.

However, when a protocol is growing and has no downstream dependents relying on a stable API,
maintaining a standalone specification document alongside an evolving codebase is a hindrance progress.
When we do have maturity, and downstream dependents we will address this.

## Autogen

"Why not autogen docs and then the docs align with code?" We did try autogen.
We've had multiple different attempts at doing so infact.
Results were underwhelming.
Utoipa is a rust lib for doing OpenAPI docs, but works better once you have a fully implemented server, not specifying one.

It was a little surprising not to find a CBOR analogue to utoipa.
It is a smaller community using CBOR, and they seem to be happy treating minicbor attributes as the de-factor spec.
We wrote a package to generate CDDL file, the standard way to define CBOR.
Unfortunately, it didn't work in a really critical way.

To avoid extra weird things happening, anything that appears on Cardano needs to follow the serialization
that it would get there, if (when) it is reserialise. This is critical for To-Be-Signed for obvious reasons,
but also in other places for more nuanced ones.
More unfortune: Cardano does not use canonical CBOR.
For example, all lists are of indefinite length.

The consequence is, everything touching Cardano needs a custom CBOR encoding.
This is straightforward enough if not a little laborious. It does however make the macro deriving
the corresponding CDDL definition much (much) harder to write.

We learned later that utoipa only handles simple attribution, not `serde_with` and certainly not procedural code.

The current [API.md][api-md]
is another experiment in deriving sensible documentation for the API.

## Give me a CDDL?

Even with handcrafted CDDL file, we aren't able to specify critical parts.
RFC 8610 is explicit about this: CDDL validates the decoded data structure, not the bytes on the wire.
Our To-Be-Signed bytes in weird Cardano CBOR would be left to comments.
It significantly undermines the value of having a rigid spec.

## Core vs Auxiliary

When we wrote the milestones, we had only just started.
There were a lot raw ideas, yet to baked and or discarded.
It's not entirely clear to me what I meant when I wrote "Core vs Auxiliary".
This is how I interpret it now.

We want permissionless software.
Anyone is free to run a node; anyone is free to write a node;
anyone is free to write a node that does things differently to what we wrote.
In all this potential of chaos, we want to retain maximal interop between disparate groups of developers and the users of their software.

More concretely, we have different payment schemes.
We want to support bolt11. There is obvious immediate benefit.
However we definitely don't want to use it as our own payment request standard.
Its a headache to implement, and there are specific risks exposure a router between Cardano and Bitcoin has.
So a client developer may decide they only want to support `cln_template` (our first standard).
Similarly, a node operator may decide they don't to set up a BLN channel _etc_.
In either case, clients and servers should be able to gracefully manage divergences in offering,
without a blanket "no service".

## Further taming chaos

Two other focuses have been on rock-solid [versioning][version-rs], and [problem details][problem-details].
Both have been over engineered, and under exposed to real world use cases.
Whether or not these really aid developer and user experience will only become apparent in time.

## CLN template

Our payment request structure is precisely as complicated as it needs to be to meet out first use case: a hub and spoke network topology.
Our server, and our specs are versioned, so we can evolve our pay request with our understanding and without fear of upsetting downstream consumers.

[catalyst-m3]: https://milestones.projectcatalyst.io/projects/1200060/milestones/3
[original-l2-spec]: https://github.com/cardano-lightning/cardano-lightning/blob/main/docs/design/l2-spec.md
[konduit-wire]: https://github.com/cardano-lightning/konduit/tree/konduit-wire/packages/konduit/wire
[api-md]: https://github.com/cardano-lightning/konduit/blob/konduit-wire/packages/konduit/wire/API.md
[version-rs]: https://github.com/cardano-lightning/konduit/blob/konduit-wire/packages/konduit/wire/src/version.rs
[problem-details]: https://github.com/cardano-lightning/konduit/tree/konduit-wire/packages/util/problem-details
