---
title: "Principles of CL design"
date: 2024/11/26
description: ""
author: waalge
---

There are a collection of disparate thoughts on what makes for good design that
inform the decisions we make when building CL. These sit above any individual
ADR, and we thought it helpful to articulate them for ourselves, for any future
contributors, and any wider audience interested.

These "principles" don't fit neatly into some SOLID like framework. Some are
high-level general security concious software dev stuff, others are quite
specifically reflecting on a "building an L2 on cardano". Some implications
manifest at the software architecture level, while others inform the development
process.

## Context

Before unpacking the principles, it's worth reflecting on _devving in
Cardanoland_.

The Cardano ledger is a lean by design: it is to provide a kernel of integrity
for larger applications. It was never to, say, host and execute all the
components of an application. It is even a little too lean in places (eg using
key hashes over keys in the script context).

On-chain code is the code executed in the ledger. All integrity guarantees of an
application built over ledger ultimately rely on the on-chain code. On-chain
code is purely discriminatory: show it a transaction and it will succeed or
fail. It cannot generate valid transactions. That is the responsibility for
other, off-chain code. Off-chain code is a necessary part of any such
application, but does not provide integrity guarantees.

We'll call applications, structured such that their integrity is backed by the
ledger, "dapps". Typically the term has other assumptions: a decentralised
application should be run-able by anyone with internet access, reasonable
hardware, and without need to seek permission from some authority.

On-chain code takes form as Plutus validators. I refer to writing validators as
"extreme programming", and have to immediately disambiguate with the [XP
methedology][xp-wiki]. It's extreme in the sense that it is highly unusual.

[xp-wiki]: https://en.wikipedia.org/wiki/Extreme_programming

It's extreme in the following ways:

- Highly constrained execution environment, which has multiple implications
  - Diminishing returns of code re-use
  - Conflicting motivation on factorization
- Un-patch-ablity
- High cost of failure
- Functions that do nothing but fail

Resource limitations at runtime are incredibly restrictive. Moreover, all
resources used have to be paid for. This is a concern is shared to some extent
with low level programming but even there is relatively niche on modern
hardware. There are many implications of this. A key one is that implementation
matter.

Libraries have limited use. As noted, the efficiency of an implementation
matters. If one needs to aggregate multiple values over a list of inputs, it is
generally cheaper to do this in a single fold, and without
constructing/deconstructing across a function boundary. Implementation details
cannot be abstracted away in simple one-size-fits-all manner, at least at zero
cost (cf plutus apps and the bloated outputs it would return). In real world
examples this cost is significant enough, that the use of stock library methods
must be considered. One saving grace is that this is manageable. The resource
limitations mean that anything over a couple thousand lines of code risks not
being usable in a transaction anyway.

Factorizing code in way that communicates purpose to a reader should be a strong
consideration. However, we already have another, possibly conflicting,
consideration: implementation efficiency. Some might say this is a compiler
problem, and that we should have clever compilers. To which the most immediate
answer is "yes, but right now we don't". It is also not a full panacea. A clever
compiler is harder to reason about, harder to verify its correctness, and it can
become more obscure to prod the compiler into pathways known to be more
efficient.

Validators are, a priori, not patchable. Depending on the validator, once
'deployed' it may be impossible to update. There is no way to bump or patch a
validator once it is in use, without such functionality being designed in. This
not unique. It was standard in pre-internet software where rolling updates were
infeasible, and still exists for devices that aren't internet enabled. However,
it is now far more the niche than the mainstream.

The correctness of a validator is high stakes. This is a property shared with
any security critical software. It is not the same league as, say, aviation
software, but it is much closer to that than a game or web app. If there is a
bug, then user funds are at risk. This compounds being not patchable. Great
efforts must be spent verifying validator correctness.

Validators are very unusual functions particularly in a functional paradigm.
They take as input a very restricted set of args, and either fail or return
unit. That's all we care about: discriminating acceptable transactions from
unacceptable transactions. Sure, this akin to writing a test, or an assert
condition - but these are commonly auxiliary rather than the culmination of the
code base. Writing Plutus is not akin to, say, some web based API or an ETL
pipeline. There is the potential for the code to be utilized by third parties if
they desired to build their own transactions that involve the validators.
However this use is generally secondary to optimizing for the intended set of
transaction builders.

## Principles

### On-chain code is to keep participants safe from others

On-chain code **is** responsible for keeping the user safe from others. It is
its fundamental responsibility.

On-chain code is **not** responsible for keeping the user safe from themselves.
A user can compromise themselves completely and totally, voiding any guarantees
provided by on-chain code. Thus such guarantees are generally superfluous.
Off-chain code is responsible for keeping the user safe, and it is off-chain
code that should make it hard for them to shoot themselves in the foot.

On-chain code is also not there to facilitate politeness. Good and bad behaviour
is a binary distinction, discriminated thoroughly by a validator. A partner may
stop responding for legitimate or malicious reasons. We do not need to
speculate; we need only ensure that the other partner's funds are safe and can
be recovered.

### Simplicity invites security

Particularly for on-chain code, err on the side of simplicity. Design and build
such that reasoning around scenarios is straightforward, and answering "what if
..." questions are easy.

This should not be at the expense of being feature complete, although the
principle then becomes a little grey on application. In places it translates to:
develop an abstraction in which the features become simple. In other places, we
will have to find the happy compromise between simple-ness and feature-ful-ness.
For example: can a partner close two of their channels in a single transaction?

It does justify excluding logic in the validator that a self interested
participant would be motivated from ensuring themselves. For example: check that
a thread token never leaves a script address; don't check that a participant has
paid themselves their due funds. Or a more moot case: Only when another
participant's funds are at risk do we consider checking the datum is correct. A
bad datum can lead to locked funds - any self interested party will ensure
themselves they have not cocked this up.

### Prioritise user autonomy

Deprioritise collaborative actions.

Together with the two previous principles, we arrive at a possibly unpopular
design choice. In CL a user is responsible for their own funds, and only their
own funds. They cannot spend their partners funds. For example, when winding
down a channel, it requires each user to submit evidence of what they are owed.
The pathway could have enforced that one partner left an address to which the
other partner's tx would output the correct funds. It would potentially save a
transaction in the winding down process. However, it also invites questions of
double satisfaction, and resolutions to this make it harder to reason about.

Instead, we prioritise multi-channel management. A fundamental participant type
in a healthy Lightning network is the Gateway. A gateway participant is highly
connected within the network and is (financially) motivated to route payments
between participants. A gateway node in particular needs to manage their
channels, and manage their capital amongst channels as efficiently as possible.
This in the whole network's interest.

We do permit mutual agreed actions. However, this is considered as a secondary
pathway. Any channel has (at most) the funds of only the two partners of the
channel. Mutual actions are verified by the presence of both partners'
signatures on a transaction. As we assume that any participant will act in a
self interested manner, and is responsible for keeping themselves safe, few
checks are done beyond this.

### Distinguish safety from convenience

Safety comes first, but we also need things to be practical and preferably even
convenient. Make explicit when a feature has been included for safety, or is to
do with convenience.

### Spec first, implement second

A spec:

- Bridges from intent to code
- Expels ambiguity early
- Says no to feature creep

A spec bridges the design intentions to the implementation. Code is halfway
house between what a human can parse and what a machine can parse. Where that
halfway falls is a question for language design(ers), and there is a full
spectrum of positions available with all the possible languages. Very roughly,
the closer it is to human readable, the less efficient it ends up being executed
by the machine.

Regardless of a language's expressiveness, it doesn't replace the need for
additional documentation.  
"Self-describing code" is a nice idea and not without strong merits. Naming
should follow conventions, and should not be knowingly obscure. In software at
large, the problem of separate documentation falling out of sync is observed ad
nauseum. But. The idea that descriptive names and some inline comments are
sufficient to communicate design and intent is not credible. [I agree with
Jef][jef-raskin-blog].

[jef-raskin-blog]: https://queue.acm.org/detail.cfm?id=1053354

The above is especially acute in the context of the extreme programming paradigm
that is Plutus development. We can and should demand more attention from a dev
engaging with the application. They should not expect to "intuitively"
understand how to interface with the code. Again - not to be justify any
obscurity of design or code, but a validator is not simply just another library
they'd be interfacing with. The stakes are too high. They must read the spec.

We suffer less from docs/code divergence than is experienced in "normal" development. 
For the same reason that we have un-patch-ablity we have a fixed feature set. 
It is in evolving software and its code base, by adding new features or modifying existing ones, 
when code diverges from docs. 

A spec helps expel ambiguity early. It provides an opportunity to check that
everyone is on the same page before any lines of code are written, and without
having to unpick lines of code after the fact.

A spec helps make the implementation stage straightforward and intentional. It
greatly reduces the required bandwidth since each part of the code has a
prescribed purpose. This is also reduces the cost of writing wrong things,
before settling on something acceptable.

Having a spec combats feature creep. Adding feature requirements part way
through implementation can lead to convoluted and design and code, and
ultimately greatly increase the chance of bugs. As discussed for on-chain code,
rolling updates are not generally possible. We need to make sure from the start
what the feature requirements are (and as importantly what they aren't).
