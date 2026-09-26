import { useEffect, useRef, useState } from 'react'
import './App.css'

const MAX_DEPTH = 10935

const zones = [
  {
    id: 'sunlight',
    name: 'Sunlight Zone',
    scientificName: 'Epipelagic',
    start: 0,
    end: 200,
    temperature: 'up to 30°C',
    light: 'Enough for photosynthesis',
    summary:
      'The thin, bright skin of the ocean. Nearly all marine plant life grows here, feeding everything below it.',
    creatures: [
      {
        slug: 'green-sea-turtle',
        name: 'Green Sea Turtle',
        scientificName: 'Chelonia mydas',
        depthRange: [0, 40],
        size: 'up to 1.5 m',
        bioluminescent: false,
        description:
          'Named not for its shell but for the green fat beneath it, tinted by a lifelong diet of seagrass and algae. Resting turtles can hold their breath for hours.',
        image: '/creatures/green-sea-turtle.png',
      },
      {
        slug: 'ocean-sunfish',
        name: 'Ocean Sunfish',
        scientificName: 'Mola mola',
        depthRange: [0, 600],
        size: 'up to 3.3 m',
        bioluminescent: false,
        description:
          'The heaviest bony fish on Earth. After deep, cold dives to hunt jellyfish, it floats on its side at the surface to warm back up.',
        image: '/creatures/ocean-sunfish.png',
      },
    ],
  },
  {
    id: 'twilight',
    name: 'Twilight Zone',
    scientificName: 'Mesopelagic',
    start: 200,
    end: 1000,
    temperature: '4–20°C',
    light: 'Faint blue, fading fast',
    summary:
      'Sunlight thins to a dim blue glow. Many animals here rise to the surface every night to feed — the largest migration on the planet.',
    creatures: [
      {
        slug: 'barreleye',
        name: 'Barreleye',
        scientificName: 'Macropinna microstoma',
        depthRange: [600, 800],
        size: '~15 cm',
        bioluminescent: false,
        description:
          'Its head is a transparent, fluid-filled dome. Inside, tubular green eyes rotate upward to spot silhouettes above, then forward to line up a meal.',
        image: '/creatures/barreleye.png',
      },
      {
        slug: 'vampire-squid',
        name: 'Vampire Squid',
        scientificName: 'Vampyroteuthis infernalis',
        depthRange: [600, 900],
        size: '~30 cm',
        bioluminescent: true,
        description:
          'Neither vampire nor squid. It drifts in oxygen-starved water eating marine snow, and when threatened releases a cloud of glowing mucus instead of ink.',
        image: '/creatures/vampire-squid.png',
      },
    ],
  },
  {
    id: 'midnight',
    name: 'Midnight Zone',
    scientificName: 'Bathypelagic',
    start: 1000,
    end: 4000,
    temperature: '~4°C',
    light: 'None — only bioluminescence',
    summary:
      'No sunlight has ever reached this water. The only light is made by living things, used to lure, confuse, and find a mate.',
    creatures: [
      {
        slug: 'anglerfish',
        name: 'Humpback Anglerfish',
        scientificName: 'Melanocetus johnsonii',
        depthRange: [1000, 2000],
        size: 'females ~18 cm',
        bioluminescent: true,
        description:
          'Females dangle a lure packed with glowing symbiotic bacteria in front of a mouth full of backward-pointing teeth. Anything that investigates rarely leaves.',
        image: '/creatures/anglerfish.png',
      },
      {
        slug: 'gulper-eel',
        name: 'Gulper Eel',
        scientificName: 'Eurypharynx pelecanoides',
        depthRange: [500, 3000],
        size: 'up to 1 m',
        bioluminescent: true,
        description:
          'A loosely hinged jaw lets its mouth balloon far larger than its body. The tip of its whip-like tail glows pink, likely to attract prey.',
        image: '/creatures/gulper-eel.png',
      },
    ],
  },
  {
    id: 'abyssal',
    name: 'Abyssal Zone',
    scientificName: 'Abyssopelagic',
    start: 4000,
    end: 6000,
    temperature: '2–3°C',
    light: 'None',
    summary:
      'Vast, cold plains of fine sediment cover most of the ocean floor. Life here waits on food falling from far above.',
    creatures: [
      {
        slug: 'sea-pig',
        name: 'Sea Pig',
        scientificName: 'Scotoplanes globosa',
        depthRange: [1000, 6000],
        size: 'up to 15 cm',
        bioluminescent: false,
        description:
          'A sea cucumber that walks on inflated tube feet, often in herds, vacuuming organic ooze from the seafloor mud.',
        image: '/creatures/sea-pig.png',
      },
      {
        slug: 'dumbo-octopus',
        name: 'Dumbo Octopus',
        scientificName: 'Grimpoteuthis',
        depthRange: [1000, 7000],
        size: '20–30 cm',
        bioluminescent: false,
        description:
          'The deepest-living octopus known. It hovers above the floor by flapping ear-like fins and swallows its prey whole.',
        image: '/creatures/dumbo-octopus.png',
      },
    ],
  },
  {
    id: 'hadal',
    name: 'Hadal Zone',
    scientificName: 'Hadalpelagic',
    start: 6000,
    end: MAX_DEPTH,
    temperature: '1–4°C',
    light: 'None',
    summary:
      'Named for Hades. These trenches are deeper than Everest is tall, and the pressure would crush most life in an instant.',
    creatures: [
      {
        slug: 'mariana-snailfish',
        name: 'Mariana Snailfish',
        scientificName: 'Pseudoliparis swirei',
        depthRange: [6900, 8000],
        size: '~30 cm',
        bioluminescent: false,
        description:
          'Among the deepest fish ever recorded. A soft skull and gelatinous, scaleless body let it thrive under more than 800 atmospheres.',
        image: '/creatures/mariana-snailfish.png',
      },
      {
        slug: 'hadal-amphipod',
        name: 'Hadal Amphipod',
        scientificName: 'Hirondellea gigas',
        depthRange: [6000, 10900],
        size: 'a few cm',
        bioluminescent: false,
        description:
          'Scavenges the very bottom of the Challenger Deep. It produces enzymes that break down wood and plant debris sinking from the surface.',
        image: '/creatures/hadal-amphipod.png',
      },
    ],
  },
]

const pressureAt = (depth) => 1 + depth / 10.06
const formatMeters = (value) => `${Math.round(value).toLocaleString('en-US')} m`

// Square-root scale so the thin upper zones stay readable on the gauge.
const gaugePosition = (depth) => Math.sqrt(depth / MAX_DEPTH) * 100

function lightRemaining(depth) {
  const t = Math.log10(depth + 1) / Math.log10(MAX_DEPTH + 1)
  return Math.pow(1 - t, 1.8)
}

function measureDepth() {
  const sections = document.querySelectorAll('[data-depth-start]')
  const probe = window.scrollY + window.innerHeight / 2
  let depth = 0

  for (const section of sections) {
    const rect = section.getBoundingClientRect()
    const top = rect.top + window.scrollY
    if (probe < top) break
    const start = Number(section.dataset.depthStart)
    const end = Number(section.dataset.depthEnd)
    const progress = Math.min(Math.max((probe - top) / rect.height, 0), 1)
    depth = start + progress * (end - start)
  }

  return Math.min(depth, MAX_DEPTH)
}

function useDiveDepth() {
  const [depth, setDepth] = useState(0)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      setDepth(measureDepth())
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  return depth
}

function ArrowIcon({ direction }) {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={direction === 'up' ? { transform: 'rotate(180deg)' } : undefined}
    >
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  )
}

function WaterBackdrop({ depth }) {
  const light = lightRemaining(depth) * 100
  const base = `color-mix(in oklch, var(--surface) ${light}%, var(--background))`
  const above = `color-mix(in oklch, var(--surface) ${Math.min(light * 1.6, 100)}%, var(--background))`

  return (
    <div
      aria-hidden="true"
      className="water-backdrop"
      style={{ background: `linear-gradient(to bottom, ${above}, ${base} 70%)` }}
    />
  )
}

function DepthGauge({ depth, zone }) {
  const marker = gaugePosition(depth)

  return (
    <>
      <aside aria-label="Dive telemetry" className="gauge">
        <div className="gauge-readout">
          <span className="eyebrow muted">Depth</span>
          <span className="gauge-depth">{formatMeters(depth)}</span>
          <span className="gauge-pressure">
            {Math.round(pressureAt(depth)).toLocaleString('en-US')} atm
          </span>
        </div>

        <div className="gauge-track" aria-hidden="true">
          <div className="gauge-line" />
          <div className="gauge-line gauge-line--filled" style={{ height: `${marker}%` }} />
          {zones.map((z) => (
            <div key={z.id} className="gauge-tick" style={{ top: `${gaugePosition(z.start)}%` }}>
              <span className={z.id === zone.id ? 'gauge-label is-active' : 'gauge-label'}>
                {z.name.replace(' Zone', '')}
              </span>
              <span className="gauge-tick-mark" />
            </div>
          ))}
          <div className="gauge-marker" style={{ top: `${marker}%` }} />
          <span className="gauge-max">{formatMeters(MAX_DEPTH)}</span>
        </div>
      </aside>

      <div aria-label="Dive telemetry" role="region" className="mobile-gauge">
        <div className="mobile-gauge-row">
          <span className="muted">{zone.name}</span>
          <span className="mobile-gauge-depth">{formatMeters(depth)}</span>
        </div>
        <div className="mobile-gauge-bar" style={{ width: `${(depth / MAX_DEPTH) * 100}%` }} />
      </div>
    </>
  )
}

function CreatureCard({ creature, offset }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const [min, max] = creature.depthRange
  const classes = ['card', visible && 'is-visible', offset && 'card--offset'].filter(Boolean).join(' ')

  return (
    <article ref={ref} className={classes}>
      <div className="card-media">
        <img
          src={creature.image}
          alt={`${creature.name} in its natural habitat`}
          loading="lazy"
          decoding="async"
        />
        {creature.bioluminescent && <span className="badge">Bioluminescent</span>}
      </div>

      <div className="card-body">
        <div className="card-heading">
          <h3 className="card-title">{creature.name}</h3>
          <p className="scientific">{creature.scientificName}</p>
        </div>
        <p className="card-description">{creature.description}</p>
        <dl className="card-stats">
          <div>
            <dt>Found at</dt>
            <dd className="accent">
              {min.toLocaleString('en-US')}–{formatMeters(max)}
            </dd>
          </div>
          <div>
            <dt>Size</dt>
            <dd>{creature.size}</dd>
          </div>
        </dl>
      </div>
    </article>
  )
}

function ZoneSection({ zone }) {
  return (
    <section
      id={zone.id}
      aria-labelledby={`${zone.id}-title`}
      data-depth-start={zone.start}
      data-depth-end={zone.end}
      className="zone"
    >
      <header className="zone-header">
        <p className="eyebrow accent">
          {formatMeters(zone.start)} — {formatMeters(zone.end)}
        </p>
        <h2 id={`${zone.id}-title`} className="zone-title">
          {zone.name}
        </h2>
        <p className="scientific scientific--lg">{zone.scientificName}</p>
        <p className="body-text">{zone.summary}</p>
        <dl className="zone-facts">
          <div>
            <dt>Light</dt>
            <dd>{zone.light}</dd>
          </div>
          <div>
            <dt>Temp</dt>
            <dd>{zone.temperature}</dd>
          </div>
        </dl>
      </header>

      <div className="card-grid">
        {zone.creatures.map((creature, index) => (
          <CreatureCard key={creature.slug} creature={creature} offset={index % 2 === 1} />
        ))}
      </div>
    </section>
  )
}

function Surface() {
  return (
    <section id="surface" data-depth-start={0} data-depth-end={0} className="hero">
      <p className="eyebrow accent">Sea level · 0 m</p>
      <h1 className="hero-title">Descent</h1>
      <p className="hero-lead">
        {`Scroll to dive ${formatMeters(MAX_DEPTH)} to the bottom of the Challenger Deep, and meet the creatures that live in each layer of the dark.`}
      </p>
      <a href="#sunlight" className="button button--outline">
        Begin descent
        <ArrowIcon direction="down" />
      </a>
    </section>
  )
}

function SeaFloor() {
  return (
    <section
      id="floor"
      aria-labelledby="floor-title"
      data-depth-start={MAX_DEPTH}
      data-depth-end={MAX_DEPTH}
      className="floor"
    >
      <p className="eyebrow accent">
        {formatMeters(MAX_DEPTH)} · ≈{Math.round(pressureAt(MAX_DEPTH)).toLocaleString('en-US')} atm
      </p>
      <h2 id="floor-title" className="floor-title">
        {"You've reached the Challenger Deep."}
      </h2>
      <p className="body-text">
        The deepest known point on Earth. Fewer people have stood here than on the Moon — yet even
        at the bottom, something is alive.
      </p>
      <a href="#surface" className="button button--solid">
        Return to surface
        <ArrowIcon direction="up" />
      </a>
    </section>
  )
}

export default function App() {
  const depth = useDiveDepth()
  const currentZone = [...zones].reverse().find((zone) => depth >= zone.start) ?? zones[0]

  return (
    <>
      <WaterBackdrop depth={depth} />
      <DepthGauge depth={depth} zone={currentZone} />
      <main className="dive">
        <Surface />
        {zones.map((zone) => (
          <ZoneSection key={zone.id} zone={zone} />
        ))}
        <SeaFloor />
      </main>
    </>
  )
}
