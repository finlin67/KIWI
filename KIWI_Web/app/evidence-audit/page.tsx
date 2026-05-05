'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { getEvidenceAudit, getToken } from '@/lib/api'

const metricLabels: Record<string, string> = {
  total_files_scanned: 'Total files scanned',
  duplicates: 'Duplicates',
  too_small: 'Too small',
  high_value: 'High value',
  review: 'Review',
  archive: 'Archive',
  estimated_ai_calls: 'Estimated AI calls',
  batch_quality_score: 'Batch quality score'
}

export default function EvidenceAuditPage() {
  const [summary, setSummary] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasProject, setHasProject] = useState(false)

  const load = async () => {
    setError('')
    setHasProject(Boolean(getToken()))
    if (!getToken()) {
      setSummary({})
      return
    }
    setLoading(true)
    try {
      const payload = await getEvidenceAudit()
      setSummary(payload.summary ?? {})
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load evidence audit.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const topKeywords = Array.isArray(summary.top_matched_keywords) ? summary.top_matched_keywords : []

  return (
    <div className="space-y-4">
      <PageHeader title="Evidence Audit / Preflight" subtitle="KIWI v2 evidence pipeline quality and routing summary" />
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      {!hasProject ? <p className="text-sm text-[var(--danger)]">No active project. Go to Setup and create or load a project first.</p> : null}
      <div className="sticky top-0 z-10 flex items-center gap-3 rounded border border-[var(--border)] bg-[#11131d] p-2">
        <Button variant="secondary" onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh Evidence Audit'}</Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Object.entries(metricLabels).map(([key, label]) => (
          <div key={key} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg2)] p-4">
            <p className="text-xs uppercase tracking-[0.06em] text-[var(--text3)]">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text1)]">{String(summary[key] ?? 0)}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <SectionLabel label="TOP MATCHED KEYWORDS" subtext="Evidence terms that influenced routing" />
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg2)] p-4">
          {topKeywords.length ? (
            <div className="flex flex-wrap gap-2">
              {topKeywords.map((item, idx) => {
                const pair = Array.isArray(item) ? item : [String(item), '']
                return <span key={`${String(pair[0])}-${idx}`} className="rounded-full border border-[var(--border)] bg-[var(--bg3)] px-3 py-1 text-sm text-[var(--text2)]">{String(pair[0])}: {String(pair[1])}</span>
              })}
            </div>
          ) : (
            <p className="text-sm text-[var(--text3)]">No evidence keywords have been recorded yet. Run a batch with v2 evidence mode enabled.</p>
          )}
        </div>
      </div>
    </div>
  )
}
