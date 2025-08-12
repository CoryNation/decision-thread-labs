import AppMenu from '@/components/AppMenu';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[80vh]">
      <AppMenu />
      {children}
    </div>
  );
}
