import { AdminHeader } from '@/components/AdminHeader';

export const metadata = {
  title: 'Admin — Bhagavad Gita Guide',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a1a3a] text-white">
      <AdminHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  );
}
