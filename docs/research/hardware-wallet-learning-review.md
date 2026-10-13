# Hardware wallet learning coverage

Review for issue #26, 2026-10-13. Snapshot: `9cf0c165f8b05510e1066a22aba9d74d6c8ade57`.

## Recommendation

Keep `custody.hardware-wallets` as the introductory overview. Add narrow concepts in later content slices for secure-element trust boundaries, trusted transaction displays, and device/firmware attestation. Treat recovery and reproducible firmware as applications of existing concepts until their prerequisite chains are improved. This review proposes the boundaries; it does not add graph nodes.

The decisions below are editorial inferences from the repository's direct-prerequisite rule and the linked primary sources. A vendor's architecture is an example, not a claim that all wallets implement the same protections.

## Existing coverage

| Existing node | Coverage | Remaining gap |
| --- | --- | --- |
| `custody.hardware-wallets` | Isolated signing introduction, prerequisite `custody.self-custody` | Physical attacker, host, firmware, and recovery trust boundaries are not explained |
| `custody.psbt-signer-validation` | UTXOs, scripts, fees, sighash, destinations and change; depends on `custody.psbt` | How independently verified transaction data reaches a trustworthy display |
| `custody.air-gapped-signing` | Offline transaction transfer | Offline transport does not explain component trust or user verification |
| `security.exfiltration-resistant-signing` | Nonce-channel leakage | A targeted mitigation rather than a complete device threat model |
| `dev.reproducible-builds` | Source/binary equivalence | Its node/wallet-development prerequisites make firmware verification unnecessarily remote for hardware-wallet learners |
| `custody.backups-recovery`, `custody.multisig`, `custody.passphrase` | Recovery and backup foundations | Device replacement rehearsal and preservation of wallet policy/derivation metadata |

## Concept boundaries and proposed edges

| Candidate | Decision | Proposed direct prerequisites | Scope |
| --- | --- | --- | --- |
| Secure-element trust boundaries | Separate atomic concept | `custody.hardware-wallets` | Which secrets and checks live in each component; physical extraction resistance, PIN handling, and trust in chip provisioning |
| Trusted transaction display | Separate atomic concept | `custody.hardware-wallets`, `custody.psbt-signer-validation` | Binding the user's destination, amount, fee and change review to what the signer actually authorizes |
| Device and firmware attestation | Separate atomic concept | `custody.hardware-wallets`, `fundamentals.digital-signatures` | What a certificate/signature authenticates, which root is trusted, and why authenticity is not a general proof of safety |
| Firmware reproducibility | Reuse and refine `dev.reproducible-builds` | Review the existing prerequisites before adding an edge | Source availability, reproducibility, signature verification and secure boot are different checks |
| Hardware supply-chain risk | Resource within the overview initially | None added | Acquisition, seals, provisioning and malicious peripherals span multiple threats; no single independent technique yet identified |
| Hardware-wallet threat model | Resource within the overview | None added | Organizing questions that connect the atomic concepts, rather than another node duplicating them |
| Replacement and vendor-independent recovery | Extend backup resources initially | None added | Recovery on an alternative implementation; mnemonic/passphrase plus descriptors, derivation and wallet policy where required |

Do not make secure elements a prerequisite of all hardware wallets: the architecture is optional. Do not make reproducible builds depend on device attestation or vice versa: one checks the build relationship, the other checks an authentication claim. Recheck transitive redundancy once the candidates are drafted; all IDs above refer to existing nodes.

## Evidence to curate

- [BIP 174 signer checks](https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki): a vendor-neutral specification for independent validation before signing. Use it for the transaction-verification foundation, while a device-specific display implementation supplies the worked example.
- [Reproducible Builds definition](https://reproducible-builds.org/docs/definition/): independently recreating identical artifacts requires specified source, environment and instructions. Reproducibility says nothing by itself about whether that source is safe or which binary a device is running.
- [BIP 380 motivation](https://github.com/bitcoin/bips/blob/master/bip-0380.mediawiki): key material alone may not identify scripts and derivation paths needed for restoration. This is a concrete recovery and vendor-lock-in gap, especially for multisig.
- [Bitcoin Core HWI](https://github.com/bitcoin-core/HWI): a multi-device integration reference for PSBT and wallet interoperability. Supported-device lists are operational data, not endorsements or guarantees of equal capabilities.
- [Trezor firmware architecture](https://docs.trezor.io/trezor-firmware/core/embed-arch/embed-arch.html) and [Optiga configuration](https://docs.trezor.io/trezor-firmware/core/misc/optiga.html): inspectable examples of secure-element access, secrets, pairing and attestation roles. Generalize the questions, not the vendor-specific design.
- [Trezor reproducible firmware instructions](https://github.com/trezor/trezor-firmware/blob/main/docs/common/reproducible-build.md): a worked implementation to supplement the neutral definition. Bind future resource notes to a release/revision when describing particular behavior.

## Next content slice

Draft the three independent concepts above with one neutral foundation and one inspectable implementation each. Expand the overview's generic directory links into focused resources, then improve the reproducible-build prerequisite chain separately. Use backup guidance to describe a recovery rehearsal with test material and wallet metadata. Do not duplicate existing PSBT, anti-exfiltration, multisig, or BIP39 nodes under hardware-specific names.

## Verification

All existing IDs and prerequisite arrays in this review were inspected against the snapshot. The cited primary sources were opened and reviewed. This documentation-only slice introduces no runtime or graph change; `git diff --check` is the applicable executable check.
