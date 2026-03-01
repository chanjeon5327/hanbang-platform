'use client';

type Props = {
  title?: string;
};

export default function DashboardHeader({ title = '내 자산' }: Props) {
  return (
    <header className="px-4 py-4">
      <h1 className="font-bold" style={{ fontSize: 22, color: 'var(--text)' }}>
        {title}
      </h1>
    </header>
  );
}
