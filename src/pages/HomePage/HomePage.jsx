import { useState } from 'react';
import styles from './HomePage.module.css';
import Header from '../../components/Header/Header';

const HomePage = () => {
    const [hoveredCard, setHoveredCard] = useState(null);

    const featuredBikes = [
        {
            id: 1,
            name: 'Mountain Pro X1',
            price: '$1,299',
            condition: 'Like New',
            verified: true,
            image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=500&h=400&fit=crop'
        },
        {
            id: 2,
            name: 'Vintage Roadster',
            price: '$899',
            condition: 'Excellent',
            verified: true,
            image: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=500&h=400&fit=crop'
        },
        {
            id: 3,
            name: 'City E-Bike',
            price: '$1,799',
            condition: 'New',
            verified: true,
            image: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=500&h=400&fit=crop'
        }
    ];

    const howItWorks = [
        {
            icon: '🚲',
            title: 'Sellers Post',
            description: 'List your bicycle with detailed photos and specifications'
        },
        {
            icon: '🔍',
            title: 'Inspector Verifies',
            description: 'Professional inspection to certify quality and legitimacy'
        },
        {
            icon: '🛒',
            title: 'Buyers Trust',
            description: 'Purchase with confidence knowing bicycles are verified'
        }
    ];

    return (
        <div className={styles.homePage}>
            {/* Navigation */}
            <Header />

            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroBackground}></div>
                <div className={styles.heroContent}>
                    <div className={styles.heroText}>
                        <h1 className={styles.heroTitle}>
                            Buy & Sell
                            <span className={styles.heroGradient}> Verified Bicycles</span>
                        </h1>
                        <p className={styles.heroSubtitle}>
                            The trusted marketplace for pre-owned bicycles.
                            Every bike inspected, every sale secure.
                        </p>
                        <div className={styles.heroButtons}>
                            <button className={styles.btnHeroPrimary}>
                                Explore Bikes
                                <span className={styles.btnArrow}>→</span>
                            </button>
                            <button className={styles.btnHeroSecondary}>
                                Sell Your Bike
                            </button>
                        </div>
                        <div className={styles.heroStats}>
                            <div className={styles.stat}>
                                <span className={styles.statNumber}>2,500+</span>
                                <span className={styles.statLabel}>Bikes Sold</span>
                            </div>
                            <div className={styles.stat}>
                                <span className={styles.statNumber}>98%</span>
                                <span className={styles.statLabel}>Verified</span>
                            </div>
                            <div className={styles.stat}>
                                <span className={styles.statNumber}>1,200+</span>
                                <span className={styles.statLabel}>Happy Riders</span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.heroImage}>
                        <div className={styles.floatingCard}>
                            <img
                                src="https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&h=600&fit=crop"
                                alt="Featured Bike"
                            />
                            <div className={styles.verificationBadge}>
                                <span className={styles.checkmark}>✓</span>
                                Inspector Verified
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Indicators */}
            <section className={styles.trustBar}>
                <div className={styles.trustItem}>
                    <span className={styles.trustIcon}>🔒</span>
                    <span>Secure Payments</span>
                </div>
                <div className={styles.trustItem}>
                    <span className={styles.trustIcon}>✓</span>
                    <span>Inspector Verified</span>
                </div>
                <div className={styles.trustItem}>
                    <span className={styles.trustIcon}>📦</span>
                    <span>Safe Delivery</span>
                </div>
                <div className={styles.trustItem}>
                    <span className={styles.trustIcon}>💬</span>
                    <span>24/7 Support</span>
                </div>
            </section>

            {/* Featured Listings */}
            <section className={styles.featured}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Featured Bicycles</h2>
                    <p className={styles.sectionSubtitle}>
                        Professionally inspected and verified by our expert team
                    </p>
                </div>
                <div className={styles.bikeGrid}>
                    {featuredBikes.map((bike) => (
                        <div
                            key={bike.id}
                            className={`${styles.bikeCard} ${hoveredCard === bike.id ? styles.bikeCardHovered : ''}`}
                            onMouseEnter={() => setHoveredCard(bike.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            {bike.verified && (
                                <div className={styles.verifiedBadge}>
                                    <span>✓ Verified</span>
                                </div>
                            )}
                            <div className={styles.bikeImage}>
                                <img src={bike.image} alt={bike.name} />
                            </div>
                            <div className={styles.bikeInfo}>
                                <h3 className={styles.bikeName}>{bike.name}</h3>
                                <div className={styles.bikeCondition}>{bike.condition}</div>
                                <div className={styles.bikeFooter}>
                                    <span className={styles.bikePrice}>{bike.price}</span>
                                    <button className={styles.btnView}>View →</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section className={styles.howItWorks}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>How It Works</h2>
                    <p className={styles.sectionSubtitle}>
                        A seamless process from listing to verified sale
                    </p>
                </div>
                <div className={styles.stepsContainer}>
                    {howItWorks.map((step, index) => (
                        <div key={index} className={styles.stepCard}>
                            <div className={styles.stepIcon}>{step.icon}</div>
                            <h3 className={styles.stepTitle}>{step.title}</h3>
                            <p className={styles.stepDescription}>{step.description}</p>
                            {index < howItWorks.length - 1 && (
                                <div className={styles.stepArrow}>→</div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className={styles.cta}>
                <div className={styles.ctaContent}>
                    <h2 className={styles.ctaTitle}>Ready to Find Your Perfect Ride?</h2>
                    <p className={styles.ctaSubtitle}>
                        Join thousands of satisfied riders. Start buying or selling today.
                    </p>
                    <div className={styles.ctaButtons}>
                        <button className={styles.btnCtaPrimary}>Browse Bicycles</button>
                        <button className={styles.btnCtaSecondary}>List Your Bike</button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <div className={styles.footerSection}>
                        <h4>BikeHub</h4>
                        <p>The trusted marketplace for verified bicycles</p>
                    </div>
                    <div className={styles.footerSection}>
                        <h4>Quick Links</h4>
                        <a href="#about">About Us</a>
                        <a href="#contact">Contact</a>
                        <a href="#terms">Terms</a>
                    </div>
                    <div className={styles.footerSection}>
                        <h4>Support</h4>
                        <a href="#help">Help Center</a>
                        <a href="#safety">Safety Tips</a>
                        <a href="#faq">FAQ</a>
                    </div>
                </div>
                <div className={styles.footerBottom}>
                    © 2026 BikeHub. All rights reserved.
                </div>
            </footer>
        </div>
    )
}

export default HomePage 