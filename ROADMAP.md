# Caffoot Lite — Development Roadmap

**Updated:** 17 October 2026  
**Latest published release:** v1.0.3  
**Current development milestone:** v1.1 (in development)  
**Repository:** `sdelnevo/Caffoot-Lite` (public)  
**Release policy:** Publish publicly only after manual verification, security/privacy review and owner approval.

Caffoot Lite is an offline, standalone single-HTML network inventory and IP address management application. The published v1.0.3 release remains unchanged while future development is tested separately.

## Documentation checks for every release

Before publishing **every** new version (including patch releases), complete a documentation consistency review as a release gate:

- Verify the application, package, release tag, release assets and current-version statements agree.
- Review `README.md`, `INSTALLATION.md`, `USER-GUIDE.md`, `ROADMAP.md`, `docs/ROADMAP-DESIGN-NOTES.md`, `BACKUP-FORMAT.md`, release notes and any other affected guides for accurate feature descriptions, navigation labels, download links, update instructions and backup warnings.
- Preserve historical release evidence, older compatible backup examples and legitimate references to previous versions; do not blindly replace every version number.
- Run automated checks for known version inconsistencies where practical, in addition to a human documentation review. An automated pass alone does not establish that instructions or screenshots are accurate.
- Record completion of the documentation review in release acceptance before publication. Treat unresolved user-facing inaccuracies as release blockers.

## Current and proposed milestones

Release assignments beyond v1.1 are provisional. A feature listed here is not a release promise or approval to implement it.

### v1.1 — Subnet hierarchy and validation

**Status: In development**

- Subnet hierarchy, parent/child relationships and CIDR validation.
- Nesting, boundaries, overlap and cycle protection.
- Intelligent subnet creation and editing with type-specific rules.
- Gateway protection and relevant network device-type support.
- Show gateway addresses as protected/reserved in IPAM; prevent accidental allocation and update availability statistics.
- Fix informational modal dismissal consistently, including Safe Update Guide and Software Licences (visible Close control, Escape and appropriate focus behaviour).
- Add read-only network information (network/broadcast addresses, mask, gateway, usable range and capacity) while keeping network and broadcast addresses out of host allocation.
- Present top-level IP Address Blocks in a responsive two-column card grid (one column on narrow screens), with nested collapsible blocks, compact Network / VLAN rows and Expand All / Collapse All. Preserve editing and avoid excessive page length.
- Data-safety release gates: verify backup/export guidance and browser-storage warnings; test edits/deletions and cross-module Device/IPAM/Rack references, including JSON restore; preview the impact of destructive actions on linked records.
- Accessibility acceptance for new and existing affected dialogs, including visible modal Close controls, Escape/focus behaviour, keyboard operation and responsive IPAM layouts.
- Regression testing and compatibility with existing inventory and backups.

Development takes place separately from the published release. Do not merge unfinished work without owner approval.

### v1.1.1 — Settings, usability and documentation

**Status: Proposed; planning only, after v1.1**

- Consolidate duplicate backup controls while preserving prominent local-storage warnings, JSON export/restore, recovery snapshots and destructive-action safeguards.
- Reorganise Settings & Data into clear everyday tasks and advanced diagnostics/recovery.
- Expand About Caffoot Lite with meaningful project information, version, repository links and licence access.
- Explore additional application preferences and central management of device/server/software option lists without breaking existing device workflows or backups.
- Rename dashboard Data Health to Inventory Health, explain what is checked, and distinguish inventory consistency from browser-storage safety and live network monitoring (which is not provided).
- Add concise, offline Help & Documentation accessible from the interface, designed to complement—not replace—an intuitive user experience.
- Improve update status presentation and investigate opt-in automatic release checks; do not silently replace the local HTML file or restore inventory.

Scope and sequencing require review before implementation. No v1.2 commitments are moved into this milestone.

### v1.1.2 — Security hardening and deployment guidance

**Status: Proposed; planning only, after v1.1.1 and before v1.2**

- Perform a code-focused security review of the standalone HTML app, including DOM XSS, HTML rendering, imported JSON, data validation and unsafe file/input handling.
- Review browser local-storage exposure, shared-device risks, backup sensitivity, privacy and origin-specific storage behaviour.
- Audit bundled dependencies and unexpected external requests; preserve the offline-first design.
- Evaluate practical Content Security Policy and other browser mitigations compatible with the single-file offline distribution.
- Add repeatable security regression tests and document limitations; do not claim the application is vulnerability-free.
- Publish clear README/deployment warnings against unauthenticated public exposure, explaining HTTPS, reverse-proxy authentication, network restrictions and residual risks.
- Consider a SECURITY.md with a private vulnerability-reporting route, supported versions and responsible disclosure guidance.
- Preserve existing data, JSON backup compatibility and user-approved release gates.

Security controls for a future managed Caffoot Pro deployment require separate design and validation; Pro is not currently a released or security-certified alternative.

### v1.2 — Device, IPAM and rack enhancements

**Status: Planning; scope may be split into smaller milestones**

- Wider, responsive, tabbed Add Device and Edit Device forms with shared behaviour.
- Preserve dynamic fields for different device types.
- Add contextual Operating System family, version and optional edition selection for applicable device types, with Unknown/None/Custom choices and safe legacy compatibility.
- Refresh Device Inventory screens using the same responsive visual language as v1.1 IPAM, with clear summaries, useful filtering and compact, scalable device lists.
- Multiple IP addresses per device, optional interface associations and primary management IP.
- Public IP address documentation, including relevant ISP, circuit and NAT metadata.
- Flexible rack heights and presets, Wall Mounted / Free Standing / Open Frame types, optional depth and safe resizing.
- Expand optional rack details: manufacturer, model, serial number, asset tag, width/depth, location and free-standing base configuration (casters, levelling feet and/or anchored).
- Extend existing rack accessories with PDUs (horizontal rack-mounted and vertical 0U), fan/ventilation panels, vertical cable managers and environmental sensors; preserve existing accessories and collision safeguards.
- Cross-module advanced search and initial inventory, subnet/IPAM and rack reporting.

### v1.3 — Device relationships and interfaces

**Status: Proposed**

- Device relationships and upstream/downstream links.
- Interface and port records, with optional IP associations.
- Shared connection records visible from both connected devices.

### v1.4 — Cabling and rack connectivity

**Status: Proposed**

- Patch panels, cabling, ports and physical endpoints.
- Duplicate endpoint protection and connection tracing.
- Rack diagram exports; investigate SVG, Excalidraw and Visio compatibility.

### v1.5 — Network topology

**Status: Proposed**

- Physical and logical topology generated from existing relationship and cabling records.
- Device navigation, connection tracing and usable diagram layouts.

### Future investigations

- Shared Suppliers directory for devices, racks and other assets, with optional procurement, warranty and contact information; schedule in a separate future milestone rather than expanding v1.3.

- Offline import options, including potential NetBox compatibility.
- IPv6 capabilities.
- Additional reporting and export formats.

See [Roadmap Design Notes](docs/ROADMAP-DESIGN-NOTES.md) for detailed concepts and compatibility requirements.

## Delivered core scope

- Subnets/CIDR, IPAM, reservations, bulk operations, history, CSV and integrity safeguards.
- Rack workspace with front/rear placement, accessories, drag-and-drop, U sizing and collision prevention.
- Device inventory, types/locations, details and additional server/software options.
- Dynamic dashboard, settings, validated JSON backup/restore and recovery protections.
- Light/dark UI improvements, consistent forms and Safari rack scrolling refinements.
- Offline single-HTML build pipeline and automated checks.

The features above are recorded as delivered. Automated Chromium regression checks have been added for offline startup, local storage recovery, backup rejection and restore, Device/IPAM integrity, rack placement, form labels, modal keyboard behaviour and theme text contrast. **Safari manual acceptance has progressed substantially; owner-reported acceptance and completed publication checks are listed below.**

## Verified automated coverage

- Offline HTML build verification, embedded assets and no outbound HTTP(S) requests in the Chromium smoke test.
- Browser-local inventory persistence, unreadable-storage recovery and recovery-data download.
- Malformed and malicious backup rejection, restore cancellation, rollback on failed restore and successful restore.
- Device/IPAM allocation ownership, subnet membership, record synchronisation and reassignment.
- Rack U-range validation, overlapping placement rejection and separate front/rear faces.
- Failed Device edits and creations roll back without leaving ghost inventory or orphan IPAM records.
- Modal keyboard focus and Escape behaviour, shared light/dark text contrast, and selected Device/Subnet/IPAM field labels and HTML escaping.

These checks are valuable regression coverage, **not** a complete security audit, accessibility certification or replacement for manual browser testing.

## Manual Safari acceptance — owner confirmed, 10 October 2026

- **Stage 1 (5/5):** offline startup, branding, navigation, themes and reopening.
- **Stage 2 (6/6):** subnet creation and suggested gateway, Desktop device creation and next available IP, Device/IPAM name synchronisation.
- **Rack workflows:** mounting-type restrictions confirmed in Safari; Stage 5B rack integrity **5/5** (overlap, capacity, opposite faces, unchanged state after rejection, persistence).
- **Stage 4A (6/6):** JSON export, backup contents, cancelled import and persistence.
- **Stage 4B (7/7):** successful restore, temporary data removed, original inventory/IPAM restored and persisted.
- **Stage 4C (5/6):** malformed JSON rejected, inventory unchanged and persisted; pre-test inventory confirmation was not checked.
- **Stage 4D:** owner confirmed a modified backup was rejected. This is evidence of rejection, but does not independently establish every invalid-structure case.
- **Stage 5A:** owner confirmed rejection of invalid subnet boundary, overlapping subnet, duplicate device IP and out-of-subnet IP; no issue reported.
- **Final Device workflows (6/6):** duplicate, independent IPAM allocation, delete and release IPAM allocation, rack position cleanup and persistence; owner confirmed red Delete button works.
- **Stage 6A — IPAM (7/7):** reservation create/edit/remove, available-address filtering, bulk action and cancellation, integrity/repair, persistence.
- **Stage 6B — Rack workspace (7/7):** accessory add/remove and collision rejection, drag/move and occupied-position rejection, Safari scrolling, persistence (owner reported 8/7, all seven listed checks passed).
- **Stage 7A — Safari usability (7/7):** owner confirmed light/dark readability, keyboard navigation, modal focus/Escape, form validation presentation, narrow-window usability and destructive-action clarity. This is manual acceptance, not formal WCAG certification.

## Completed release gates

- [x] Final private preparation source build green (`be6eac2`, workflow `38063343516`, 10 October 2026), including moved/renamed-file browser restore and verified ZIP.
- [x] Generated HTML operates offline in Safari and retains inventory after reopening.
- [x] Basic Add/Edit Device, next available IP and Device/IPAM synchronisation tested in Safari.
- [x] Rack mounting restrictions and core U integrity tested in Safari.
- [x] JSON export, cancelled restore, successful restore and malformed JSON rejection tested in Safari.
- [x] Core subnet/IPAM invalid-operation rejection tested in Safari.
- [x] Exercise **Duplicate/Delete Device** and confirm linked IPAM/rack records stay consistent.
- [x] Exercise **IPAM reservations, bulk actions and integrity repair**, including cancellation and persistence.
- [x] Exercise **rack accessories, drag-and-drop and scrolling** on Safari; confirm no collision or accidental moves.
- [x] Complete targeted **keyboard navigation**, narrow-window and light/dark visual checks (Stage 7A, 7/7).
- [x] Owner reports VoiceOver works well on the latest Safari preview (10 October); informal acceptance, not a per-step audit or certification.
- [x] Owner confirms backup export, restore into the new version and Safari close/reopen persistence. Moved/renamed-file and shared-storage behaviour are covered by automated Chromium tests and documented; manual Safari rename results were not separately reported.
- [x] Source/main-history privacy review, pinned runtime licence comparison and automated exact ZIP member/hash inspection implemented; see RELEASE-REVIEW.md.
- [x] Prepare complete version-named ZIP and standalone HTML with complete offline licence notices; owner approved publication.
- [x] Owner explicitly approved release version, public repository visibility and publication actions.

Passing these checks supports release readiness; it is not a formal security or accessibility certification.

## Compatibility and project boundaries

**Data compatibility:** Preserve existing browser inventories and supported JSON backup formats. The primary storage key is `caffoot_state`; version 1.0.0 does not automatically migrate legacy test storage. Export and restore JSON backups to retain test data.

**Safe releases:** Keep a known-good standalone HTML build and recommend exporting a JSON backup before upgrading. Validate new builds before publishing them.

### Before Lite v1.0 publication

- [x] Add version metadata to JSON exports and a documented versioned import/migration strategy while retaining compatibility with current valid backups.
- [x] Add automated tests for legacy backups, unsupported future schema versions, malformed metadata and unchanged inventory on rejection.
- [x] Produce an example Lite backup fixture for future import compatibility tests, without real infrastructure or sensitive data.
- [x] Complete release packaging, offline upgrade/restore acceptance and owner publication approval.


## Final private preparation pass — 10 October 2026

Implemented manual release checks and safe update guide, BACKUP-FORMAT.md, populated fictional schema-v1/legacy fixtures, detached non-mutating migration, generated-file upgrade regression test, embedded licence viewer, version-named ZIP with guides/examples and SHA-256 verification. See RELEASE-REVIEW.md for scope and evidence.

Owner opened the latest preview in Safari, reported that the new warning looks good and VoiceOver works well, and explicitly confirmed backup export/restore and reopen persistence. Stable 1.0.0 passed its full automated rerun; owner approval and public publication are complete. See RELEASE-ACCEPTANCE.md for precise evidence scope.


## Publication completed — 10 October 2026

The owner explicitly approved making `sdelnevo/Caffoot-Lite` public and publishing Caffoot Lite v1.0.0 with the prepared downloads. The owner changed repository visibility to public. The final stable source commit `6f5d38e6959016fb236763f8f7a241de14d23c83` passed the complete automated suite in [workflow 38064002992](https://github.com/sdelnevo/Caffoot-Lite/actions/runs/38064002992). [Publication workflow 38065143351](https://github.com/sdelnevo/Caffoot-Lite/actions/runs/38065143351) verified that exact artifact, finalised release-note wording without changing runnable HTML, checked package member hashes and uploaded asset digests, then published the stable release.

[Caffoot Lite v1.0.0](https://github.com/sdelnevo/Caffoot-Lite/releases/tag/v1.0.0) includes `Caffoot-Lite-1.0.0.zip`, `Caffoot-Lite.html` and `SHA256SUMS`. The tag points to the tested source commit. Earlier private-preparation results below are retained as historical evidence.


## v1.1 design decision — VLAN scope (implementation in progress)

**Status:** Scoped VLAN validation helper and regression tests pass locally; application integration is **not yet complete**.

- Each parent **IP Address Block** is an independent VLAN domain. A VLAN number may be reused in different blocks.
- Within a single block, a VLAN number must be unique among Network / VLAN subnets.
- Legacy networks without a parent share one **Unassigned VLAN Domain** and must not duplicate VLAN numbers there.
- VLAN scope is based on stable parent block IDs, not editable block names.
- CIDR overlap, hierarchy, gateway and data-integrity protections remain independent of VLAN scope.
- The current separate `vlans` inventory and backup/import validators assume globally unique VLAN numbers. Before enabling reuse in the UI, update these together so same-number VLAN records in different domains remain distinct, without silently rewriting existing inventories.
- Regression coverage must include create/edit, cross-block reuse, within-block duplicates, unassigned networks, VLAN deletion, backup/import and legacy data.

