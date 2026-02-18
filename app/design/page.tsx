'use client';

import { HBCard } from '@/components/ui/HBCard';
import { HBButton } from '@/components/ui/HBButton';
import HBTabs from '@/components/ui/HBTabs';
import { HBChip } from '@/components/ui/HBChip';
import HBSkeleton, { HBCardSkeleton, HBEmpty, HBError } from '@/components/ui/HBSkeleton';
import { useState } from 'react';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="h2 mb-4" style={{ borderBottom: '2px solid var(--border)', paddingBottom: 8 }}>{title}</h2>
      {children}
    </section>
  );
}

export default function DesignLabPage() {
  const [activeTab, setActiveTab] = useState('buttons');

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)', padding: 'var(--space-lg)' }}>
      <header className="mb-8">
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>HANBANG Design Lab</h1>
        <p className="body-sm" style={{ color: 'var(--text-muted)' }}>
          Component inventory &amp; state showcase
        </p>
      </header>

      <Section title="HBButton">
        <div className="flex flex-wrap gap-3 mb-4">
          <HBButton variant="primary">Primary</HBButton>
          <HBButton variant="secondary">Secondary</HBButton>
          <HBButton variant="ghost">Ghost</HBButton>
          <HBButton variant="danger">Danger</HBButton>
        </div>
        <div className="flex flex-wrap gap-3 mb-4">
          <HBButton size="sm">Small</HBButton>
          <HBButton size="md">Medium</HBButton>
          <HBButton size="lg">Large</HBButton>
        </div>
        <div className="flex flex-wrap gap-3">
          <HBButton loading>Loading</HBButton>
          <HBButton disabled>Disabled</HBButton>
          <HBButton fullWidth variant="primary">Full Width</HBButton>
        </div>
      </Section>

      <Section title="HBCard">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(['default', 'ghost', 'elevated', 'royal'] as const).map(v => (
            <HBCard key={v} variant={v} hover>
              <p style={{ fontWeight: 700 }}>{v}</p>
              <p className="caption" style={{ color: v === 'royal' ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>
                Card variant
              </p>
            </HBCard>
          ))}
        </div>
      </Section>

      <Section title="HBTabs">
        <HBTabs
          tabs={[
            { key: 'buttons', label: 'Buttons' },
            { key: 'cards', label: 'Cards', count: 4 },
            { key: 'chips', label: 'Chips' },
            { key: 'skeleton', label: 'Loading' },
          ]}
          active={activeTab}
          onChange={setActiveTab}
        />
        <p className="body-sm mt-2" style={{ color: 'var(--text-muted)' }}>Active: {activeTab}</p>
      </Section>

      <Section title="HBChip">
        <div className="flex flex-wrap gap-2">
          {(['default', 'blue', 'green', 'red', 'amber', 'muted'] as const).map(tone => (
            <HBChip key={tone} tone={tone}>{tone}</HBChip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <HBChip tone="green" size="md">OPEN</HBChip>
          <HBChip tone="blue" size="md">FILLED</HBChip>
          <HBChip tone="red" size="md">CANCELLED</HBChip>
          <HBChip tone="amber" size="md">PARTIAL</HBChip>
        </div>
      </Section>

      <Section title="HBSkeleton + Loading States">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <HBCardSkeleton />
          <HBCardSkeleton />
          <HBCardSkeleton />
        </div>
        <div className="flex gap-4 items-center mb-6">
          <HBSkeleton variant="circle" />
          <HBSkeleton variant="text" w="60%" />
          <HBSkeleton variant="rect" w={120} h={32} />
        </div>
      </Section>

      <Section title="Empty / Error States">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HBCard variant="ghost">
            <HBEmpty message="No orders yet" action={<HBButton size="sm" variant="ghost">Place Order</HBButton>} />
          </HBCard>
          <HBCard variant="ghost">
            <HBError message="Failed to load data" onRetry={() => alert('retry')} />
          </HBCard>
        </div>
      </Section>

      <Section title="Typography">
        <div className="space-y-2">
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>h1 — 28px / 800</h1>
          <h2 className="h2">h2 — Design Token</h2>
          <h3 className="h3">h3 — Design Token</h3>
          <p className="body-sm">body-sm — Small body text</p>
          <p className="caption">caption — Caption / label</p>
        </div>
      </Section>

      <Section title="Color Tokens">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ['--royal-blue', 'Royal Blue'],
            ['--emerald', 'Emerald (Gain)'],
            ['--accent-loss', 'Accent Loss'],
            ['--bg', 'Background'],
            ['--bg-secondary', 'BG Secondary'],
            ['--card', 'Card'],
            ['--card-elevated', 'Card Elevated'],
            ['--border', 'Border'],
          ].map(([varName, label]) => (
            <div key={varName} className="flex items-center gap-2">
              <div
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `var(${varName})`,
                  border: '1px solid var(--border)',
                }}
              />
              <div>
                <p style={{ fontSize: 12, fontWeight: 600 }}>{label}</p>
                <p className="caption" style={{ color: 'var(--text-muted)' }}>{varName}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <footer className="mt-16 pt-4" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
        <p className="caption">HANBANG Design Lab — For visual review only</p>
      </footer>
    </div>
  );
}
