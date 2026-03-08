'use client'

import { buildCreatorPlanPayload, type CreatorPlanFormValues } from '@/lib/creator/creatorPlanFields'

type Props = {
  values: CreatorPlanFormValues
  title?: string
}

function block(text: string) {
  return (text ?? '').trim()
}

export default function CreatorPlanPreviewCard({ values, title = '설득 정보 미리보기' }: Props) {
  const payload = buildCreatorPlanPayload(values)
  const summary = block(payload.summary)
  const overview = block(payload.overview)
  const target = block(payload.target_audience)
  const revenue = block(payload.revenue_model)
  const inv = payload.investment_points.filter(Boolean)
  const risk = payload.risk_points.filter(Boolean)
  const road = payload.roadmap_items.filter(Boolean)
  const hasAny = summary || overview || target || revenue || inv.length > 0 || risk.length > 0 || road.length > 0

  if (!hasAny) {
    return (
      <div style={{
        backgroundColor: 'var(--card-bg)',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        fontSize: '13px',
        color: 'var(--text-muted)',
      }}>
        <div style={{ fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '8px' }}>{title}</div>
        <p style={{ margin: 0 }}>한 줄 소개, 개요, 타깃·수익·투자포인트·리스크·로드맵을 입력하면 여기에 요약이 표시됩니다.</p>
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      padding: '16px',
      borderRadius: '12px',
      border: '1px solid var(--border-color)',
      fontSize: '13px',
      color: 'var(--text-primary)',
    }}>
      <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '12px', fontSize: '14px' }}>{title}</div>

      {summary && (
        <div style={{ marginBottom: '10px' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>한 줄 소개</span>
          <p style={{ margin: '4px 0 0', lineHeight: 1.4 }}>{summary}</p>
        </div>
      )}

      {overview && (
        <div style={{ marginBottom: '10px' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>개요</span>
          <p style={{ margin: '4px 0 0', lineHeight: 1.4, whiteSpace: 'pre-line', maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{overview}</p>
        </div>
      )}

      {target && (
        <div style={{ marginBottom: '10px' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>타깃 팬층</span>
          <p style={{ margin: '4px 0 0', lineHeight: 1.4 }}>{target}</p>
        </div>
      )}

      {revenue && (
        <div style={{ marginBottom: '10px' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>수익 구조</span>
          <p style={{ margin: '4px 0 0', lineHeight: 1.4, whiteSpace: 'pre-line', maxHeight: '48px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{revenue}</p>
        </div>
      )}

      {inv.length > 0 && (
        <div style={{ marginBottom: '10px' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>투자 포인트</span>
          <ul style={{ margin: '4px 0 0', paddingLeft: '18px', lineHeight: 1.4 }}>
            {inv.slice(0, 3).map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      {risk.length > 0 && (
        <div style={{ marginBottom: '10px' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>리스크</span>
          <ul style={{ margin: '4px 0 0', paddingLeft: '18px', lineHeight: 1.4 }}>
            {risk.slice(0, 3).map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      {road.length > 0 && (
        <div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>로드맵</span>
          <ol style={{ margin: '4px 0 0', paddingLeft: '18px', lineHeight: 1.4 }}>
            {road.slice(0, 3).map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
