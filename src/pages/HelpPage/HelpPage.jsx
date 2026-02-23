import { useState } from 'react';
import Header from '../../components/Header/Header';
import styles from './HelpPage.module.css';
import useScrollAnimation from '../../hooks/useScrollAnimation';

const cls = (...classes) => classes.filter(Boolean).join(' ');

const HelpPage = () => {
    const [openFAQ, setOpenFAQ] = useState(null);

    const toggleFAQ = (index) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    // Scroll animation refs
    const [heroRef, heroVisible] = useScrollAnimation(0.1);
    const [quickLinksRef, quickLinksVisible] = useScrollAnimation(0.15);
    const [faqHeaderRef, faqHeaderVisible] = useScrollAnimation(0.2);
    const [faq0Ref, faq0Visible] = useScrollAnimation(0.1);
    const [faq1Ref, faq1Visible] = useScrollAnimation(0.1);
    const [faq2Ref, faq2Visible] = useScrollAnimation(0.1);
    const [contactHeaderRef, contactHeaderVisible] = useScrollAnimation(0.2);
    const [contact0Ref, contact0Visible] = useScrollAnimation(0.1);
    const [contact1Ref, contact1Visible] = useScrollAnimation(0.1);
    const [contact2Ref, contact2Visible] = useScrollAnimation(0.1);
    const [safetyHeaderRef, safetyHeaderVisible] = useScrollAnimation(0.2);
    const [safety0Ref, safety0Visible] = useScrollAnimation(0.1);
    const [safety1Ref, safety1Visible] = useScrollAnimation(0.1);
    const [safety2Ref, safety2Visible] = useScrollAnimation(0.1);
    const [safety3Ref, safety3Visible] = useScrollAnimation(0.1);
    const [safety4Ref, safety4Visible] = useScrollAnimation(0.1);
    const [safety5Ref, safety5Visible] = useScrollAnimation(0.1);
    const [startedHeaderRef, startedHeaderVisible] = useScrollAnimation(0.2);
    const [step0Ref, step0Visible] = useScrollAnimation(0.1);
    const [step1Ref, step1Visible] = useScrollAnimation(0.1);
    const [step2Ref, step2Visible] = useScrollAnimation(0.1);
    const [ctaRef, ctaVisible] = useScrollAnimation(0.15);

    const staggerDelays = [styles.delay100, styles.delay200, styles.delay300, styles.delay400, styles.delay500, styles.delay600];

    const faqRefs = [
        [faq0Ref, faq0Visible],
        [faq1Ref, faq1Visible],
        [faq2Ref, faq2Visible],
    ];

    const contactRefs = [
        [contact0Ref, contact0Visible],
        [contact1Ref, contact1Visible],
        [contact2Ref, contact2Visible],
    ];

    const safetyRefs = [
        [safety0Ref, safety0Visible],
        [safety1Ref, safety1Visible],
        [safety2Ref, safety2Visible],
        [safety3Ref, safety3Visible],
        [safety4Ref, safety4Visible],
        [safety5Ref, safety5Visible],
    ];

    const stepRefs = [
        [step0Ref, step0Visible],
        [step1Ref, step1Visible],
        [step2Ref, step2Visible],
    ];

    const faqs = [
        {
            category: 'Buying',
            questions: [
                {
                    question: 'How do I know if a bicycle is verified?',
                    answer: 'All verified bicycles have a "✓ Verified" badge displayed on their listing. This means our professional inspectors have thoroughly checked the bicycle\'s condition, authenticity, and specifications.'
                },
                {
                    question: 'What payment methods do you accept?',
                    answer: 'We accept all major credit cards, debit cards, PayPal, and bank transfers. All transactions are secured and encrypted for your safety.'
                },
                {
                    question: 'Can I return a bicycle if I\'m not satisfied?',
                    answer: 'Yes! We offer a 7-day return policy for all verified bicycles. If the bicycle doesn\'t match the description or you\'re not satisfied, you can initiate a return through your account dashboard.'
                },
                {
                    question: 'How long does shipping take?',
                    answer: 'Shipping typically takes 3-7 business days depending on your location. You\'ll receive tracking information once your bicycle has been shipped.'
                }
            ]
        },
        {
            category: 'Selling',
            questions: [
                {
                    question: 'How do I list my bicycle for sale?',
                    answer: 'Create an account, click on "Sell Your Bike", fill in the details about your bicycle including photos, specifications, and condition. Submit your listing and our team will review it within 24 hours.'
                },
                {
                    question: 'What is the verification process?',
                    answer: 'Once you submit your listing, our certified inspectors will contact you to schedule an inspection. They will check the bicycle\'s condition, authenticity, and verify all details match your listing.'
                },
                {
                    question: 'What fees do you charge?',
                    answer: 'We charge a 10% service fee on successful sales. This fee covers the verification process, platform maintenance, and secure payment processing. There are no upfront fees to list your bicycle.'
                },
                {
                    question: 'How do I receive payment?',
                    answer: 'Once the buyer confirms receipt and is satisfied with the bicycle, payment is released to your account within 2-3 business days. You can withdraw funds to your bank account or PayPal.'
                }
            ]
        },
        {
            category: 'Account & Security',
            questions: [
                {
                    question: 'How do I create an account?',
                    answer: 'Click on "Sign Up" in the navigation bar, fill in your details including email and password, and verify your email address. You can then start buying or selling immediately.'
                },
                {
                    question: 'Is my personal information safe?',
                    answer: 'Absolutely. We use industry-standard encryption and security protocols to protect your personal and financial information. We never share your data with third parties without your consent.'
                },
                {
                    question: 'How do I reset my password?',
                    answer: 'Click on "Forgot Password" on the login page, enter your email address, and we\'ll send you a secure link to reset your password.'
                }
            ]
        }
    ];

    const contactMethods = [
        {
            title: 'Email Support',
            description: 'Get help from our support team',
            contact: 'support@bikehub.com',
            response: 'Response within 24 hours'
        },
        {
            title: 'Live Chat',
            description: 'Chat with us in real-time',
            contact: 'Available 9 AM - 6 PM',
            response: 'Instant response'
        },
        {
            title: 'Phone Support',
            description: 'Speak with our team',
            contact: '+1 (555) 123-4567',
            response: 'Mon-Fri, 9 AM - 6 PM'
        }
    ];

    const safetyTips = [
        {
            title: 'Verify Listings',
            tip: 'Always check for the verified badge and read the inspection report before purchasing.'
        },
        {
            title: 'Secure Payments',
            tip: 'Only use our platform\'s payment system. Never transfer money outside the platform.'
        },
        {
            title: 'Request Photos',
            tip: 'Ask sellers for additional photos or videos if you need more details about the bicycle.'
        },
        {
            title: 'Meet Safely',
            tip: 'If meeting in person, choose a public location and bring a friend if possible.'
        },
        {
            title: 'Read Reviews',
            tip: 'Check seller ratings and reviews from other buyers before making a purchase.'
        },
        {
            title: 'Trust Your Instincts',
            tip: 'If something feels wrong or too good to be true, contact our support team.'
        }
    ];

    return (
        <div className={styles.helpPage}>
            {/* Header */}
            <Header variant="dark" />
            <section className={styles.hero}>
                <div
                    ref={heroRef}
                    className={cls(styles.heroContent, styles.animateHidden, heroVisible && styles.animateVisible)}
                >
                    <h1 className={styles.heroTitle}>How Can We Help?</h1>
                    <p className={cls(styles.heroSubtitle, styles.delay200, heroVisible && styles.animateVisible)}>
                        Find answers to common questions or reach out to our support team
                    </p>
                </div>
            </section>

            {/* Quick Links */}
            <section className={styles.quickLinks}>
                <div
                    ref={quickLinksRef}
                    className={cls(styles.container, styles.animateHiddenLeft, quickLinksVisible && styles.animateVisible)}
                >
                    <a href="#faq" className={cls(styles.quickLink, staggerDelays[0])}>
                        <span>FAQ</span>
                    </a>
                    <a href="#contact" className={cls(styles.quickLink, staggerDelays[1])}>
                        <span>Contact</span>
                    </a>
                    <a href="#safety" className={cls(styles.quickLink, staggerDelays[2])}>
                        <span>Safety</span>
                    </a>
                    <a href="#started" className={cls(styles.quickLink, staggerDelays[3])}>
                        <span>Get Started</span>
                    </a>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className={styles.faqSection}>
                <div className={styles.container}>
                    <div
                        ref={faqHeaderRef}
                        className={cls(styles.sectionHeader, styles.animateHidden, faqHeaderVisible && styles.animateVisible)}
                    >
                        <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
                        <p className={styles.sectionSubtitle}>
                            Quick answers to questions you may have
                        </p>
                    </div>

                    {faqs.map((category, categoryIndex) => {
                        const [ref, visible] = faqRefs[categoryIndex];
                        return (
                            <div
                                key={categoryIndex}
                                ref={ref}
                                className={cls(styles.faqCategory, styles.animateHidden, visible && styles.animateVisible, staggerDelays[categoryIndex])}
                            >
                                <h3 className={styles.categoryTitle}>{category.category}</h3>
                                <div className={styles.faqList}>
                                    {category.questions.map((faq, faqIndex) => {
                                        const globalIndex = `${categoryIndex}-${faqIndex}`;
                                        const isOpen = openFAQ === globalIndex;

                                        return (
                                            <div
                                                key={faqIndex}
                                                className={cls(styles.faqItem, isOpen ? styles.faqItemOpen : '')}
                                            >
                                                <button
                                                    className={styles.faqQuestion}
                                                    onClick={() => toggleFAQ(globalIndex)}
                                                >
                                                    <span>{faq.question}</span>
                                                    <span className={styles.faqToggle}>
                                                        {isOpen ? '−' : '+'}
                                                    </span>
                                                </button>
                                                {isOpen && (
                                                    <div className={styles.faqAnswer}>
                                                        {faq.answer}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Contact Support */}
            <section id="contact" className={styles.contactSection}>
                <div className={styles.container}>
                    <div
                        ref={contactHeaderRef}
                        className={cls(styles.sectionHeader, styles.animateHidden, contactHeaderVisible && styles.animateVisible)}
                    >
                        <h2 className={styles.sectionTitle}>Contact Support</h2>
                        <p className={styles.sectionSubtitle}>
                            Can&apos;t find what you&apos;re looking for? We&apos;re here to help
                        </p>
                    </div>

                    <div className={styles.contactGrid}>
                        {contactMethods.map((method, index) => {
                            const [ref, visible] = contactRefs[index];
                            return (
                                <div
                                    key={index}
                                    ref={ref}
                                    className={cls(styles.contactCard, styles.animateHidden, visible && styles.animateVisible, staggerDelays[index])}
                                >
                                    <h3 className={styles.contactTitle}>{method.title}</h3>
                                    <p className={styles.contactDescription}>{method.description}</p>
                                    <p className={styles.contactInfo}>{method.contact}</p>
                                    <p className={styles.contactResponse}>{method.response}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Safety Tips */}
            <section id="safety" className={styles.safetySection}>
                <div className={styles.container}>
                    <div
                        ref={safetyHeaderRef}
                        className={cls(styles.sectionHeader, styles.animateHidden, safetyHeaderVisible && styles.animateVisible)}
                    >
                        <h2 className={styles.sectionTitle}>Safety Tips</h2>
                        <p className={styles.sectionSubtitle}>
                            Stay safe while buying and selling on BikeHub
                        </p>
                    </div>

                    <div className={styles.safetyGrid}>
                        {safetyTips.map((tip, index) => {
                            const [ref, visible] = safetyRefs[index];
                            return (
                                <div
                                    key={index}
                                    ref={ref}
                                    className={cls(styles.safetyCard, styles.animateHiddenScale, visible && styles.animateVisible, staggerDelays[index % 3])}
                                >
                                    <h3 className={styles.safetyTitle}>{tip.title}</h3>
                                    <p className={styles.safetyTip}>{tip.tip}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Getting Started */}
            <section id="started" className={styles.startedSection}>
                <div className={styles.container}>
                    <div
                        ref={startedHeaderRef}
                        className={cls(styles.sectionHeader, styles.animateHidden, startedHeaderVisible && styles.animateVisible)}
                    >
                        <h2 className={styles.sectionTitle}>Getting Started</h2>
                        <p className={styles.sectionSubtitle}>
                            New to BikeHub? Here&apos;s how to begin
                        </p>
                    </div>

                    <div className={styles.startedSteps}>
                        {[
                            { num: '01', title: 'Create Your Account', desc: 'Sign up with your email and verify your account. It only takes a minute.' },
                            { num: '02', title: 'Browse or List', desc: 'Explore verified bicycles or create your own listing to sell.' },
                            { num: '03', title: 'Complete Your Transaction', desc: 'Buy or sell with confidence using our secure payment system.' },
                        ].map((step, index) => {
                            const [ref, visible] = stepRefs[index];
                            return (
                                <div
                                    key={index}
                                    ref={ref}
                                    className={cls(styles.startedStep, styles.animateHidden, visible && styles.animateVisible, staggerDelays[index])}
                                >
                                    <div className={styles.stepNumber}>{step.num}</div>
                                    <h3 className={styles.stepTitle}>{step.title}</h3>
                                    <p className={styles.stepDescription}>{step.desc}</p>
                                </div>
                            );
                        })}
                    </div>

                    <div className={styles.startedCta}>
                        <button className={styles.btnStarted}>Get Started Now</button>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className={styles.cta}>
                <div
                    ref={ctaRef}
                    className={cls(styles.ctaContent, styles.animateHiddenScale, ctaVisible && styles.animateVisible)}
                >
                    <h2 className={styles.ctaTitle}>Still Have Questions?</h2>
                    <p className={styles.ctaSubtitle}>
                        Our support team is ready to help you
                    </p>
                    <button className={styles.btnCta}>Contact Support</button>
                </div>
            </section>
        </div>
    );
};

export default HelpPage;
