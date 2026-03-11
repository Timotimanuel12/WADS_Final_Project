export default function DashboardLoading() {
  return (
    <main className="p-6 md:p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-56 rounded bg-muted" />
        <div className="h-32 rounded-xl bg-muted" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-20 rounded bg-muted" />
          <div className="h-20 rounded bg-muted" />
          <div className="h-20 rounded bg-muted" />
          <div className="h-20 rounded bg-muted" />
        </div>
      </div>
    </main>
  );
}
