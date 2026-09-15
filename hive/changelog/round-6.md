# Round 6 — A signature you can test

## What changed
The lab now generates a real ECDSA P-256 key pair, signs an exact UTF-8 message with SHA-256, and checks the signature after an edit. A public-key fingerprint (SHA-256 of SPKI bytes) and the original signed message make the evidence inspectable.

The experiment loads on request. Its private key is non-extractable through Web Crypto and held in memory; reset or close releases references and invalidates pending results. This does not promise hardware protection or guaranteed memory erasure. No key or message is saved or sent by the experiment.

Verification tests a message against a public key. It does not encrypt a message, certify an account, or identify a named person.

## Validation before release
Build, lint, types,371 unit tests and78 browser checks passed, with2 device-specific skips. Browser checks include genuine sign/verify/tamper behavior, reset races, Unicode byte limits, empty messages, unavailable crypto, unchanged storage, no outbound challenge payload, keyboard focus, both themes and reduced motion. Manual Chrome review covered desktop dark and390px light layouts. Physical iPhone frame rate remains unverified.

The fixed-five local mobile Lighthouse series scored98/97/97/98/98. Lighthouse's representative run scored98 performance,100 accessibility,100 best practices and100 SEO; LCP2500ms, TBT11.5ms, CLS0. Homepage initial JavaScript remains154.3KiB; all budgeted routes stay below180KiB.

Required Linux checks, exact-preview validation and production audit remain release gates. The live footer links the dated deployed measurement. No production score for this change is claimed here before it is measured.

## Sources
[W3C Web Cryptography API: ECDSA operations](https://www.w3.org/TR/2017/REC-WebCryptoAPI-20170126/#ecdsa-operations).
[MDN Web Crypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto), including generateKey, sign, verify, exportKey and digest. Normalized research is cached in hive/research/proof-lab.json.
