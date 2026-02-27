import styles from './HeroSection.module.css';
import Header from '../../../components/Header/Header';
import ReadyForFaster from '../ReadyForFaster/ReadyForFaster';
import HeroVideo from '../../../assets/HomePage/Video_HomePage.mp4';

const HeroSection = () => {
    return (
        <section className={styles.heroSection}>
            {/* Single Video Background for both Header and ReadyForFaster */}
            <video
                className={styles.videoBackground}
                autoPlay
                loop
                muted
                playsInline
            >
                <source src={HeroVideo} type="video/mp4" />
            </video>

            {/* Dark overlay for better text visibility */}
            <div className={styles.overlay}></div>

            {/* Content */}
            <div className={styles.content}>
                <Header />
                <ReadyForFaster />
            </div>
        </section>
    );
};

export default HeroSection;
