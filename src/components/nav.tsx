"use client";

const NAV_LINKS = [
  { num: "01", label: "how it works", href: "#how-it-works" },
  { num: "02", label: "agents", href: "#agents" },
  { num: "03", label: "security & testing", href: "#security-testing" },
  { num: "04", label: "features", href: "#features" },
  // { num: "05", label: "pricing", href: "#pricing" },
];

export function Nav({ activePath }: { activePath?: string } = {}) {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-bg/82 backdrop-blur-[10px]">
      <div className="mx-auto flex max-w-[1440px] items-center gap-8 px-6 md:px-12 py-[18px]">
        <a href="#top" className="flex items-center gap-2.5">
          <div className="relative h-[22px] w-[22px] bg-lime">
            <div className="absolute inset-1 border-[1.5px] border-bg" />
          </div>
          <span className="text-[15px] font-bold tracking-[-0.02em]">
            INFINIVIEW<span className="text-lime">/</span>
            <span className="ml-1.5 font-mono text-[11.5px] font-normal text-text-muted hidden sm:inline">
              adversary-mode
            </span>
          </span>
        </a>

        <div className="flex-1" />

        <div className="hidden lg:flex items-center gap-6 font-mono text-xs text-text-secondary">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="transition-colors hover:text-lime"
            >
              <span className="text-text-muted">[{link.num}]</span> {link.label}
            </a>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            const form = document.getElementById("waitlist");
            if (!form) return;
            form.scrollIntoView({ behavior: "smooth", block: "center" });
            const input = form.querySelector<HTMLInputElement>("input[type='email']");
            if (input) setTimeout(() => input.focus(), 600);
          }}
          className="btn-lime font-mono text-xs px-4 py-2.5 tracking-[0.02em]"
        >
          JOIN WAITLIST →
        </button>
      </div>
    </nav>
  );
}
