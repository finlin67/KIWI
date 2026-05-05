# KIWI v1 vs KIWI v2

## 1. Executive Summary

KIWI v1 is a local-first batch document processing tool for turning folders of local files into organized exports for downstream AI knowledge tools. The current implementation supports project setup, recursive batch scanning, resumable per-file processing, rule-based classification, optional AI-assisted classification, review flags, workspace/subfolder assignment, and exports for AnythingLLM and Open WebUI.

KIWI v2 is needed because classification alone does not fully solve evidence quality. A file can be correctly classified but still be too small, duplicated, low-signal, poorly structured, or not useful for case-study generation. v1 primarily answers: “Where should this file go?” v2 adds a stronger question: “Is this file good evidence, what should happen to it, and what structured facts can be trusted downstream?”

The key transformation is from a document classifier to an evidence pipeline. KIWI v2 keeps the v1 batch workflow and export targets, but introduces normalization, duplicate detection, evidence scoring, keep/review/archive routing, case-study readiness, multi-workspace suggestions, evidence card sidecars, and cleaner AI-ready outputs.

## 2. KIWI v1 Overview (Current State)

### Architecture

- **CLI**
  - Implemented with Typer in `kiwi_desktop/cli/app.py`.
  - Commands include:
    - `kiw init` to create/apply the SQLite schema.
    - `kiw add` to register a single file through `IntakeService`.
    - `kiw list` to show recent tracked files.
    - `kiw scan` to recursively index supported files through `ScanService`.
    - `kiw run` to execute `PipelineRunner` with an export profile.
    - `kiw gui` to launch the PySide6 desktop shell.

- **Services**
  - `ProjectService` creates/loads project context and stores project metadata under `.kiw`.
  - `ScanService` recursively scans supported file types and upserts metadata into SQLite.
  - `PipelineRunner` orchestrates per-file pipeline stages.
  - `FirstPassNormalizer` converts source documents into normalized markdown with frontmatter.
  - `ParagraphChunker` prepares chunk metadata for export.
  - `ClassificationService` performs deterministic classification from configurable rules.
  - AI classifier adapters can be used by `PipelineRunner` depending on configuration.
  - `ExporterService` writes profile-specific outputs for AnythingLLM and Open WebUI.
  - `RunMonitorService` manages background batch execution for the UI.

- **Models**
  - `FileRecord` is the central row model for the `files` table.
  - Pipeline status uses enums such as `FileStage`, `RunnerStatus`, and `PipelineStage`.
  - Classification updates are persisted through repository patch methods.

- **Database**
  - SQLite schema is defined in `kiwi_desktop/db/schema.sql`.
  - The `files` table stores:
    - File identity and metadata: `path`, `filename`, `extension`, timestamps, size, hash, MIME type.
    - Pipeline state: `current_stage`, `stage_checkpoint`, `pipeline_version`, `stage_attempt`, `last_error`.
    - Runner state: `runner_status`, `pipeline_next_stage`, plus profile-specific runner columns for AnythingLLM and Open WebUI.
    - Classification state: `workspace`, `subfolder`, `matched_by`, `classification_reason`, `review_required`, `ai_used`, `content_hash`, `confidence`, `case_study_candidate`, `portfolio_candidate`.
  - `jobs` and `outputs` tables support run tracking and generated artifacts.

### Workflow

The user-facing workflow is documented as:

```text
Save Project → Scan Batch → Run Batch → Start Next Batch
```

At implementation level, the v1 workflow is:

- **Project setup**
  - The user creates or loads a project.
  - Project metadata and the SQLite database live under the output folder’s `.kiw` directory.

- **Scan**
  - `ScanService.scan()` recursively walks the selected raw folder.
  - Supported suffixes include common document, markdown, code, data, and office formats.
  - Files are upserted by path with metadata and SHA256 file hash.
  - Existing rows keep their pipeline state when file metadata is refreshed.

- **Run**
  - `PipelineRunner.run()` selects files with `new`, `processing`, or `failed` runner states and a non-null next stage.
  - Stages are checkpointed so processing is resumable.
  - The pipeline normalizes, chunks, classifies, and exports eligible files.

- **Export**
  - `ExporterService.export()` writes normalized markdown and manifests under the selected export profile.
  - Profile-specific runner state allows AnythingLLM and Open WebUI exports to be tracked separately.

### Classification System

Classification is implemented in `ClassificationService` and is config-driven.

- **Rule order**
  - `FORCE_RULES`
  - `NEGATIVE_RULES`
  - `COMPANY_MAP`
  - `PROJECT_MAP`
  - `DOC_TYPE_PATTERNS`
  - `CODE_EXT`
  - small-file lane / relevance gate
  - fallback

- **Classification decision fields**
  - `category`
  - `workspace`
  - `subfolder`
  - `doc_type`
  - `confidence`
  - `matched_by`
  - `classification_reason`
  - `review_required`
  - `case_study_candidate`
  - `portfolio_candidate`
  - `ai_used`

- **Review behavior**
  - Fallback decisions require review.
  - Low-confidence decisions require review.
  - Broad or risky keyword matches can force review.
  - When confidence is below the configured threshold, workspace assignment is withheld until review.

- **Optional AI behavior**
  - Configuration supports local Ollama and cloud providers.
  - AI classification is optional and controlled by settings such as provider, model, API key, and AI mode.
  - AI confidence is clamped for Ollama before persistence.

### Export System

Exports are handled by `ExporterService`.

- **AnythingLLM**
  - Profile name: `anythingllm`.
  - Writes normalized markdown into workspace-oriented folders.
  - Uses a workspace mapping such as `career_portfolio` → `Career_Portfolio`, `ai_projects` → `AI_Web_Projects`, and `case_studies` → `Case_Studies`.

- **Open WebUI**
  - Profile name: `open_webui`.
  - Writes normalized markdown using workspace/subfolder hierarchy.

- **Shared export behavior**
  - Adds traceability frontmatter including `source_id`, `processed_date`, `source_file`, `source_path`, `workspace`, `subfolder`, `matched_by`, `confidence`, and `category`.
  - Maintains `files_manifest.csv` and `chunks_manifest.json`.
  - Supports duplicate filename policies: rename, overwrite, or skip.

### Strengths

- **Local-first**: Runs against local folders and local SQLite state.
- **Resumable**: Per-file stages and checkpoints allow interrupted runs to continue.
- **Traceable**: Source paths, file IDs, classification reasons, and manifests are preserved.
- **Configurable**: Classification rules, workspace mappings, thresholds, AI settings, and export behavior are configurable.
- **Practical exports**: Produces directly usable outputs for AnythingLLM and Open WebUI.
- **Review-aware**: Low-confidence and fallback classifications are explicitly marked for review.

### Limitations

- **Classification is not evidence quality**: v1 can route a file without determining whether it is high-value evidence.
- **Limited duplicate handling**: v1 stores file hashes, but does not use normalized text hashes to route duplicate content.
- **Single primary workspace**: v1 persists one `workspace` and one `subfolder` per file.
- **No explicit keep/review/archive routing**: v1 uses classification and review flags, not evidence lifecycle status.
- **No structured evidence card**: v1 exports markdown and manifests, but not per-file structured JSON facts for downstream reasoning.
- **Case-study support is shallow**: v1 can mark candidates, but does not score readiness or extract evidence facts.

## 3. KIWI v2 Vision

KIWI v2 is a local-first evidence preparation pipeline that turns messy batches of documents into clean, deduplicated, scored, routed, and evidence-rich outputs for AI retrieval, workspace ingestion, and case-study generation. It preserves the v1 scan/run/export workflow while adding a dedicated Evidence Pipeline between normalization and export.

The core concept is the **Evidence Pipeline**. Instead of treating all classified files as equally useful, v2 evaluates the normalized content of each file, detects duplicate evidence, scores the file’s evidence value, routes it to keep/review/archive, suggests one or more workspaces, writes a structured evidence card, and exports only the cleanest useful material to AI tools.

v2 solves problems v1 cannot fully solve:

- Reduces noisy ingestion into AnythingLLM and Open WebUI.
- Prevents repeated or near-identical content from polluting retrieval.
- Separates small fragments and low-value documents from high-value evidence.
- Makes routing explainable through evidence reasons and sidecar metadata.
- Provides structured facts for future case-study generation.
- Supports multiple workspace suggestions where a file is useful to more than one knowledge area.

## 4. Side-by-Side Comparison Table

| Feature | KIWI v1 | KIWI v2 |
|---|---|---|
| Input assumptions | Assumes supported files can be scanned, normalized, classified, and exported. | Assumes scanned files need quality control before export: dedupe, score, route, and enrich. |
| Data quality handling | Uses small-file lane, relevance gate, fallback classification, and `review_required`. | Adds explicit evidence quality scoring, archive routing, duplicate routing, and audit summaries. |
| Duplicate handling | Stores file-level `sha256`; export handles duplicate filenames. No normalized content duplicate route. | Uses `normalized_hash` to detect duplicate normalized text and route duplicates to archive. |
| Scoring | Classification confidence indicates how confident KIWI is about category/workspace. | Evidence score indicates how valuable the file is as downstream evidence. |
| Routing logic | Routes primarily by category/workspace/subfolder and review flag. | Routes by evidence result: keep, review, or archive with explicit archive reasons. |
| Workspace assignment | Persists one `workspace` and one `subfolder`. Can withhold workspace on low confidence. | Keeps v1 workspace fields and adds suggested multi-workspace/subfolder metadata. |
| AI usage | Optional AI classification fallback/augmentation depending on config. | AI can be used more selectively after cleanup; evidence scoring reduces low-value AI calls. |
| Output structure | Profile exports under AnythingLLM/Open WebUI folders with manifests. | Adds evidence/archive folders, evidence card sidecars, batch/run summaries, and cleaner profile exports. |
| Case study readiness | Flags `case_study_candidate` based on classification/category/signals. | Adds `case_study_readiness` and evidence facts to support case-study generation. |
| Observability / logging | Runner state, stage checkpoints, classification reason, manifests, logs. | Adds evidence audit/preflight stats, route explanations, evidence cards, archive reasons, and quality summaries. |
| Failure recovery | Resumable per-file stages and profile-specific runner states. | Same v1 recovery model, with evidence metadata persisted incrementally. |
| Original files | Original files are scanned and referenced; exports are generated separately. | Original files remain untouched; routing creates copied/derived outputs and sidecars. |

## 5. New Concepts Introduced in v2

### Evidence Score

`evidence_score` is a numeric assessment of how useful a file is as evidence. Unlike classification confidence, it is not about category certainty. It measures downstream value based on normalized content signals such as size, positive evidence keywords, negative/noise keywords, and other quality heuristics.

In the current v2 service, thresholds include:

- `MIN_WORDS = 150`
- `MIN_CHARS = 800`
- `HIGH_VALUE_SCORE = 70`
- `REVIEW_SCORE = 35`

### Archive Status

`archive_status` is the lifecycle routing state for the file after evidence evaluation.

- **keep**: strong enough to retain as useful evidence.
- **review**: potentially useful but needs human review.
- **archive**: too small, duplicate, or low-value for primary AI ingestion.

`archive_reason` explains why the file was routed, using reasons such as:

- `KEEP_HIGH_VALUE`
- `KEEP_REVIEW`
- `ARCHIVE_TOO_SMALL`
- `ARCHIVE_DUPLICATE`
- `ARCHIVE_LOW_VALUE`

### Evidence Cards

An evidence card is a structured JSON sidecar for a processed file. It records the core facts needed for auditability and future generation workflows.

Evidence cards include data such as:

- file ID and source path
- normalized path
- normalized hash
- word and character counts
- evidence score
- case-study readiness
- route and archive status
- matched positive/negative keywords
- duplicate relationship
- suggested workspaces/subfolders
- explainable routing text
- checkpoint context

### Case Study Readiness

`case_study_readiness` expresses whether a file is useful for case-study generation.

Current states are:

- `none`
- `weak`
- `moderate`
- `strong`

This is separate from `case_study_candidate`. v1 can identify likely candidates; v2 evaluates how complete or useful the evidence is for generating a credible case study.

### Multi-workspace Assignment

v1 persists a single `workspace` and `subfolder`. v2 introduces suggested multi-workspace metadata through `suggested_workspaces` and `suggested_subfolders`.

This allows one evidence item to be recommended for multiple downstream contexts without breaking the existing single-workspace export model.

## 6. Updated Pipeline Diagram (Text-based)

### KIWI v1

```text
Scan → Normalize → Chunk → Classify → Export
```

Simplified product view:

```text
Scan → Classify → Export
```

### KIWI v2

```text
Scan → Normalize → Deduplicate → Score → Route → Assign → Extract → Export
```

Expanded implementation view:

```text
Scan
  → Normalize markdown
  → Compute normalized_hash
  → Detect duplicates
  → Score evidence value
  → Route keep/review/archive
  → Suggest workspaces/subfolders
  → Write evidence card JSON
  → Write evidence/archive manifests
  → Export clean kept/reviewed outputs
```

## 7. Data Model Changes

The current schema has already started adding v2 evidence fields to the `files` table. Important v2 fields include:

- **`normalized_hash`**
  - SHA256 hash of normalized text content.
  - Used for duplicate detection after normalization.

- **`evidence_score`**
  - Numeric evidence quality/value score.
  - Distinct from classification confidence.

- **`case_study_readiness`**
  - Readiness level for case-study generation.
  - Current values: `none`, `weak`, `moderate`, `strong`.

- **`archive_status`**
  - Lifecycle route for evidence.
  - Current values: `keep`, `review`, `archive`.

- **`archive_reason`**
  - Explainable reason for the route.
  - Examples: duplicate, too small, low value, high value, review.

- **`duplicate_of`**
  - File ID of the earlier matching normalized document, when duplicate content is detected.

- **`suggested_workspaces`**
  - Serialized list of recommended workspaces.
  - Supports multi-workspace suggestions without replacing the v1 `workspace` field.

- **`evidence_card_path`**
  - Path to the structured JSON evidence sidecar.

Additional implemented/supporting fields include:

- `word_count`
- `char_count`
- `matched_positive_keywords`
- `matched_negative_keywords`
- `suggested_subfolders`

## 8. Migration Strategy (IMPORTANT)

### v1 continues to work

v2 must remain additive. Existing v1 flows must continue to run with no behavior change when evidence mode is disabled.

Preservation rules:

- Keep existing CLI commands working.
- Keep existing project setup and scan behavior working.
- Keep existing classification fields and review workflow working.
- Keep existing AnythingLLM/Open WebUI export behavior working.
- Do not require existing projects to rescan or rebuild unless the user chooses to.

### v2 is an optional pipeline mode

The v2 evidence pipeline should be controlled by an explicit setting such as `evidence_pipeline_enabled`. The default should remain `false` for backward compatibility.

When disabled:

```text
v1 behavior: normalize/chunk/classify/export
```

When enabled:

```text
v2 behavior: normalize → evidence pipeline → classify/export decisions
```

### Incremental adoption path

- **Step 1: Add schema fields**
  - Add nullable/defaulted fields through additive migrations.
  - Avoid destructive migrations.

- **Step 2: Persist evidence metadata**
  - Compute and store normalized hash, score, status, reason, suggestions, and card path.

- **Step 3: Keep export compatibility**
  - Continue exporting through existing profiles.
  - Skip or separate archived files only when v2 mode is enabled.

- **Step 4: Add audit UI**
  - Show evidence counts, duplicate counts, archive/review/keep totals, top keywords, and quality score.

- **Step 5: Add case-study generation later**
  - Use evidence cards as stable structured inputs.

### Avoiding breakage

- Use additive columns with defaults.
- Keep `workspace` and `subfolder` as the primary v1 fields.
- Store v2 multi-workspace suggestions separately.
- Keep original files untouched.
- Keep profile-specific runner states intact.
- Make v2 routing conditional and explainable.
- Ensure archived files are not deleted; they are routed into archive outputs.

## 9. Implementation Roadmap

### Phase 1: External cleanup script (already done)

Goal: Prove the cleanup and evidence-routing concepts outside the main app.

Deliverables:

- External cleanup/scoring approach.
- Threshold assumptions.
- Initial archive/keep/review categories.
- Lessons learned from real batches.

### Phase 2: Integrate scoring + routing into KIWI

Goal: Move the core evidence evaluation into the KIWI service layer.

Deliverables:

- Evidence scoring service.
- Normalized hash duplicate detection.
- Keep/review/archive routing.
- Persistence into v2 evidence fields.
- Conditional `evidence_pipeline_enabled` mode.

### Phase 3: Add evidence cards

Goal: Produce structured JSON sidecars for each processed evidence file.

Deliverables:

- Evidence card schema.
- Per-file evidence card writing.
- Evidence card path persisted in SQLite.
- Card contents include route explanation and scoring inputs.

### Phase 4: Add UI enhancements (preflight audit)

Goal: Make v2 behavior visible before and after export.

Deliverables:

- Evidence Audit / Preflight screen.
- Counts for scanned, duplicates, too small, high value, review, archive.
- Top matched keywords.
- Batch quality score.
- Estimated AI calls.

### Phase 5: Case study generation layer

Goal: Use high-quality evidence cards to support reliable case-study generation.

Deliverables:

- Case-study readiness workflow.
- Structured extraction prompts or local generation pipeline.
- Draft case-study outputs grounded in evidence cards.
- Human review step before final output.

## 10. Risks and Tradeoffs

### Over-filtering data

If thresholds are too strict, useful files may be archived. This risk is highest for short but important documents, such as concise decisions, requirements, or executive summaries.

Mitigations:

- Route borderline files to `review`, not `archive`.
- Keep originals untouched.
- Preserve archive manifests and evidence cards.
- Make thresholds configurable.

### AI hallucination risks

v2 can reduce hallucination by improving input quality, but it does not eliminate hallucination. Case-study generation is especially risky if generated from weak or incomplete evidence.

Mitigations:

- Prefer evidence cards and traceable source paths.
- Use case-study readiness before generation.
- Require human review for generated case studies.
- Keep extracted facts separate from generated narrative.

### Performance tradeoffs

Additional normalization, hashing, scoring, card writing, and manifest generation add processing overhead.

Mitigations:

- Keep the evidence pipeline local and deterministic where possible.
- Use cheap text heuristics before AI calls.
- Avoid reprocessing unchanged files when hashes/checkpoints are available.
- Keep v2 optional.

### Complexity vs usability

v2 introduces more states and metadata. This improves control but can overwhelm users if surfaced poorly.

Mitigations:

- Keep the main workflow simple: Save Project → Scan → Run → Export.
- Put advanced metrics in Evidence Audit.
- Use clear route labels: keep, review, archive.
- Provide plain-language explanations for every route.

## 11. Success Criteria

KIWI v2 is working when it improves downstream AI quality without breaking v1 workflows.

Practical success criteria:

- **Stable v1 compatibility**
  - Existing projects still scan, classify, review, and export with v2 disabled.

- **Useful archive/keep distribution**
  - A meaningful percentage of low-value files are archived.
  - High-value files are retained for export.
  - Borderline files are routed to review instead of silently discarded.

- **Duplicate reduction**
  - Repeated normalized content is detected and routed as duplicate.
  - AnythingLLM/Open WebUI receive fewer redundant documents.

- **Better retrieval quality**
  - Search results in AnythingLLM/Open WebUI contain fewer fragments, duplicates, and low-signal files.
  - Retrieved documents have clearer source metadata and stronger evidence value.

- **Reduced hallucinations**
  - AI answers and generated summaries rely more often on high-value source evidence.
  - Case-study drafts cite or trace back to evidence cards and source files.

- **Case-study readiness improves**
  - Files marked `strong` or `moderate` produce better case-study drafts than unscored v1 candidates.
  - Reviewers spend less time identifying whether a file contains usable evidence.

- **Operational observability**
  - Evidence Audit shows total files, duplicates, too-small files, keep/review/archive counts, top keywords, estimated AI calls, and batch quality score.
  - Each routed file has an explainable reason and a persisted evidence card.
