export default function ActivitiesLoading() {
  return (
    <main className="p-6 md:p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-40 rounded bg-muted" />
        <div className="h-12 rounded bg-muted" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div className="h-40 rounded-xl bg-muted" />
          <div className="h-40 rounded-xl bg-muted" />
          <div className="h-40 rounded-xl bg-muted" />
          <div className="h-40 rounded-xl bg-muted" />
        </div>
      </div>
    </main>
  );
}
