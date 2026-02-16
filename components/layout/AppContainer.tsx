export default function AppContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-8 pb-16 min-h-screen">
      {children}
    </div>
  );
}
