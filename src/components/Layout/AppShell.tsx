import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-primary">
      <Sidebar />
      <Header />
      <main className="ml-16 pt-16 min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
}
