# RFC: User Authentication for the Interactive Survey Tool

Project 28: Interactive Survey Tools for Data Visualizations

Xiyuan Liang <liangxiy@oregonstate.edu>

<!-- Decision record header. Leave Status as "Proposed" until your team decides,
     before or after the reviews. Then fill in the outcome and the decision date.
     The document stays where it is; this header is what makes it a record. -->

| Field | Value |
| --- | --- |
| Xiyuan Liang | |
| Date | 2026-10-24 |
| Status | Proposed |
| Decision Date | (fill when decided) |
| Deciders | (who agreed to the outcome) |
| Superseded By | (link, if applicable) |

## Problem and Context

The previous project team suggested improving the current login system. After reviewing the code, I found that the system already has basic registration and login flows. After a successful registration or login, it generates a JWT containing the user ID that is valid for 24 hours. However, the system needs better token handling after logout, account verification, and limits on failed login attempts. We now need to decide whether to improve the existing login system or use third-party authentication. If we do nothing, the existing security issues will remain, and changes will become more costly as the number of users and features grows.

## Options

At least three options, **including "do nothing"**. Give each option a short name, an account of its real costs, and the condition under which it would be the right choice. An option with no such condition is a strawman, and a strawman weakens the whole document.

### Option A: Improve the existing login system

Add account verification, stronger login checks, token invalidation after logout, account protection, and password reset features. We already have a basic framework, so improving it may take less time than rebuilding the system. However, the team would still be responsible for implementing and maintaining these security features.

### Option B: Third-party authentication

A third-party provider may offer more established security features and reduce the amount of authentication code we need to maintain. However, there may be increased costs, for instance, the need to pay associated fees. (The provider and its costs still need research.)

### Option C: Do Nothing

Keep the current authentication system. This avoids additional development work and may be enough for limited use. However, the existing security gaps would remain and become more concerning if more people use the system regularly.

## Analysis

For option 1, the current system uses bcrypt to hash passwords and JWTs to verify users, as implemented in User.js and auth.js. Improving this system would reuse the existing framework, but the team would need to develop and maintain account verification, password reset, and login attempt limits. 

For option 2, the third-party authentication would require connecting external identities to existing user IDs so users retain access to their surveys and visualizations. The costs of time and fees of this option was dependent on the provider. (Which still needs research). It would also introduce an external dependency that the team would need to configure and maintain.

For option 3, keeping the current system avoids immediate development work but leaves the existing security gaps unresolved. It may be enough for a limited prototype, while wider use would make those gaps more consequential.

## Recommendation and Verification Plan

I recommend Option 1: improving the existing authentication system. The basic login flow is already implemented, so we can build on it and address the security gaps. This requires development and maintenance time but avoids adding a third-party authentication service and its potential fees.

The team can test the following things to conform the changes is works:

### Correct credentials allow login.
### Incorrect passwords and unregistered accounts are rejected.
### Expired or modified tokens cannot access protected resources.
### Tokens from a logged-out session can no longer access protected resources.
### Repeated failed login attempts trigger the configured limit.

The changes pass verification when these tests produce the expected results and existing users can still access their surveys and visualizations.

## Constraints

Changes must follow project and dependency licenses. Tests should use test accounts. Passwords, tokens, secret keys, and partner-confidential information must not be shared publicly.

## Delegation and Validation

I used AI to help locate code related to login and security and assess the current implementation. AI also helped identify code references supporting option 1 in the Analysis section and suggested additional tests for the Recommendation and Verification Plan. These tests are planned and have not yet been run.

I checked the referenced code myself to confirm how registration, login, password hashing, and token verification currently work.

## Decision

Proposed, until your team decides. Then accepted, rejected, or superseded, with the date and who chaired the decision. If superseded, link the RFC that replaces this one.
