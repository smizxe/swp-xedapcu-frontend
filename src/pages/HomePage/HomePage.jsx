import { useState } from 'react';
import styles from './HomePage.module.css';
import HeroSection from './HeroSection/HeroSection';
import useScrollAnimation from '../../hooks/useScrollAnimation';

const cls = (...classes) => classes.filter(Boolean).join(' ');

// SVG icon components — no emoji, per design system rules
const IconSearch = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
);
const IconShieldCheck = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
    </svg>
);
const IconBike = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="5.5" cy="17.5" r="3.5" /><circle cx="18.5" cy="17.5" r="3.5" />
        <path d="M15 6a1 1 0 0 0-1-1h-1" /><path d="m9 17 2-7 4 2 1.5-3H18" />
        <path d="m5.5 14 3-7" />
    </svg>
);
const IconArrowRight = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
);
const IconCheck = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
const IconStar = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const HomePage = () => {
    const [hoveredCard, setHoveredCard] = useState(null);

    // Scroll animation refs
    const [heroRef, heroVisible] = useScrollAnimation(0.1);
    const [featuredHeaderRef, featuredHeaderVisible] = useScrollAnimation(0.2);
    const [card0Ref, card0Visible] = useScrollAnimation(0.1);
    const [card1Ref, card1Visible] = useScrollAnimation(0.1);
    const [card2Ref, card2Visible] = useScrollAnimation(0.1);
    const [howItWorksHeaderRef, howItWorksHeaderVisible] = useScrollAnimation(0.2);
    const [step0Ref, step0Visible] = useScrollAnimation(0.1);
    const [step1Ref, step1Visible] = useScrollAnimation(0.1);
    const [step2Ref, step2Visible] = useScrollAnimation(0.1);
    const [trustRef, trustVisible] = useScrollAnimation(0.1);
    const [ctaRef, ctaVisible] = useScrollAnimation(0.15);

    const cardRefs = [
        [card0Ref, card0Visible],
        [card1Ref, card1Visible],
        [card2Ref, card2Visible],
    ];

    const stepRefs = [
        [step0Ref, step0Visible],
        [step1Ref, step1Visible],
        [step2Ref, step2Visible],
    ];

    const staggerDelays = [styles.delay100, styles.delay200, styles.delay300];

    const featuredBikes = [
        {
            id: 1,
            name: 'Mountain Pro X1',
            brand: 'Trek',
            price: '29.500.000',
            condition: 'Like New',
            verified: true,
            rating: 4.9,
            image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=500&h=400&fit=crop'
        },
        {
            id: 2,
            name: 'Vintage Roadster',
            brand: 'Pinarello',
            price: '18.900.000',
            condition: 'Excellent',
            verified: true,
            rating: 4.8,
            image: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=500&h=400&fit=crop'
        },
        {
            id: 3,
            name: 'City E-Bike',
            brand: 'Specialized',
            price: '42.000.000',
            condition: 'Good',
            verified: true,
            rating: 4.7,
            image: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=500&h=400&fit=crop'
        }
    ];

    const howItWorks = [
        {
            icon: <IconBike />,
            step: '01',
            title: 'Sellers Post',
            description: 'List your bicycle with detailed photos, specifications, and your asking price in minutes.'
        },
        {
            icon: <IconShieldCheck />,
            step: '02',
            title: 'Inspector Verifies',
            description: 'Our certified professionals inspect every bike to certify quality, authenticity, and condition.'
        },
        {
            icon: <IconSearch />,
            step: '03',
            title: 'Buyers Trust',
            description: 'Browse and purchase verified bicycles with full confidence and our satisfaction guarantee.'
        }
    ];

    const trustMetrics = [
        { value: '2,500+', label: 'Bikes Sold' },
        { value: '98%', label: 'Verified Listings' },
        { value: '4.9★', label: 'Average Rating' },
        { value: '1,200+', label: 'Happy Riders' },
    ];

    return (
        <div className={styles.homePage}>
            {/* Top-of-page HeroSection (video background, existing component) */}
            <HeroSection />

            {/* ── BUY & SELL SECTION ──────────────────────────────── */}
            <section
                ref={heroRef}
                className={cls(styles.buyAndSell, styles.animateHidden, heroVisible && styles.animateVisible)}
            >
                {/* Subtle decorative blob */}
                <div className={styles.blobDecor} aria-hidden="true" />

                <div className={styles.container}>
                    <div className={styles.buyAndSellGrid}>
                        {/* Left: text */}
                        <div className={styles.buyAndSellText}>
                            <span className={styles.eyebrow}>Trusted Marketplace</span>
                            <h1 className={styles.heroTitle}>
                                Buy &amp; Sell<br />
                                <span className={styles.heroAccent}>Verified Bicycles</span>
                            </h1>
                            <p className={styles.heroSubtitle}>
                                The premium marketplace for pre-owned bicycles.
                                Every bike inspected by certified experts — every sale fully secured.
                            </p>
                            <div className={styles.heroBullets}>
                                <div className={styles.bullet}><span className={styles.bulletIcon}><IconCheck /></span>Expert-certified condition reports</div>
                                <div className={styles.bullet}><span className={styles.bulletIcon}><IconCheck /></span>Secure escrow payment system</div>
                                <div className={styles.bullet}><span className={styles.bulletIcon}><IconCheck /></span>30-day buyer protection guarantee</div>
                            </div>
                            <div className={styles.heroButtons}>
                                <button className={styles.btnPrimaryEmerald}>
                                    Explore Bikes
                                    <span className={styles.btnArrowIcon}><IconArrowRight /></span>
                                </button>
                                <button className={styles.btnOutlineEmerald}>
                                    Sell Your Bike
                                </button>
                            </div>
                        </div>

                        {/* Right: glass image card */}
                        <div className={cls(styles.buyAndSellImage, styles.animateHiddenRight, heroVisible && styles.animateVisible, styles.delay200)}>
                            <div className={styles.glassImageCard}>
                                <img
                                    src="https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&h=600&fit=crop"
                                    alt="Featured premium bicycle"
                                />
                                {/* Floating glass badge */}
                                <div className={styles.floatingVerifiedBadge}>
                                    <span className={styles.verifiedCheckCircle}><IconCheck /></span>
                                    Inspector Verified
                                </div>
                                {/* Floating stat pill */}
                                <div className={styles.floatingStatPill}>
                                    <span className={styles.statStars}>
                                        <IconStar /><IconStar /><IconStar /><IconStar /><IconStar />
                                    </span>
                                    <span className={styles.statPillText}>4.9 · 2,500+ bikes sold</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── TRUST METRICS BAR ────────────────────────────────── */}
            <section
                ref={trustRef}
                className={cls(styles.trustBar, styles.animateHidden, trustVisible && styles.animateVisible)}
            >
                <div className={styles.container}>
                    <div className={styles.trustGrid}>
                        {trustMetrics.map((m, i) => (
                            <div key={i} className={styles.trustItem}>
                                <span className={styles.trustValue}>{m.value}</span>
                                <span className={styles.trustLabel}>{m.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURED BICYCLES ────────────────────────────────── */}
            <section className={styles.featuredSection}>
                <div className={styles.container}>
                    <div
                        ref={featuredHeaderRef}
                        className={cls(styles.sectionHeader, styles.animateHidden, featuredHeaderVisible && styles.animateVisible)}
                    >
                        <span className={styles.eyebrow}>Hand-picked for you</span>
                        <h2 className={styles.sectionTitle}>Featured Bicycles</h2>
                        <p className={styles.sectionSubtitle}>
                            Professionally inspected and verified by our certified expert team
                        </p>
                    </div>

                    <div className={styles.bikeGrid}>
                        {featuredBikes.map((bike, index) => {
                            const [ref, visible] = cardRefs[index];
                            return (
                                <article
                                    key={bike.id}
                                    ref={ref}
                                    className={cls(
                                        styles.bikeCard,
                                        hoveredCard === bike.id ? styles.bikeCardHovered : '',
                                        styles.animateHidden,
                                        visible && styles.animateVisible,
                                        staggerDelays[index]
                                    )}
                                    onMouseEnter={() => setHoveredCard(bike.id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                >
                                    {/* Verified badge */}
                                    {bike.verified && (
                                        <div className={styles.verifiedBadge}>
                                            <IconCheck />
                                            Verified
                                        </div>
                                    )}

                                    {/* Image */}
                                    <div className={styles.bikeImageWrap}>
                                        <img src={bike.image} alt={bike.name} />
                                    </div>

                                    {/* Info */}
                                    <div className={styles.bikeBody}>
                                        <span className={styles.bikeBrand}>{bike.brand}</span>
                                        <h3 className={styles.bikeName}>{bike.name}</h3>

                                        <div className={styles.bikeMeta}>
                                            <span className={styles.bikeConditionBadge}>{bike.condition}</span>
                                            <span className={styles.bikeRating}>
                                                <IconStar />
                                                {bike.rating}
                                            </span>
                                        </div>

                                        <div className={styles.bikeFooter}>
                                            <div>
                                                <span className={styles.bikePrice}>{bike.price}</span>
                                                <span className={styles.bikeCurrency}> ₫</span>
                                            </div>
                                            <button className={styles.btnViewBike}>
                                                View
                                                <IconArrowRight />
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    <div className={styles.featuredCta}>
                        <button className={styles.btnOutlineEmerald}>
                            Browse All Bicycles
                            <IconArrowRight />
                        </button>
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ─────────────────────────────────────── */}
            <section className={styles.howItWorksSection}>
                <div className={styles.container}>
                    <div
                        ref={howItWorksHeaderRef}
                        className={cls(styles.sectionHeader, styles.animateHidden, howItWorksHeaderVisible && styles.animateVisible)}
                    >
                        <span className={styles.eyebrow}>Simple Process</span>
                        <h2 className={styles.sectionTitle}>How It Works</h2>
                        <p className={styles.sectionSubtitle}>
                            A seamless, transparent process — from listing to verified ownership
                        </p>
                    </div>

                    <div className={styles.stepsGrid}>
                        {howItWorks.map((step, index) => {
                            const [ref, visible] = stepRefs[index];
                            return (
                                <div
                                    key={index}
                                    ref={ref}
                                    className={cls(
                                        styles.stepCard,
                                        styles.animateHiddenScale,
                                        visible && styles.animateVisible,
                                        staggerDelays[index]
                                    )}
                                >
                                    <div className={styles.stepNumber}>{step.step}</div>
                                    <div className={styles.stepIconWrap}>
                                        {step.icon}
                                    </div>
                                    <h3 className={styles.stepTitle}>{step.title}</h3>
                                    <p className={styles.stepDescription}>{step.description}</p>

                                    {index < howItWorks.length - 1 && (
                                        <div className={styles.stepConnector} aria-hidden="true">
                                            <IconArrowRight />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── CTA SECTION ──────────────────────────────────────── */}
            <section className={styles.ctaSection}>
                <div className={styles.container}>
                    <div
                        ref={ctaRef}
                        className={cls(styles.ctaCard, styles.animateHiddenScale, ctaVisible && styles.animateVisible)}
                    >
                        {/* decorative top line */}
                        <div className={styles.ctaTopLine} aria-hidden="true" />
                        <span className={styles.ctaEyebrow}>Join Ekibdlo</span>
                        <h2 className={styles.ctaTitle}>Ready to Find Your Perfect Ride?</h2>
                        <p className={styles.ctaSubtitle}>
                            Join thousands of satisfied riders. Start browsing or list your bicycle today.
                        </p>
                        <div className={styles.ctaButtons}>
                            <button className={styles.btnPrimaryEmerald}>
                                Browse Bicycles
                                <IconArrowRight />
                            </button>
                            <button className={styles.btnCtaOutline}>
                                List Your Bike
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ───────────────────────────────────────────── */}
            <footer className={styles.footer}>
                <div className={styles.footerInner}>
                    <div className={styles.footerBrand}>
                        <div className={styles.footerLogo}>Ekibdlo</div>
                        <p className={styles.footerTagline}>The trusted marketplace for premium verified bicycles.</p>
                    </div>
                    <div className={styles.footerLinks}>
                        <div className={styles.footerCol}>
                            <h4 className={styles.footerColTitle}>Marketplace</h4>
                            <a href="/marketplace">Browse Bikes</a>
                            <a href="/sell">Sell a Bike</a>
                            <a href="/verified">Verified Program</a>
                        </div>
                        <div className={styles.footerCol}>
                            <h4 className={styles.footerColTitle}>Company</h4>
                            <a href="/about">About Us</a>
                            <a href="/contact">Contact</a>
                            <a href="/terms">Terms of Use</a>
                        </div>
                        <div className={styles.footerCol}>
                            <h4 className={styles.footerColTitle}>Support</h4>
                            <a href="/help">Help Center</a>
                            <a href="/safety">Safety Tips</a>
                            <a href="/faq">FAQ</a>
                        </div>
                    </div>
                </div>
                <div className={styles.footerBottom}>
                    <span>© 2026 Ekibdlo. All rights reserved.</span>
                    <span className={styles.footerDivider}>·</span>
                    <a href="/privacy">Privacy Policy</a>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;