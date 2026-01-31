import Header from '../../components/Header/Header';
import styles from './AboutUsPage.module.css';

const AboutUsPage = () => {
    const values = [
        {
            icon: '✓',
            title: 'Trust & Transparency',
            description: 'Every bicycle is professionally inspected and verified. We believe in complete transparency throughout the buying and selling process.'
        },
        {
            icon: '⭐',
            title: 'Quality Standards',
            description: 'Our certified inspectors ensure every bicycle meets our rigorous quality standards before it can be listed on our platform.'
        },
        {
            icon: '🤝',
            title: 'Community First',
            description: 'We\'re building a community of cycling enthusiasts who share our passion for quality bicycles and sustainable transportation.'
        }
    ];

    const stats = [
        { number: '10,000+', label: 'Bicycles Sold' },
        { number: '98%', label: 'Verified Listings' },
        { number: '5,000+', label: 'Happy Customers' },
        { number: '50+', label: 'Cities Served' }
    ];

    const team = [
        {
            name: 'Sarah Johnson',
            role: 'Founder & CEO',
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'
        },
        {
            name: 'Michael Chen',
            role: 'Head of Operations',
            image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'
        },
        {
            name: 'Emma Williams',
            role: 'Lead Inspector',
            image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop'
        },
        {
            name: 'David Rodriguez',
            role: 'Customer Success',
            image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop'
        }
    ];

    return (
        <div className={styles.aboutPage}>
            {/* Header */}
            <Header variant="dark" />
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        We're Building The Future
                        <span className={styles.heroGradient}>Of Bicycle Commerce</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        BikeHub is revolutionizing the way people buy and sell bicycles.
                        Our mission is to create a trusted marketplace where quality meets transparency.
                    </p>
                </div>
            </section>

            {/* Stats Bar */}
            <section className={styles.statsBar}>
                <div className={styles.container}>
                    {stats.map((stat, index) => (
                        <div key={index} className={styles.statItem}>
                            <div className={styles.statNumber}>{stat.number}</div>
                            <div className={styles.statLabel}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Our Story */}
            <section className={styles.storySection}>
                <div className={styles.container}>
                    <div className={styles.storyGrid}>
                        <div className={styles.storyImage}>
                            <img
                                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop"
                                alt="Our Story"
                            />
                        </div>
                        <div className={styles.storyContent}>
                            <h2 className={styles.sectionTitle}>Our Story</h2>
                            <div className={styles.storyText}>
                                <p>
                                    BikeHub was founded in 2020 by a group of cycling enthusiasts who were frustrated
                                    with the lack of trust and transparency in the second-hand bicycle market. We saw
                                    too many buyers getting scammed and sellers struggling to prove the quality of their
                                    bicycles.
                                </p>
                                <p>
                                    We decided to solve this problem by creating a platform where every bicycle is
                                    professionally inspected and verified before it can be sold. Our team of certified
                                    inspectors ensures that buyers can purchase with confidence and sellers can get fair
                                    value for their quality bicycles.
                                </p>
                                <p>
                                    Today, BikeHub has helped thousands of people find their perfect ride and has become
                                    the most trusted marketplace for verified bicycles. We're proud to be building a
                                    community of cycling enthusiasts who share our passion for quality and sustainability.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className={styles.missionSection}>
                <div className={styles.container}>
                    <div className={styles.missionGrid}>
                        <div className={styles.missionCard}>
                            <div className={styles.missionIcon}>🎯</div>
                            <h3 className={styles.missionTitle}>Our Mission</h3>
                            <p className={styles.missionText}>
                                To create the world's most trusted marketplace for bicycles by ensuring every
                                transaction is transparent, secure, and backed by professional verification.
                            </p>
                        </div>
                        <div className={styles.missionCard}>
                            <div className={styles.missionIcon}>🔭</div>
                            <h3 className={styles.missionTitle}>Our Vision</h3>
                            <p className={styles.missionText}>
                                A future where everyone has access to quality, verified bicycles, promoting
                                sustainable transportation and healthier lifestyles worldwide.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className={styles.valuesSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Our Values</h2>
                        <p className={styles.sectionSubtitle}>
                            The principles that guide everything we do
                        </p>
                    </div>

                    <div className={styles.valuesGrid}>
                        {values.map((value, index) => (
                            <div key={index} className={styles.valueCard}>
                                <div className={styles.valueIcon}>{value.icon}</div>
                                <h3 className={styles.valueTitle}>{value.title}</h3>
                                <p className={styles.valueDescription}>{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className={styles.teamSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Meet Our Team</h2>
                        <p className={styles.sectionSubtitle}>
                            The passionate people behind BikeHub
                        </p>
                    </div>

                    <div className={styles.teamGrid}>
                        {team.map((member, index) => (
                            <div key={index} className={styles.teamCard}>
                                <div className={styles.teamImage}>
                                    <img src={member.image} alt={member.name} />
                                </div>
                                <div className={styles.teamInfo}>
                                    <h3 className={styles.teamName}>{member.name}</h3>
                                    <p className={styles.teamRole}>{member.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How We're Different */}
            <section className={styles.differentSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Why BikeHub?</h2>
                        <p className={styles.sectionSubtitle}>
                            What makes us different from other marketplaces
                        </p>
                    </div>

                    <div className={styles.differentGrid}>
                        <div className={styles.differentCard}>
                            <div className={styles.differentNumber}>01</div>
                            <h3 className={styles.differentTitle}>Professional Inspection</h3>
                            <p className={styles.differentText}>
                                Every bicycle is thoroughly inspected by certified professionals with years
                                of experience. We check frame integrity, component condition, and overall safety.
                            </p>
                        </div>

                        <div className={styles.differentCard}>
                            <div className={styles.differentNumber}>02</div>
                            <h3 className={styles.differentTitle}>Verified Sellers</h3>
                            <p className={styles.differentText}>
                                All sellers are verified through our rigorous identity confirmation process.
                                We ensure accountability and build trust within our community.
                            </p>
                        </div>

                        <div className={styles.differentCard}>
                            <div className={styles.differentNumber}>03</div>
                            <h3 className={styles.differentTitle}>Secure Payments</h3>
                            <p className={styles.differentText}>
                                Our escrow payment system protects both buyers and sellers. Money is only
                                released when the buyer confirms satisfaction with their purchase.
                            </p>
                        </div>

                        <div className={styles.differentCard}>
                            <div className={styles.differentNumber}>04</div>
                            <h3 className={styles.differentTitle}>Return Policy</h3>
                            <p className={styles.differentText}>
                                We offer a 7-day return policy on all verified bicycles. If it doesn't match
                                the description or you're not satisfied, we've got you covered.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className={styles.cta}>
                <div className={styles.ctaContent}>
                    <h2 className={styles.ctaTitle}>Join The BikeHub Community</h2>
                    <p className={styles.ctaSubtitle}>
                        Start buying or selling verified bicycles today
                    </p>
                    <div className={styles.ctaButtons}>
                        <button className={styles.btnCtaPrimary}>Get Started</button>
                        <button className={styles.btnCtaSecondary}>Learn More</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutUsPage;
