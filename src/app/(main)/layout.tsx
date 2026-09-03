import Navbar from '@/components/layout/Navbar';
import AuthGuard from '@/components/AuthGuard';

/**
 * @fileOverview Main Route Group Layout.
 * Wraps all dashboard and utility routes with the AuthGuard and Navbar.
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <Navbar />
      {children}
    </AuthGuard>
  );
}
