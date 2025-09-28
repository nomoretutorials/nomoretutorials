export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-sidebar h-lvh">
      <main className="h-full">{children}</main>
    </div>
  );
}
