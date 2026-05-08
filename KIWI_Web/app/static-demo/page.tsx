'use client'

import Link from 'next/link'
import { CheckCircle2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

const cardClass = 'rounded-xl border border-[var(--kiwi-border)] bg-white shadow-sm'
const labelClass = 'text-xs font-semibold text-[var(--kiwi-text-2)]'
const inputClass =
  '!rounded-[var(--kiwi-radius-sm)] !border-[var(--kiwi-border-strong)] !bg-white !text-[var(--kiwi-text)] placeholder:!text-[var(--kiwi-text-3)] focus:!border-[var(--kiwi-blue)] focus:!ring-1 focus:!ring-[var(--kiwi-blue)]'
const selectClass =
  '!h-10 !rounded-[var(--kiwi-radius-sm)] !border-[var(--kiwi-border)] !bg-white !text-[var(--kiwi-text)] text-sm focus:!border-[var(--kiwi-blue)] focus:!ring-1 focus:!ring-[var(--kiwi-blue)]'
const primaryButtonClass =
  'h-10 w-full !rounded-[var(--kiwi-radius)] !bg-[var(--kiwi-blue)] !px-4 !py-2 !text-sm !font-semibold !text-white transition-colors duration-150 hover:!bg-[#2f4ac5]'
const secondaryButtonClass =
  '!rounded-[var(--kiwi-radius)] !border !border-[var(--kiwi-border)] !bg-white !px-4 !py-2 !text-sm !text-[var(--kiwi-text-2)] hover:!border-[var(--kiwi-blue)] hover:!bg-[var(--kiwi-blue-pale)] hover:!text-[var(--kiwi-blue)]'
const filledSecondaryButtonClass =
  '!rounded-[var(--kiwi-radius)] !border !border-[var(--kiwi-blue)] !bg-[var(--kiwi-blue)] !px-4 !py-2 !text-sm !font-semibold !text-white hover:!bg-[#2f4ac5]'
const sectionTagClass = 'inline-flex bg-[#123755] px-3 py-0.5 text-base font-semibold leading-tight text-white'

const queueRows = [
  {
    file_id: 'batch_003-001',
    filename: 'invoice_reconciliation_notes.pdf',
    status: 'ready',
    evidence: 'KEEP_HIGH_VALUE',
    workspace: 'Finance',
    score: '91'
  },
  {
    file_id: 'batch_003-014',
    filename: 'client_kickoff_duplicate.docx',
    status: 'review',
    evidence: 'KEEP_REVIEW',
    workspace: 'Client Ops',
    score: '68'
  },
  {
    file_id: 'batch_003-044',
    filename: 'old_export_copy.txt',
    status: 'archive',
    evidence: 'ARCHIVE_DUPLICATE',
    workspace: 'Archive',
    score: '12'
  }
]

const evidenceMetrics = [
  ['Total files scanned', '225'],
  ['KEEP_HIGH_VALUE', '143'],
  ['KEEP_REVIEW', '29'],
  ['ARCHIVE_*', '53'],
  ['Duplicates', '41'],
  ['Batch quality score', '82']
]

export default function StaticDemoPage() {
  return (
    <div className="min-h-[calc(100vh-48px)] bg-[#f5f8ff] px-3 py-3 md:px-4 md:py-4">
      <div className="mx-auto w-full max-w-[1420px] space-y-4">
        <section className={`${cardClass} overflow-hidden bg-[#f8fbff] p-4`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-[var(--kiwi-text)]">KIWI 2.0 Static Demo</h1>
              <p className="mt-1 text-sm text-[var(--kiwi-text-2)]">
                Mocked operator flow for demos: Project Setup, Folder Targets, AI Setup, then Queue and Evidence Audit.
              </p>
            </div>
            <Link href="/setup">
              <Button variant="secondary" className={secondaryButtonClass}>Open Live App</Button>
            </Link>
          </div>

          <div className="mt-4 grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
            {[
              ['1', 'Project Setup', 'Create or load a KIWI project.'],
              ['2', 'Folder Targets', 'Choose source and export destinations.'],
              ['3', 'AI Setup', 'Confirm model, mode, and backend readiness.'],
              ['4', 'Queue / Evidence Audit', 'Review files, evidence routing, and outcomes.']
            ].map(([number, title, text]) => (
              <div key={number} className="rounded-lg border border-[var(--kiwi-green)] bg-[var(--kiwi-green-light)] px-3 py-2.5">
                <div className="mb-1 flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--kiwi-green)] text-xs font-bold text-white">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <p className="text-xs font-semibold text-[var(--kiwi-text)]">{title}</p>
                </div>
                <p className="text-[11px] text-[var(--kiwi-text-3)]">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
          <div className={`${cardClass} h-full space-y-3 p-4`}>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-[var(--kiwi-radius-sm)] bg-[var(--kiwi-blue)] text-xs font-bold text-white">
                1
              </span>
              <h2 className="text-[15px] font-semibold text-[#151726]">Project Setup</h2>
            </div>
            <p className="text-[12px] text-[var(--kiwi-text-3)]">Create or load a KIWI project before processing batches.</p>
            <Button type="button" className={primaryButtonClass}>Quick Start Guide and Tips</Button>
            <p className="rounded-[var(--kiwi-radius-sm)] border border-[var(--kiwi-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--kiwi-text-2)]">
              Project status: Unsaved changes
            </p>
            <div>
              <label className={`mb-1 block ${labelClass}`}>Project Name</label>
              <Input className={inputClass} value="kiwi20-demo" readOnly />
            </div>
            <Button type="button" className={primaryButtonClass}>Update Project</Button>
            <div className="border-t border-[var(--kiwi-border)] pt-3">
              <p className="mb-1.5 text-xs font-semibold text-[var(--kiwi-text-2)]">Project Tools</p>
              <div className="space-y-1 rounded-xl border border-[var(--kiwi-border)] bg-white p-3 text-[12.5px]">
                <button className="block w-full rounded-[var(--kiwi-radius-sm)] p-2 text-left text-[var(--kiwi-text-2)] hover:bg-[var(--kiwi-blue-pale)]">
                  Load Existing Project
                </button>
                <button className="block w-full rounded-[var(--kiwi-radius-sm)] p-2 text-left text-[var(--kiwi-text-2)] hover:bg-[var(--kiwi-blue-pale)]">
                  Clear Existing Data
                </button>
              </div>
            </div>
          </div>

          <div className={`${cardClass} h-full space-y-3 border-l-4 border-l-[var(--kiwi-blue)] p-4`}>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-[var(--kiwi-radius-sm)] bg-[var(--kiwi-blue)] text-xs font-bold text-white">
                2
              </span>
              <h2 className="text-[15px] font-semibold text-[#151726]">Folder Targets</h2>
            </div>
            <p className="text-[12px] text-[var(--kiwi-text-3)]">Choose source folders and export destinations for this batch.</p>
            <div className="space-y-2.5">
              <p className={sectionTagClass}>Import Path</p>
              <div>
                <label className={`mb-1 block ${labelClass}`}>Import Path</label>
                <Input className={`${inputClass} font-mono`} value="C:\\GitProd\\batch-corpus\\KIWI-READY\\DEDUPED_KEEP\\" readOnly />
              </div>
              <div>
                <label className={`mb-1 block ${labelClass}`}>Next Batch Folder</label>
                <Input className={`${inputClass} font-mono`} value="batch_003" readOnly />
              </div>
              <p className="rounded bg-[#f8f9fc] px-3 py-1.5 font-mono text-[11px] text-[var(--kiwi-text-2)]">
                Batch to Scan: C:\GitProd\batch-corpus\KIWI-READY\DEDUPED_KEEP\batch_003
              </p>
              <p className="rounded bg-[#f8f9fc] px-3 py-1.5 font-mono text-[11px] text-[var(--kiwi-text-2)]">
                Last Scan / Debug: 225 files discovered in batch_003
              </p>
              <Button type="button" className="h-10 w-full !rounded-[var(--kiwi-radius)] !bg-[var(--kiwi-green)] !px-4 !py-2 !text-sm !font-semibold !text-white">
                Scan Batch
              </Button>
              <Button type="button" variant="secondary" className={secondaryButtonClass}>Update Project</Button>
            </div>
            <div className="border-t border-[var(--kiwi-border)] pt-3">
              <p className={`mb-2 ${sectionTagClass}`}>Export Path</p>
              <div className="space-y-2.5">
                <div>
                  <label className={`mb-1 block ${labelClass}`}>Export Folder</label>
                  <Input className={`${inputClass} font-mono`} value="C:\\GitProd\\batch-corpus\\KIWI-EXPORT" readOnly />
                </div>
                <div>
                  <label className={`mb-1 block ${labelClass}`}>Export Profile</label>
                  <Select className={selectClass} value="both" disabled>
                    <option value="anythingllm">AnythingLLM</option>
                    <option value="open_webui">Open WebUI</option>
                    <option value="both">Both</option>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className={`${cardClass} h-full space-y-3 border-l-4 border-l-[var(--kiwi-green)] p-4`}>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-[var(--kiwi-radius-sm)] bg-[var(--kiwi-blue)] text-xs font-bold text-white">
                3
              </span>
              <h2 className="text-[15px] font-semibold text-[#151726]">AI Setup</h2>
            </div>
            <p className="text-[12px] text-[var(--kiwi-text-3)]">Confirm AI settings and run the scanned batch.</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <label className={`mb-1 block ${labelClass}`}>Provider</label>
                <Select className={selectClass} value="ollama" disabled><option value="ollama">Ollama</option></Select>
              </div>
              <div>
                <label className={`mb-1 block ${labelClass}`}>Model</label>
                <Select className={selectClass} value="qwen2.5:7b-instruct" disabled><option value="qwen2.5:7b-instruct">qwen2.5:7b-instruct</option></Select>
              </div>
              <div>
                <label className={`mb-1 block ${labelClass}`}>AI Mode</label>
                <Select className={selectClass} value="ai_only_unclassified" disabled><option value="ai_only_unclassified">ai_only_unclassified</option></Select>
              </div>
            </div>
            <div className="rounded-[var(--kiwi-radius-sm)] border border-[var(--kiwi-border)] bg-white">
              <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#1f2333]">
                Review settings before running
                <span className="inline-flex items-center gap-1 rounded-[var(--kiwi-radius-sm)] border border-[var(--kiwi-blue)] bg-[var(--kiwi-blue-light)] px-2 py-0.5 text-[var(--kiwi-blue)]">
                  Expand <ChevronRight className="h-3 w-3" />
                </span>
              </div>
              <p className="border-t border-[var(--kiwi-border)] px-3 py-2 text-xs text-[var(--kiwi-text-2)]">
                AI: Ollama | Model: qwen2.5:7b-instruct | Mode: ai_only_unclassified | Export: Both
              </p>
            </div>
            <Button type="button" className={primaryButtonClass}>Run Batch</Button>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="secondary" className={secondaryButtonClass}>Refresh</Button>
              <Button type="button" variant="secondary" className={secondaryButtonClass}>Clear</Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[var(--kiwi-green-light)] px-3 py-1 text-xs font-semibold text-[var(--kiwi-green)]">Backend: Online</span>
              <span className="rounded-full bg-[var(--kiwi-blue-light)] px-3 py-1 text-xs font-semibold text-[var(--kiwi-blue)]">Profile: Both</span>
            </div>
          </div>
        </section>

        <section className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between rounded-[var(--kiwi-radius-sm)] bg-[var(--kiwi-blue-pale)] px-3 py-2">
            <div>
              <h2 className="text-sm font-semibold text-[var(--kiwi-text)]">AI & Keyword Settings</h2>
              <p className="text-xs text-[var(--kiwi-text-2)]">Review AI settings and apply keyword suggestions.</p>
            </div>
            <span className="inline-flex rounded-[var(--kiwi-radius-sm)] border border-[var(--kiwi-blue)] bg-white px-3 py-1 text-xs font-semibold text-[var(--kiwi-blue)]">
              Collapse
            </span>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[var(--kiwi-text)]">Review AI Settings</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input className={inputClass} value="Ollama" readOnly />
                <Input className={inputClass} value="qwen2.5:7b-instruct" readOnly />
                <Input className={inputClass} value="ai_only_unclassified" readOnly />
                <Input className={inputClass} value="Both" readOnly />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" className={secondaryButtonClass}>Refresh Models</Button>
                <Button type="button" className={filledSecondaryButtonClass}>Test Connection</Button>
                <Button type="button" className={primaryButtonClass}>Save AI Settings</Button>
              </div>
              <p className="rounded-[var(--kiwi-radius-sm)] bg-[var(--kiwi-green-light)] px-3 py-2 text-xs font-medium text-[var(--kiwi-green)]">
                Ollama reachable. qwen2.5:7b-instruct is available.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[var(--kiwi-text)]">Keyword Suggestions</h3>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" className={secondaryButtonClass}>Suggest Categories from Scanned Files</Button>
                <Button type="button" variant="secondary" className={secondaryButtonClass}>Apply Suggestions</Button>
              </div>
              <ul className="max-h-52 space-y-1.5 overflow-y-auto rounded-[var(--kiwi-radius-sm)] border border-[var(--kiwi-border)] bg-white p-3 text-xs text-[var(--kiwi-text-2)]">
                <li className="rounded bg-[#f8f9fc] px-2 py-1">Workspace: finance - 48 evidence hits</li>
                <li className="rounded bg-[#f8f9fc] px-2 py-1">Company: acme - client_ops</li>
                <li className="rounded bg-[#f8f9fc] px-2 py-1">Project: migration - delivery</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 xl:grid-cols-[1.4fr_1fr]">
          <div className={`${cardClass} p-4`}>
            <h2 className="mb-3 text-sm font-semibold text-[#151726]">Queue</h2>
            <div className="overflow-x-auto rounded-[var(--kiwi-radius)] border border-[var(--kiwi-border)] bg-white">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead className="bg-[var(--kiwi-blue-pale)] text-[var(--kiwi-text-2)]">
                  <tr>
                    {['File ID', 'Filename', 'Status', 'Evidence Route', 'Workspace', 'Score'].map((header) => (
                      <th key={header} className="px-3 py-2 font-semibold">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {queueRows.map((row) => (
                    <tr key={row.file_id} className="border-t border-[var(--kiwi-border)]">
                      <td className="px-3 py-2 font-mono">{row.file_id}</td>
                      <td className="px-3 py-2">{row.filename}</td>
                      <td className="px-3 py-2">{row.status}</td>
                      <td className="px-3 py-2">{row.evidence}</td>
                      <td className="px-3 py-2">{row.workspace}</td>
                      <td className="px-3 py-2">{row.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={`${cardClass} p-4`}>
            <h2 className="mb-3 text-sm font-semibold text-[#151726]">Evidence Audit</h2>
            <div className="grid grid-cols-2 gap-2">
              {evidenceMetrics.map(([label, value]) => (
                <div key={label} className="rounded-[var(--kiwi-radius-sm)] border border-[var(--kiwi-border)] bg-white p-3">
                  <p className="text-[11px] uppercase tracking-wide text-[var(--kiwi-text-3)]">{label}</p>
                  <p className="mt-1 text-xl font-semibold text-[var(--kiwi-text)]">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-[var(--kiwi-radius-sm)] border border-[var(--kiwi-border)] bg-white p-3">
              <p className="text-xs font-semibold text-[var(--kiwi-text-2)]">Top evidence terms</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {['invoice', 'client', 'migration', 'timeline', 'reconciliation'].map((term) => (
                  <span key={term} className="rounded-full bg-[var(--kiwi-blue-pale)] px-3 py-1 text-[var(--kiwi-blue)]">{term}</span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
