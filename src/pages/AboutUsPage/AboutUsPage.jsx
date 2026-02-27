import Header from '../../components/Header/Header';
import styles from './AboutUsPage.module.css';
import useScrollAnimation from '../../hooks/useScrollAnimation';

const cls = (...classes) => classes.filter(Boolean).join(' ');

const AboutUsPage = () => {
    // Scroll animation refs
    const [heroRef, heroVisible] = useScrollAnimation(0.1);
    const [statsRef, statsVisible] = useScrollAnimation(0.15);
    const [storyImgRef, storyImgVisible] = useScrollAnimation(0.1);
    const [storyTextRef, storyTextVisible] = useScrollAnimation(0.1);
    const [mission0Ref, mission0Visible] = useScrollAnimation(0.1);
    const [mission1Ref, mission1Visible] = useScrollAnimation(0.1);
    const [valuesHeaderRef, valuesHeaderVisible] = useScrollAnimation(0.2);
    const [value0Ref, value0Visible] = useScrollAnimation(0.1);
    const [value1Ref, value1Visible] = useScrollAnimation(0.1);
    const [value2Ref, value2Visible] = useScrollAnimation(0.1);
    const [teamHeaderRef, teamHeaderVisible] = useScrollAnimation(0.2);
    const [team0Ref, team0Visible] = useScrollAnimation(0.1);
    const [team1Ref, team1Visible] = useScrollAnimation(0.1);
    const [team2Ref, team2Visible] = useScrollAnimation(0.1);
    const [team3Ref, team3Visible] = useScrollAnimation(0.1);
    const [diffHeaderRef, diffHeaderVisible] = useScrollAnimation(0.2);
    const [diff0Ref, diff0Visible] = useScrollAnimation(0.1);
    const [diff1Ref, diff1Visible] = useScrollAnimation(0.1);
    const [diff2Ref, diff2Visible] = useScrollAnimation(0.1);
    const [diff3Ref, diff3Visible] = useScrollAnimation(0.1);
    const [ctaRef, ctaVisible] = useScrollAnimation(0.15);

    const staggerDelays = [styles.delay100, styles.delay200, styles.delay300, styles.delay400, styles.delay500, styles.delay600];

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

    const teamRefs = [
        [team0Ref, team0Visible],
        [team1Ref, team1Visible],
        [team2Ref, team2Visible],
        [team3Ref, team3Visible],
    ];

    const valueRefs = [
        [value0Ref, value0Visible],
        [value1Ref, value1Visible],
        [value2Ref, value2Visible],
    ];

    const diffRefs = [
        [diff0Ref, diff0Visible],
        [diff1Ref, diff1Visible],
        [diff2Ref, diff2Visible],
        [diff3Ref, diff3Visible],
    ];

    return (
        <div className={styles.aboutPage}>
            {/* Header */}
            <Header variant="dark" />
            {/* Hero Section */}
            <section className={styles.hero}>
                <div
                    ref={heroRef}
                    className={cls(styles.heroContent, styles.animateHidden, heroVisible && styles.animateVisible)}
                >
                    <h1 className={styles.heroTitle}>
                        We&apos;re Building The Future
                        <span className={styles.heroGradient}>Of Bicycle Commerce</span>
                    </h1>
                    <p className={cls(styles.heroSubtitle, styles.delay200, heroVisible && styles.animateVisible)}>
                        BikeHub is revolutionizing the way people buy and sell bicycles.
                        Our mission is to create a trusted marketplace where quality meets transparency.
                    </p>
                </div>
            </section>

            {/* Stats Bar */}
            <section className={styles.statsBar}>
                <div
                    ref={statsRef}
                    className={cls(styles.container, styles.animateHiddenScale, statsVisible && styles.animateVisible)}
                >
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className={cls(styles.statItem, staggerDelays[index])}
                        >
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
                        <div
                            ref={storyImgRef}
                            className={cls(styles.storyImage, styles.animateHiddenLeft, storyImgVisible && styles.animateVisible)}
                        >
                            <img
                                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop"
                                alt="Our Story"
                            />
                        </div>
                        <div
                            ref={storyTextRef}
                            className={cls(styles.storyContent, styles.animateHiddenRight, storyTextVisible && styles.animateVisible, styles.delay100)}
                        >
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
                                    the most trusted marketplace for verified bicycles. We&apos;re proud to be building a
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
                        <div
                            ref={mission0Ref}
                            className={cls(styles.missionCard, styles.animateHidden, mission0Visible && styles.animateVisible)}
                        >
                            <div className={styles.missionIcon}>🎯</div>
                            <h3 className={styles.missionTitle}>Our Mission</h3>
                            <p className={styles.missionText}>
                                To create the world&apos;s most trusted marketplace for bicycles by ensuring every
                                transaction is transparent, secure, and backed by professional verification.
                            </p>
                        </div>
                        <div
                            ref={mission1Ref}
                            className={cls(styles.missionCard, styles.animateHidden, mission1Visible && styles.animateVisible, styles.delay200)}
                        >
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
                    <div
                        ref={valuesHeaderRef}
                        className={cls(styles.sectionHeader, styles.animateHidden, valuesHeaderVisible && styles.animateVisible)}
                    >
                        <h2 className={styles.sectionTitle}>Our Values</h2>
                        <p className={styles.sectionSubtitle}>
                            The principles that guide everything we do
                        </p>
                    </div>

                    <div className={styles.valuesGrid}>
                        {values.map((value, index) => {
                            const [ref, visible] = valueRefs[index];
                            return (
                                <div
                                    key={index}
                                    ref={ref}
                                    className={cls(styles.valueCard, styles.animateHidden, visible && styles.animateVisible, staggerDelays[index])}
                                >
                                    <div className={styles.valueIcon}>{value.icon}</div>
                                    <h3 className={styles.valueTitle}>{value.title}</h3>
                                    <p className={styles.valueDescription}>{value.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className={styles.teamSection}>
                <div className={styles.container}>
                    <div
                        ref={teamHeaderRef}
                        className={cls(styles.sectionHeader, styles.animateHidden, teamHeaderVisible && styles.animateVisible)}
                    >
                        <h2 className={styles.sectionTitle}>Meet Our Team</h2>
                        <p className={styles.sectionSubtitle}>
                            The passionate people behind BikeHub
                        </p>
                    </div>

                    <div className={styles.teamGrid}>
                        {team.map((member, index) => {
                            const [ref, visible] = teamRefs[index];
                            return (
                                <div
                                    key={index}
                                    ref={ref}
                                    className={cls(styles.teamCard, styles.animateHidden, visible && styles.animateVisible, staggerDelays[index])}
                                >
                                    <div className={styles.teamImage}>
                                        <img src={member.image} alt={member.name} />
                                    </div>
                                    <div className={styles.teamInfo}>
                                        <h3 className={styles.teamName}>{member.name}</h3>
                                        <p className={styles.teamRole}>{member.role}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How We're Different */}
            <section className={styles.differentSection}>
                <div className={styles.container}>
                    <div
                        ref={diffHeaderRef}
                        className={cls(styles.sectionHeader, styles.animateHidden, diffHeaderVisible && styles.animateVisible)}
                    >
                        <h2 className={styles.sectionTitle}>Why BikeHub?</h2>
                        <p className={styles.sectionSubtitle}>
                            What makes us different from other marketplaces
                        </p>
                    </div>

                    <div className={styles.differentGrid}>
                        {[
                            {
                                num: '01', title: 'Professional Inspection',
                                text: 'Every bicycle is thoroughly inspected by certified professionals with years of experience. We check frame integrity, component condition, and overall safety.'
                            },
                            {
                                num: '02', title: 'Verified Sellers',
                                text: 'All sellers are verified through our rigorous identity confirmation process. We ensure accountability and build trust within our community.'
                            },
                            {
                                num: '03', title: 'Secure Payments',
                                text: 'Our escrow payment system protects both buyers and sellers. Money is only released when the buyer confirms satisfaction with their purchase.'
                            },
                            {
                                num: '04', title: 'Return Policy',
                                text: 'We offer a 7-day return policy on all verified bicycles. If it doesn\'t match the description or you\'re not satisfied, we\'ve got you covered.'
                            }
                        ].map((item, index) => {
                            const [ref, visible] = diffRefs[index];
                            return (
                                <div
                                    key={index}
                                    ref={ref}
                                    className={cls(styles.differentCard, styles.animateHidden, visible && styles.animateVisible, staggerDelays[index])}
                                >
                                    <div className={styles.differentNumber}>{item.num}</div>
                                    <h3 className={styles.differentTitle}>{item.title}</h3>
                                    <p className={styles.differentText}>{item.text}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className={styles.cta}>
                <div
                    ref={ctaRef}
                    className={cls(styles.ctaContent, styles.animateHiddenScale, ctaVisible && styles.animateVisible)}
                >
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
