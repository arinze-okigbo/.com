# Round 6 — A signature you can test

## What changed
The lab now generates a real ECDSA P-256 key pair, signs an exact UTF-8 message with SHA-256, and checks the signature after an edit. A public-key fingerprint (SHA-256 of SPKI bytes) and the original signed message make the evidence inspectable.

The experiment loads on request. Its private key is non-extractable through Web Crypto and held in memory; reset or close releases references and invalidates pending results. This does not promise hardware protection or guaranteed memory erasure. No key or message is saved or sent by the experiment.

Verification tests a message against a public key. It does not encrypt a message, certify an account, or identify a named person.

## Validation before release
Build, lint, types, 371 unit tests and 78 browser checks passed, with 2 device-specific skips. Browser checks include genuine sign/verify/tamper behavior, reset races, Unicode byte limits, empty messages, unavailable crypto, unchanged storage, no outbound challenge payload, keyboard focus, both themes and reduced motion. Manual Chrome review covered desktop dark and 390px light layouts. Physical iPhone frame rate remains unverified.

The fixed-five local mobile Lighthouse series scored 98/97/97/98/98. Lighthouse's representative run scored 98 performance, 100 accessibility, 100 best practices and 100 SEO; LCP 2500ms, TBT 11.5ms, CLS 0. The lab route also passed a separate fixed-five series at 96/100/100/100 on every run (representative LCP 2774ms,TBT 19ms,CLS 0). Homepage initial JavaScript remains 154.3KiB; all budgeted routes stay below 180KiB.

Required Linux checks, exact-preview validation and production audit remain release gates. The live footer links the dated deployed measurement. No production score for this change is claimed here before it is measured.

## Sources
[W3C Web Cryptography API: ECDSA operations](https://www.w3.org/TR/2017/REC-WebCryptoAPI-20170126/#ecdsa-operations).
[MDN Web Crypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto), including generateKey, sign, verify, exportKey and digest. Normalized research is cached in hive/research/proof-lab.json.

## Verified production release
PR 7 merged as dee660fbd3e6c4f911b083078537ab13db48c026. The custom domain and all 78 production browser checks passed (2 device-specific skips). Required Linux CI 34974009657 passed 96/100/100/100; its complete performance series was 80/96/96/99/95.

Production audit 34974650171 automatically published and enforced 99/100/100/100, representative run 4, LCP 1986ms, TBT 61ms, CLS 0. The full performance series was 82/99/99/99/99; all raw reports remain in its artifact. Metrics branch 146d3ed carries this exact production commit and measurement. These are representative mobile Lighthouse measurements, not a claim that every run or physical device scored identically.

The initial Linux attempt 34973658216 failed one test because Node 24 and Node 25 use different error names when refusing private-key export. The corrected assertion accepts the two observed names while still requiring rejection for both PKCS8 and JWK exports. Feature code was unchanged.
