export default function LoginLoading() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-pulse rounded-xl border bg-white p-6 shadow-sm">
        <div className="h-6 w-40 rounded bg-gray-200 mb-6" />
        <div className="space-y-4">
          <div className="h-10 rounded bg-gray-200" />
          <div className="h-10 rounded bg-gray-200" />
          <div className="h-10 rounded bg-gray-200" />
        </div>
      </div>
    </main>
  );
}
