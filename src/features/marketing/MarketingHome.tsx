'use client';

import Image from 'next/image';
import Link from 'next/link';
import { routes } from '@/constants/routes';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  BatteryCharging,
  Bot,
  Building2,
  Check,
  CircuitBoard,
  Download,
  Gauge,
  Headphones,
  Menu,
  PanelsTopLeft,
  ShieldCheck,
  SunMedium,
  Wrench,
  X,
  Zap
} from 'lucide-react';

const SolarEcosystemFilm = dynamic(
  () => import('./SolarEcosystemFilm').then((module) => module.SolarEcosystemFilm),
  { ssr: false }
);

const scenes = [
  {
    id: 'home',
    label: '01 / YOUR ENERGY HOME',
    title: 'A Smarter Home Starts Here',
    body: 'See one complete solar-ready home before exploring how every part of the system works together.',
    Icon: Building2
  },
  {
    id: 'panels',
    label: '02 / ROOFTOP SOLAR',
    title: 'Find the Right Solar Size',
    body: 'Plan around your appliances, roof space and actual energy needs.',
    Icon: PanelsTopLeft
  },
  {
    id: 'inverter',
    label: '03 / SMART INVERTER',
    title: 'Choose Trusted Products',
    body: 'Compare panels, inverters and batteries from established solar brands.',
    Icon: CircuitBoard
  },
  {
    id: 'battery',
    label: '04 / BATTERY BACKUP',
    title: 'Reliable Backup, Planned Properly',
    body: 'Build backup around the energy you actually need.',
    Icon: BatteryCharging
  },
  {
    id: 'ev',
    label: '05 / CONNECTED HOME',
    title: 'One Smart Energy Ecosystem',
    body: 'Power your home, store energy and prepare for electric mobility.',
    Icon: Zap
  }
] as const;

const sceneImages = [
  {
    src: '/marketing/imagery/kaamasaan-daylight-home.webp',
    alt: 'Complete modern Pakistani solar home with rooftop panels, energy storage and EV charging'
  },
  {
    src: '/marketing/imagery/kaamasaan-rooftop-panels.webp',
    alt: 'Realistic rooftop photovoltaic modules with cell grids, aluminium frames and mounting rails'
  },
  {
    src: '/marketing/imagery/kaamasaan-energy-equipment.webp',
    alt: 'Professional wall-mounted hybrid inverter and modular lithium battery installation'
  },
  {
    src: '/marketing/imagery/kaamasaan-energy-equipment.webp',
    alt: 'Modular lithium battery bank connected to a professional hybrid inverter'
  },
  {
    src: '/marketing/imagery/kaamasaan-daylight-home.webp',
    alt: 'Connected solar home ecosystem with panels, inverter, battery storage and electric vehicle'
  }
] as const;

type HotspotId = Exclude<(typeof scenes)[number]['id'], 'home'>;

const hotspotContent: Record<HotspotId, { title: string; body: string }> = {
  panels: { title: 'Rooftop solar', body: 'A panel plan shaped around your roof, energy goals and selected product wattage.' },
  inverter: { title: 'Smart inverter', body: 'The control centre that converts, monitors and routes solar power throughout your system.' },
  battery: { title: 'Battery backup', body: 'Storage selected around the appliances and hours you actually want to keep running.' },
  ev: { title: 'EV charging', body: 'A future-ready energy path designed to connect solar generation with electric mobility.' }
};

const services = [
  { title: 'Smart Solar System Design', copy: 'Turn real appliance loads and roof details into a practical system starting point.', cta: 'Start designing', href: routes.design(), Icon: Bot, tone: 'gold', span: 'wide' },
  { title: 'Solar Marketplace', copy: 'Explore panels, inverters, batteries and accessories from one considered catalogue.', cta: 'Browse products', href: routes.marketplace(), Icon: PanelsTopLeft, tone: 'image', span: 'tall' },
  { title: 'Professional Installation', copy: 'Move from a digital plan to an on-site professional assessment.', cta: 'Plan installation', href: routes.installationService(), Icon: Building2, tone: 'dark', span: 'standard' },
  { title: 'Preventive Maintenance', copy: 'Keep production healthy with structured care and service visibility.', cta: 'Explore care', href: routes.preventiveMaintenance(), Icon: Gauge, tone: 'ivory', span: 'standard' },
  { title: 'Electrical Services', copy: 'Access diagnostic and electrical support alongside your solar journey.', cta: 'View services', href: routes.electricalServices(), Icon: Wrench, tone: 'dark', span: 'standard' },
  // No EV-charging feature exists in the ported app yet (mobile doesn't have one either) —
  // pointed at the on-page services section rather than inventing a route. Flag for product.
  { title: 'EV Charging Solutions', copy: 'Prepare your property for the next chapter of connected energy.', cta: 'Explore charging', href: '#services', Icon: Zap, tone: 'gold', span: 'wide' }
];

const processSteps = [
  { title: 'Design Your System', copy: 'Shape a system around your home and energy needs.' },
  { title: 'Explore the Marketplace', copy: 'Compare trusted products with consistent details.' },
  { title: 'Book a Professional Survey', copy: 'Bring an expert on site before installation.' },
  { title: 'Track Your Project', copy: 'Follow each milestone from one clear timeline.' }
] as const;

const brandLogos = [
  { name: 'Solis', src: '/marketing/brands/solis.png' },
  { name: 'GoodWe', src: '/marketing/brands/goodwe.svg' },
  { name: 'FOX ESS', src: '/marketing/brands/fox-ess.png' },
  { name: 'LONGi', src: '/marketing/brands/longi.png' },
  { name: 'Jinko Solar', src: '/marketing/brands/jinko.png' },
  { name: 'JA Solar', src: '/marketing/brands/ja-solar.svg' },
  { name: 'Pylontech', src: '/marketing/brands/pylontech.svg' },
  { name: 'Sungrow', src: '/marketing/brands/sungrow.svg' }
];

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';
const lightweightSceneQuery = '(max-width: 760px), (pointer: coarse)';

function subscribeToReducedMotion(callback: () => void) {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

function useHydrationSafeReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false
  );
}

function SectionReveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const reduceMotion = useHydrationSafeReducedMotion();
  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reduceMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

type ActiveSection = 'top' | 'journey' | 'how-it-works' | 'services' | 'app';

const navigationItems = [
  { label: 'Home', href: '#top', section: 'top' },
  // Links to the real, already-ported /how-it-works page (8-step detail with
  // modals) rather than the shallow on-page process section — more substance.
  { label: 'How it works', href: routes.howItWorks(), section: null },
  { label: 'Services', href: '#services', section: 'services' },
  { label: 'Marketplace', href: routes.marketplace(), section: null },
  { label: 'The app', href: '#app', section: 'app' }
] as const;

function Header({ compact, activeSection }: { compact: boolean; activeSection: ActiveSection }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
      if (event.key === 'Tab' && menuOpen && mobileMenuRef.current) {
        const focusable = Array.from(mobileMenuRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    requestAnimationFrame(() => mobileMenuRef.current?.querySelector<HTMLElement>('button')?.focus());
  }, [menuOpen]);

  return (
    <header className={`site-header ${compact ? 'is-compact' : ''} ${menuOpen ? 'menu-is-open' : ''}`}>
      <Link href="#top" className="brand-lockup" aria-label="KaamAsaan home">
        {/* The approved website lockup keeps its intrinsic ratio inside the responsive header. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/marketing/brand/kaamasaan-website-logo.png" width="1200" height="454" alt="KaamAsaan — Pakistan No.1 Smart Solar Marketplace" />
      </Link>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navigationItems.map((item) => {
          const active = item.section === activeSection;
          return <Link key={item.label} href={item.href} className={active ? 'is-active' : undefined} aria-current={active ? 'location' : undefined}>{item.label}</Link>;
        })}
      </nav>
      <Link href={routes.design()} className="nav-cta">Design your system <ArrowRight size={15} /></Link>
      <button
        ref={menuButtonRef}
        type="button"
        className="menu-button"
        onClick={() => setMenuOpen((value) => !value)}
        aria-expanded={menuOpen}
        aria-controls="mobile-navigation"
        aria-label="Toggle navigation"
      >
        {menuOpen ? <X /> : <Menu />}
      </button>
      <AnimatePresence>
        {menuOpen ? (
          <>
            <motion.button type="button" className="mobile-menu-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.nav ref={mobileMenuRef} id="mobile-navigation" className="mobile-menu" aria-label="Mobile navigation" initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 28 }} transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}>
              <div className="mobile-menu-heading"><span>Navigate</span><button type="button" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X size={19} /></button></div>
              {navigationItems.map((item) => {
                const active = item.section === activeSection;
                return <Link key={item.label} href={item.href} className={active ? 'is-active' : undefined} aria-current={active ? 'location' : undefined} onClick={() => setMenuOpen(false)}>{item.label}<ArrowRight size={16} /></Link>;
              })}
              <Link href={routes.design()} className="button button-gold" onClick={() => setMenuOpen(false)}>Design your system <ArrowRight size={16} /></Link>
            </motion.nav>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

export function MarketingHome() {
  const reducedMotion = useHydrationSafeReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const journeyRef = useRef<HTMLElement>(null);
  const sceneProgressRef = useRef(0);
  const sceneCopyRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<HTMLElement>(null);
  const [compactNav, setCompactNav] = useState(false);
  const [activeSection, setActiveSection] = useState<ActiveSection>('top');
  const [activeScene, setActiveScene] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<HotspotId | null>(null);
  const [scenePrepared, setScenePrepared] = useState(false);
  const [sceneInView, setSceneInView] = useState(false);
  const [filmModeResolved, setFilmModeResolved] = useState(false);
  const [useStaticFilm, setUseStaticFilm] = useState(false);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroScale = useTransform(heroProgress, [0, 1], [1, 1.08]);
  const heroOpacity = useTransform(heroProgress, [0, 0.86], [1, 0]);
  const heroY = useTransform(heroProgress, [0, 1], [0, 110]);

  useEffect(() => {
    const device = navigator as Navigator & { deviceMemory?: number };
    const media = window.matchMedia(lightweightSceneQuery);
    const updateFilmMode = () => {
      const lightweight = media.matches
        || (device.hardwareConcurrency ?? 8) <= 4
        || (device.deviceMemory ?? 8) <= 4;
      setUseStaticFilm(lightweight);
      if (lightweight) {
        sceneProgressRef.current = 1;
        setActiveScene(4);
      }
      setFilmModeResolved(true);
    };
    updateFilmMode();
    media.addEventListener('change', updateFilmMode);
    return () => media.removeEventListener('change', updateFilmMode);
  }, []);

  useEffect(() => {
    const section = journeyRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setSceneInView(entry.isIntersecting);
        if (entry.isIntersecting) setScenePrepared(true);
      },
      { rootMargin: '18% 0px' }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setCompactNav(window.scrollY > 48);
      const sectionIds: ActiveSection[] = ['top', 'journey', 'how-it-works', 'services', 'app'];
      let current: ActiveSection = 'top';
      for (const id of sectionIds.slice(1)) {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= window.innerHeight * 0.38) current = id;
      }
      setActiveSection(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      sceneProgressRef.current = 1;
      setActiveScene(4);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      if (journeyRef.current) {
        ScrollTrigger.create({
          trigger: journeyRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.55,
          invalidateOnRefresh: true,
          onUpdate: ({ progress }) => {
            sceneProgressRef.current = progress;
            const nextScene = progress < 0.15 ? 0 : progress < 0.3 ? 1 : progress < 0.45 ? 2 : progress < 0.6 ? 2 : progress < 0.75 ? 3 : 4;
            setActiveScene((current) => current === nextScene ? current : nextScene);
          }
        });
      }
      if (appRef.current) {
        gsap.timeline({
          scrollTrigger: {
            trigger: appRef.current,
            start: 'top 82%',
            end: 'center 42%',
            scrub: 0.7
          }
        })
          .fromTo('.phone-back', { y: 34, rotate: -10, opacity: 0.72 }, { y: 0, rotate: -8, opacity: 0.98, ease: 'none' }, 0)
          .fromTo('.phone-front', { y: 58, rotate: 7 }, { y: 0, rotate: 3, ease: 'none' }, 0);
      }
    });
    return () => context.revert();
  }, [reducedMotion, useStaticFilm]);

  useEffect(() => {
    if (reducedMotion || !sceneCopyRef.current) return;
    gsap.fromTo(sceneCopyRef.current, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.62, ease: 'power3.out', overwrite: true });
  }, [activeScene, reducedMotion]);

  const handleHotspot = useCallback((id: HotspotId) => setActiveHotspot(id), []);
  const activeHotspotContent = activeHotspot ? hotspotContent[activeHotspot] : null;
  const useFilm = filmModeResolved && (scenePrepared || reducedMotion);

  return (
    <main id="top" className="site-shell">
      <Header compact={compactNav} activeSection={activeSection} />

      <section ref={heroRef} className="hero-section">
        <motion.div className="hero-image" style={reducedMotion ? undefined : { scale: heroScale }}>
          <Image src="/marketing/imagery/kaamasaan-daylight-home.webp" alt="Modern Pakistani solar home in bright natural daylight" fill priority sizes="100vw" />
        </motion.div>
        <div className="hero-atmosphere"><div className="cloud cloud-one" /><div className="cloud cloud-two" /><div className="grain" /></div>
        <motion.div className="hero-content" style={reducedMotion ? undefined : { opacity: heroOpacity, y: heroY }} initial={{ opacity: 1 }}>
          <motion.p className="eyebrow hero-eyebrow" initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reducedMotion ? 0 : 0.2 }}><span>Pakistan’s No.1 Smart Solar Marketplace</span></motion.p>
          <motion.h1 initial={{ opacity: 0, y: reducedMotion ? 0 : 34 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reducedMotion ? 0 : 0.34, duration: reducedMotion ? 0 : 0.9 }}>Solar,<br /><span>Made Simple.</span></motion.h1>
          <motion.p className="hero-copy" initial={{ opacity: 0, y: reducedMotion ? 0 : 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reducedMotion ? 0 : 0.5, duration: reducedMotion ? 0 : 0.8 }}>Design, compare and manage your complete solar system—everything in one smart place.</motion.p>
          <motion.div className="hero-actions" initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reducedMotion ? 0 : 0.62 }}>
            <Link href={routes.design()} className="button button-gold">Design My Solar System <ArrowRight size={18} /></Link>
            <Link href={routes.marketplace()} className="button button-ghost">Explore Marketplace</Link>
          </motion.div>
        </motion.div>
        <div className="hero-stat"><span>01</span><p>One intelligent path from idea to installation.</p></div>
        <a className="scroll-cue" href="#journey"><span /> Scroll to explore</a>
      </section>

      <section id="journey" ref={journeyRef} className={`journey-section ${reducedMotion || useStaticFilm ? 'is-static-film' : ''}`}>
        <div className="journey-sticky">
          <div className="scene-shell">
            <div className={`cinematic-scene cinematic-scene-${scenes[activeScene].id}`}>
              {useFilm ? (
                <SolarEcosystemFilm
                  key={reducedMotion || useStaticFilm ? 'static' : 'film'}
                  progressRef={sceneProgressRef}
                  active={sceneInView}
                  playFilm={!reducedMotion && !useStaticFilm}
                />
              ) : (
                <>
                  <AnimatePresence mode="sync" initial={false}>
                    <motion.div
                      key={`${scenes[activeScene].id}-${sceneImages[activeScene].src}`}
                      className="cinematic-scene-image"
                      initial={reducedMotion ? false : { opacity: 0, scale: 1.045 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={reducedMotion ? undefined : { opacity: 0, scale: 1.018 }}
                      transition={{ duration: reducedMotion ? 0 : 0.85, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Image src={sceneImages[activeScene].src} fill priority={activeScene === 0} sizes="100vw" alt={sceneImages[activeScene].alt} />
                    </motion.div>
                  </AnimatePresence>
                  <div className="cinematic-sky-glow" />
                  {activeScene > 0 ? <div className={`cinematic-energy-path cinematic-energy-path-${activeScene}`} aria-hidden="true"><span /></div> : null}
                </>
              )}
              {!useStaticFilm && !reducedMotion ? scenes.slice(1).map((scene, index) => activeScene === index + 1 ? (
                <button
                  type="button"
                  key={scene.id}
                  className={`cinematic-hotspot cinematic-hotspot-${index + 1} is-current`}
                  onClick={() => handleHotspot(scene.id as HotspotId)}
                  aria-label={`Learn about ${scene.title}`}
                ><span /></button>
              ) : null) : null}
            </div>
            <div className="scene-vignette" />
            <div className="scene-progress"><span style={{ width: `${((activeScene + 1) / scenes.length) * 100}%` }} /></div>
            <div ref={sceneCopyRef} className="scene-copy" key={scenes[activeScene].id}>
              <p className="eyebrow">{scenes[activeScene].label}</p>
              <h2>{scenes[activeScene].title}</h2>
              <p>{scenes[activeScene].body}</p>
            </div>
            <AnimatePresence>
              {activeHotspotContent ? (
                <motion.aside className="hotspot-panel" role="region" aria-label={`${activeHotspotContent.title} details`} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }}>
                  <button type="button" onClick={() => setActiveHotspot(null)} aria-label="Close information"><X size={17} /></button>
                  <span>ENERGY HOTSPOT</span><h3>{activeHotspotContent.title}</h3><p>{activeHotspotContent.body}</p>
                </motion.aside>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
        <div className="journey-steps" aria-hidden="true">
          {scenes.map((scene) => {
            const SceneIcon = scene.Icon;
            return <div key={scene.id} data-journey-step className="journey-trigger"><SceneIcon /></div>;
          })}
        </div>
      </section>

      <section id="how-it-works" className="process-section page-section">
        <SectionReveal className="section-heading split-heading">
          <div><p className="eyebrow">A CLEARER WAY TO GO SOLAR</p><h2>From your energy needs<br />to a managed project.</h2></div>
          <p>KaamAsaan connects the decisions that normally feel fragmented—system sizing, product discovery, professional surveys and project visibility.</p>
        </SectionReveal>
        <div className="process-grid">
          {processSteps.map((step, index) => (
            <SectionReveal key={step.title} className="process-step">
              <div className="step-number">0{index + 1}</div><div className="step-line" /><h3>{step.title}</h3><p>{step.copy}</p><ArrowRight size={20} />
            </SectionReveal>
          ))}
        </div>
      </section>

      <section id="services" className="services-section page-section">
        <SectionReveal className="section-heading">
          <p className="eyebrow">THE KAAMASAAN ECOSYSTEM</p><h2>Everything your solar journey needs.<br /><span>Nothing it doesn’t.</span></h2>
        </SectionReveal>
        <div className="bento-grid">
          {services.map(({ title, copy, cta, href, Icon, tone, span }, index) => (
            <SectionReveal key={title} className={`service-tile tile-${tone} tile-${span}`}>
              {tone === 'image' ? <Image src="/marketing/imagery/kaamasaan-rooftop-panels.webp" fill sizes="(max-width: 800px) 100vw, 40vw" alt="Realistic rooftop solar modules in bright daylight" /> : null}
              <div className="tile-index">0{index + 1}</div><Icon className="tile-icon" />
              <div className="tile-copy"><h3>{title}</h3><p>{copy}</p><Link href={href} aria-label={`${cta}: ${title}`}><span>{cta}</span><ArrowRight size={16} /></Link></div>
            </SectionReveal>
          ))}
        </div>
      </section>

      <section className="trust-section">
        <div className="trust-copy page-section">
          <SectionReveal><p className="eyebrow">PRODUCT TRUST</p><h2>Built around products<br />you can trust.</h2><p>Explore established solar brands through one consistent marketplace experience. Product availability and specifications remain grounded in the live KaamAsaan catalogue.</p></SectionReveal>
          <div className="trust-seal"><ShieldCheck /><span>Verified product information</span></div>
        </div>
        <div className="marquee" aria-label="Solar brands available in KaamAsaan">
          {/* These optical logo strips preserve each source mark's natural aspect ratio. */}
          {/* eslint-disable @next/next/no-img-element */}
          <div className="marquee-track">
            {[...brandLogos, ...brandLogos].map((brand, index) => {
              const duplicate = index >= brandLogos.length;
              return <div className="brand-item" aria-hidden={duplicate || undefined} key={`${brand.name}-${index}`}><img src={brand.src} width="130" height="44" alt={duplicate ? '' : brand.name} /></div>;
            })}
          </div>
          {/* eslint-enable @next/next/no-img-element */}
        </div>
      </section>

      <section id="app" ref={appRef} className="app-section page-section">
        <div className="app-visual">
          <div className="phone phone-back"><div className="phone-screen phone-energy"><SunMedium /><strong>8.4 kW</strong><span>Designed around your home</span><div className="energy-chart"><i /><i /><i /><i /><i /></div></div></div>
          <motion.div className="phone phone-front" whileHover={reducedMotion ? undefined : { y: -10, rotateY: -3 }}>
            <div className="phone-camera" />
            <div className="phone-screen">
              <Image src="/marketing/app/app-screen.png" fill sizes="300px" alt="KaamAsaan mobile app" />
            </div>
          </motion.div>
          <div className="app-orbit orbit-one"><PanelsTopLeft /></div><div className="app-orbit orbit-two"><BatteryCharging /></div>
        </div>
        <SectionReveal className="app-copy">
          <p className="eyebrow">KAAMASAAN IN YOUR POCKET</p><h2>Your solar journey,<br />always within reach.</h2><p>Design your system, compare products, book surveys, follow project progress and keep maintenance organised from one app.</p>
          <ul>{['Design your solar system', 'Compare solar products', 'Book professional surveys', 'Track your solar project', 'Manage maintenance'].map((item) => <li key={item}><Check size={16} />{item}</li>)}</ul>
          <div className="app-actions"><button className="button button-gold" type="button" disabled aria-label="Android download coming soon"><Download size={18} /> Download on Android <small>Coming soon</small></button><Link className="text-link" href={routes.design()}>Explore the App <ArrowRight size={16} /></Link></div>
        </SectionReveal>
      </section>

      <section className="final-cta">
        <Image src="/marketing/imagery/kaamasaan-daylight-home.webp" fill sizes="100vw" alt="Solar-powered Pakistani home with connected electric vehicle" />
        <div className="final-overlay" />
        <SectionReveal className="final-copy"><p className="eyebrow">START WITH CLARITY</p><h2>Your smarter energy<br />journey starts here.</h2><p>One intelligent place to design, compare, book and manage solar.</p><Link href={routes.design()} className="button button-gold">Start Designing My System <ArrowRight size={18} /></Link></SectionReveal>
      </section>

      <footer className="site-footer">
        <div className="footer-main"><div><Image src="/marketing/brand/kaamasaan-website-logo.png" width={1200} height={454} className="footer-brand-logo" alt="KaamAsaan — Pakistan No.1 Smart Solar Marketplace" /></div><nav>{[['Home', '#top'], ['Marketplace', routes.marketplace()], ['Services', '#services'], ['About KaamAsaan', '#journey'], ['Help Center', routes.helpCenter()], ['Contact', 'mailto:hello@kaamasaan.pk']].map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}</nav><div className="footer-contact"><Headphones /><span>Need guidance?</span><a href="mailto:hello@kaamasaan.pk">Talk to KaamAsaan</a></div></div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} KaamAsaan. Built for a smarter energy future.</span><span>Pakistan</span></div>
      </footer>
    </main>
  );
}
