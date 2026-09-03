
/**
 * @fileOverview Main Route Group Layout (Inert).
 * This layout is now just a pass-through as logic has been moved to the root layout 
 * to resolve parallel route conflicts and bundler manifest errors.
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
