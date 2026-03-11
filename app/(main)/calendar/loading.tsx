export default function CalendarLoading() {
  return (
    <main className="p-6 md:p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-muted" />
        <div className="h-10 w-full md:w-80 rounded bg-muted" />
        <div className="h-[420px] rounded-xl bg-muted" />
      </div>
    </main>
  );
}
