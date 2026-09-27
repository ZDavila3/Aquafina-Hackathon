import { useEffect, useRef, useState } from "react";

const MAX_DEPTH = 10935;

const SECTIONS = [
  { id: "s-hero", label: "Surface" },
  { id: "s-who", label: "The team" },
  { id: "s-what", label: "The idea" },
  { id: "s-why", label: "The stakes" },
];

// Same color/light calculation used by the Home page
function lightRemaining(depth) {
  const t = Math.log10(depth + 1) / Math.log10(MAX_DEPTH + 1);
  return Math.pow(1 - t, 1.8);
}

export function About() {
  const [active, setActive] = useState("s-hero");
  const [depth, setDepth] = useState(0);
  const refs = useRef({});

  // ----------------------------------------
  // Track scroll depth
  // ----------------------------------------
  useEffect(() => {
    let frame = 0;

    const updateDepth = () => {
      frame = 0;

      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;

      if (maxScroll <= 0) {
        setDepth(0);
        return;
      }

      const progress = Math.min(
        Math.max(window.scrollY / maxScroll, 0),
        1
      );

      setDepth(progress * MAX_DEPTH);
    };

    const scheduleUpdate = () => {
      if (!frame) {
        frame = requestAnimationFrame(updateDepth);
      }
    };

    updateDepth();

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  // ----------------------------------------
  // Track which section is currently visible
  // ----------------------------------------
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top
          );

        if (visibleSections.length > 0) {
          setActive(visibleSections[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0,
      }
    );

    SECTIONS.forEach(({ id }) => {
      const el = refs.current[id];

      if (el) {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  const setRef = (id) => (el) => {
    refs.current[id] = el;
  };

  // ----------------------------------------
  // SAME color calculation as Home page
  // ----------------------------------------
  const light = lightRemaining(depth) * 100;

  const above = `color-mix(
    in oklch,
    #3e8797 ${Math.min(light * 1.6, 100)}%,
    #0d1b2a
  )`;

  const base = `color-mix(
    in oklch,
    #3e8797 ${light}%,
    #0d1b2a
  )`;

  const aboutBackground = `linear-gradient(
    to bottom,
    ${above},
    ${base} 70%
  )`;

  return (
    <>
      <style>{`
        :root {
          --navy: #0d1b2a;
          --teal-mid: #2c6a80;
          --cyan: #7be0d6;
          --cyan-soft: rgba(123,224,214,0.14);
          --ink: #eaf3f2;
          --ink-dim: #a9c3c2;
          --line: rgba(234,243,242,0.22);
        }

        .io-about * {
          box-sizing: border-box;
        }

        /* ----------------------------------
           MAIN ABOUT BACKGROUND
           Now changes as you scroll
        ---------------------------------- */
        .io-about {
          margin: 0;
          color: var(--ink);
          font-family: 'JetBrains Mono', monospace;

          padding-top: env(safe-area-inset-top, 0px);
          padding-bottom: env(safe-area-inset-bottom, 0px);

          overflow-x: hidden;
          position: relative;
          min-height: 100vh;

          background: ${aboutBackground};
          transition: background 0.15s linear;
        }

        .io-about h1,
        .io-about h2 {
          font-family: 'Playfair Display', serif;
          font-weight: 500;
          margin: 0;
        }

        .io-about a {
          color: inherit;
        }

        /* ----------------------------------
           NAV
        ---------------------------------- */
        .io-nav {
          position: sticky;
          top: 0;
          z-index: 20;

          background: var(--navy);

          padding: 18px 0;

          display: flex;
          justify-content: center;
          gap: 14px;

          border-bottom: 1px solid rgba(234,243,242,0.08);
        }

        .io-nav a {
          padding: 10px 26px;

          border: 1px solid var(--line);
          border-radius: 999px;

          font-size: 14px;
          letter-spacing: .03em;

          text-decoration: none;
          color: var(--ink-dim);

          transition:
            color .3s ease,
            border-color .3s ease,
            background .3s ease;
        }

        .io-nav a.active {
          color: var(--cyan);
          border-color: var(--cyan);
        }

        /* ----------------------------------
           GLOW
        ---------------------------------- */
        .io-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          z-index: 0;
        }

        /* ----------------------------------
           PAGE
        ---------------------------------- */
        .io-page {
          position: relative;

          display: grid;
          grid-template-columns: 1fr 150px;

          max-width: 1160px;
          margin: 0 auto;
        }

        .io-wrap {
          max-width: 720px;

          padding: 0 40px;

          position: relative;
          z-index: 1;
        }

        /* ----------------------------------
           RIGHT SIDE RAIL
        ---------------------------------- */
        .io-rail {
          position: fixed;

          top: 120px;
          right: max(40px, calc((100vw - 1160px) / 2));

          z-index: 50;

          height: fit-content;

          padding: 0 30px 0 0;

          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .io-rail .track {
          position: relative;

          border-right: 1px solid var(--line);

          padding-right: 22px;

          display: flex;
          flex-direction: column;

          gap: 56px;
        }

        .io-rail .stop {
          position: relative;

          text-align: right;

          font-size: 12px;

          color: var(--ink-dim);

          letter-spacing: .02em;

          transition: color .3s;
        }

        .io-rail .stop::after {
          content: '';

          position: absolute;

          right: -27px;
          top: 2px;

          width: 8px;
          height: 8px;

          border-radius: 50%;

          background: var(--line);

          transition:
            background .3s,
            box-shadow .3s;
        }

        .io-rail .stop.on {
          color: var(--cyan);
        }

        .io-rail .stop.on::after {
          background: var(--cyan);

          box-shadow:
            0 0 10px var(--cyan);
        }

        /* ----------------------------------
           HERO
        ---------------------------------- */
        .io-hero {
          padding: 100px 0 74px;

          position: relative;
        }

        .io-sparkles {
          display: flex;

          gap: 14px;

          align-items: center;

          margin-bottom: 28px;

          color: var(--cyan);

          opacity: .85;
        }

        .io-eyebrow {
          font-size: 13px;

          color: var(--ink-dim);

          letter-spacing: .05em;

          margin-bottom: 22px;
        }

        .io-eyebrow .dot {
          color: var(--cyan);
        }

        .io-hero h1 {
          font-size: 60px;

          line-height: 1.05;

          max-width: 12ch;
        }

        .io-hero .sub {
          margin-top: 24px;

          max-width: 52ch;

          font-size: 16.5px;

          line-height: 1.75;

          color: var(--ink-dim);
        }

        /* ----------------------------------
           SECTIONS
        ---------------------------------- */
        .io-section {
          padding: 70px 0;

          border-top: 1px solid var(--line);
        }

        .io-section .kicker {
          font-size: 13px;

          color: var(--cyan);

          margin-bottom: 14px;
        }

        .io-section h2 {
          font-size: 34px;

          margin-bottom: 22px;

          max-width: 18ch;
        }

        .io-section p {
          font-size: 15.5px;

          line-height: 1.8;

          color: var(--ink-dim);

          max-width: 58ch;

          margin: 0 0 18px;
        }

        /* ----------------------------------
           FEATURE CARDS
        ---------------------------------- */
        .io-grid {
          display: grid;

          grid-template-columns: 1fr 1fr;

          gap: 20px;

          margin-top: 32px;
        }

        .io-card {
          border: 1px solid var(--line);

          border-radius: 16px;

          padding: 26px;

          background: rgba(13,27,42,0.28);

          position: relative;

          overflow: hidden;
        }

        .io-card::before {
          content: '';

          position: absolute;

          inset: 0;

          background:
            radial-gradient(
              120px 120px at 90% -10%,
              var(--cyan-soft),
              transparent
            );
        }

        .io-card .icon {
          width: 30px;
          height: 30px;

          color: var(--cyan);

          margin-bottom: 16px;

          position: relative;
        }

        .io-card .label {
          font-size: 12px;

          color: var(--cyan);

          margin-bottom: 10px;

          letter-spacing: .03em;

          position: relative;
        }

        .io-card p {
          margin: 0;

          font-size: 14.5px;

          position: relative;
        }

        /* ----------------------------------
           STATS
        ---------------------------------- */
        .io-stats {
          display: grid;

          grid-template-columns: repeat(3, 1fr);

          gap: 16px;

          margin-top: 36px;
        }

        .io-stat {
          border: 1px solid var(--line);

          border-radius: 14px;

          padding: 22px 20px;

          background: rgba(13,27,42,0.2);
        }

        .io-stat b {
          display: block;

          font-family: 'Playfair Display', serif;

          font-size: 32px;

          color: var(--cyan);

          font-weight: 500;

          line-height: 1.1;
        }

        .io-stat span {
          font-size: 12px;

          color: var(--ink-dim);

          display: block;

          margin-top: 8px;
        }

        /* ----------------------------------
           CTA
        ---------------------------------- */
        .io-cta {
          display: inline-flex;

          align-items: center;

          gap: 10px;

          margin-top: 28px;

          padding: 15px 30px;

          border: 1px solid var(--cyan);

          border-radius: 999px;

          color: var(--navy);

          background: var(--cyan);

          text-decoration: none;

          font-size: 14px;

          font-weight: 500;

          box-shadow:
            0 0 30px rgba(123,224,214,0.35);
        }

        /* ----------------------------------
           FOOTER
        ---------------------------------- */
        .io-footer {
          padding: 60px 0 90px;

          text-align: center;

          color: var(--ink-dim);

          font-size: 13px;
        }

        /* ----------------------------------
           RESPONSIVE
        ---------------------------------- */
        @media(max-width:900px) {
          .io-page {
            grid-template-columns: 1fr;
          }

          .io-rail {
            display: none;
          }
        }

        @media(max-width:640px) {
          .io-wrap {
            padding: 0 22px;
          }

          .io-hero h1 {
            font-size: 40px;
          }

          .io-grid,
          .io-stats {
            grid-template-columns: 1fr;
          }

          .io-nav {
            flex-wrap: wrap;

            padding: 14px;
          }
        }
      `}</style>

      <div className="io-about">

        <nav className="io-nav">
          <a href="/">Home</a>

          <a href="/about" className="active">
            About
          </a>

          <a href="/scan">
            Scan
          </a>
        </nav>

        {/* Decorative glow */}
        <div
          className="io-glow"
          style={{
            width: 520,
            height: 520,
            background: "#7be0d6",
            top: 60,
            left: -180,
            opacity: 0.12,
          }}
        />

        <div
          className="io-glow"
          style={{
            width: 420,
            height: 420,
            background: "#3e8797",
            top: 900,
            right: -140,
            opacity: 0.15,
          }}
        />

        <div className="io-page">

          <div className="io-wrap">

            {/* =========================
                HERO
            ========================= */}
            <header
              className="io-hero"
              id="s-hero"
              ref={setRef("s-hero")}
            >
              <div
                className="io-sparkles"
                aria-hidden="true"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z"
                    fill="currentColor"
                  />
                </svg>

                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z"
                    fill="currentColor"
                    opacity=".6"
                  />
                </svg>
              </div>

              <div className="io-eyebrow">
                ABOUT <span className="dot">·</span> SURFACE TO SEAFLOOR
              </div>

              <h1>
                One scroll, two problems
              </h1>

              <p className="sub">
              The ocean is more than a surface. Beneath the waves is a layered world shaped by pressure, darkness, temperature, and an extraordinary diversity of life.

              IdentiOcean was created to make that hidden world easier to understand — and to connect what happens on land to what happens beneath the surface.

              Explore the ocean layer by layer, meet the creatures that survive its most extreme environments, and discover how something as ordinary as a piece of trash can become part of that ecosystem.
              </p>
            </header>

            {/* =========================
                TEAM
            ========================= */}
            <section
              className="io-section"
              id="s-who"
              ref={setRef("s-who")}
            >
              <div className="kicker">
                THE TEAM
              </div>

              <h2>
              Our Mission
              </h2>

              <p>
              We’re a team of students who care about the environment and want to see positive change. We created IdentiOcean because we wanted to find a way to help people better understand our oceans and the impact that everyday waste can have on them.
              </p>

              <p>
              We wanted to create something that was not only educational, but also gave people a simple way to take action. IdentiOcean is our small initiative to help people learn about the ocean, understand what’s at stake, and make more environmentally conscious choices.
              </p>
            </section>

            {/* =========================
                IDEA
            ========================= */}
            <section
              className="io-section"
              id="s-what"
              ref={setRef("s-what")}
            >
              <div className="kicker">
                THE IDEA
              </div>

              <h2>
                Two features, one point
              </h2>

              <div className="io-grid">

                <div className="io-card">
                  <svg
                    className="icon"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M12 2 L14 9 L21 11 L14 13 L12 20 L10 13 L3 11 L10 9 Z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <div className="label">
                    THE DESCENT
                  </div>

                  <p>
                  Descend from the sunlit waters into the mysterious Challenger Deep, where every layer reveals life built to survive the extreme. From sea turtles gliding near the surface to tiny amphipods thriving 10,935 m below, discover a world that gets stranger the deeper you go.
                  </p>
                </div>

                <div className="io-card">
                  <svg
                    className="icon"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <rect
                      x="4"
                      y="4"
                      width="16"
                      height="16"
                      rx="3"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />

                    <path
                      d="M8 12 L11 15 L16 9"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <div className="label">
                    THE SCAN
                  </div>

                  <p>
                  See trash. Scan it. Make a difference.
                  Point your camera at a piece of waste and let us identify it. We’ll show you how to dispose of it properly—and what could happen if it finds its way into the ocean.
                  </p>
                </div>

              </div>

              <p style={{ marginTop: 32 }}>
                A snailfish living under 800 atmospheres has no way
                of flagging a bottle cap that just sank into its
                water column. Scan exists to catch it before it gets
                that far.
              </p>
            </section>

            {/* =========================
                STAKES
            ========================= */}
            <section
              className="io-section"
              id="s-why"
              ref={setRef("s-why")}
            >
              <div className="kicker">
                THE STAKES
              </div>

              <h2>
                The backstory
              </h2>

              <p>
                Most plastic that enters the ocean doesn't stay at
                the surface. It drifts down through every zone on
                this site, breaking apart as it goes — by the time it
                reaches the seafloor, it isn't a bottle anymore. It's
                microplastic, sitting next to a sea pig.
              </p>

              <div className="io-stats">

                <div className="io-stat">
                  <b>&lt;25%</b>
                  <span>
                    of the seafloor mapped in detail
                  </span>
                </div>

                <div className="io-stat">
                  <b>1,088 atm</b>
                  <span>
                    pressure at Challenger Deep
                  </span>
                </div>

                <div className="io-stat">
                  <b>1 scan</b>
                  <span>
                    is the whole ask
                  </span>
                </div>

              </div>

              <a
                className="io-cta"
                href="/scan"
              >
                Try the Scan feature →
              </a>
            </section>

            <footer className="io-footer">
              Built in a hackathon, for the ocean. 𓇼
            </footer>

          </div>

          {/* RIGHT RAIL */}
          <div className="io-rail">
            <div className="track">

              {SECTIONS.map(({ id, label }) => (
                <div
                  key={id}
                  className={`stop${
                    active === id ? " on" : ""
                  }`}
                >
                  {label}
                </div>
              ))}

            </div>
          </div>

        </div>
      </div>
    </>
  );
}