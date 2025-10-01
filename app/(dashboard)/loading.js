export default function Loading() {
  return (
    <main className="min-h-[90svh] grid place-items-center">
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className="opacity-0 animate-[containerFade_380ms_ease-out_forwards]"
      >
        <div className="relative leading-none select-none">
          <span className="block text-center font-medium text-foreground/15 text-3xl md:text-5xl">
            Reliant-CRM
          </span>

          <span className="absolute inset-0 block text-center font-medium text-gray-500 text-3xl md:text-5xl animate-[reveal_2200ms_cubic-bezier(0.22,1,0.36,1)_infinite]">
            Reliant-CRM
          </span>

          <span
            className="absolute inset-0 block text-center font-medium text-transparent text-3xl md:text-5xl bg-[linear-gradient(75deg,transparent_0%,rgba(255,255,255,0)_35%,rgba(255,255,255,0.4)_50%,rgba(255,255,255,0)_70%,transparent_100%)] bg-[length:200%_100%] bg-no-repeat animate-[sheen_2000ms_linear_infinite] pointer-events-none"
            aria-hidden="true"
            style={{ WebkitBackgroundClip: "text", backgroundClip: "text" }}
          >
            Reliant-CRM
          </span>
        </div>

        <span className="sr-only">Loading Reliant-CRM</span>
      </div>

      <style>{`
        /* entrance fade to keep things elegant */
        @keyframes containerFade {
          from { opacity: 0; transform: translateY(2px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* reveal the text by animating a width-like clip from left to right, then reset */
        @keyframes reveal {
          0%   { clip-path: inset(0 100% 0 0); opacity: 1; }
          70%  { clip-path: inset(0   0% 0 0); opacity: 1; }
          85%  { clip-path: inset(0   0% 0 0); opacity: 0.9; }
          90%  { clip-path: inset(0 100% 0 0); opacity: 0.9; }
          100% { clip-path: inset(0 100% 0 0); opacity: 1; }
        }

        /* subtle sheen that sweeps across the letters */
        @keyframes sheen {
          0%   { background-position: -120% 0; }
          90% { background-position: 70% 0; }
          100% { background-position: 120% 0; }
        }
      `}</style>
    </main>
  )
}
