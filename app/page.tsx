import Link from "next/link";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f7fb] text-slate-900">
      <section className="relative overflow-hidden">
        <div className="absolute -top-24 -right-32 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-300/50 to-blue-200/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-purple-200/40 to-amber-200/40 blur-3xl" />

        <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-16">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/70 px-6 py-3 text-sm font-semibold tracking-[0.2em] text-slate-600 shadow-sm">
            <span>Focus Smarter,</span>
            <span>Study Harder,</span>
            <span>Achieve Better.</span>
          </div>

          <h1 className={`${spaceGrotesk.className} text-center text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl`}>
            A calmer way to plan, focus, and finish your week
          </h1>
          <p className="mt-5 max-w-2xl text-center text-lg text-slate-600">
            HelpImTooLazy turns scattered tasks into a focused daily plan. Capture your ideas, schedule your energy, and build momentum with gentle structure.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="rounded-full bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-transform hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>

          <div className="mt-12 grid w-full grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                title: "Intentional planning",
                description: "Shape your week with soft deadlines and a single daily focus.",
              },
              {
                title: "Adaptive schedules",
                description: "Let the plan flex when life changes without losing progress.",
              },
              {
                title: "Momentum tracking",
                description: "See streaks, wins, and time reclaimed at a glance.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm"
              >
                <h3 className={`${spaceGrotesk.className} text-lg font-semibold`}>{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}