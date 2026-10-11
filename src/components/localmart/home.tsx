import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import foodImg from '@/assets/hero/food.png';
import fashionImg from '@/assets/hero/fashion.png';
import homeDecorImg from '@/assets/hero/home-decor.png';
import beautyWellnessImg from '@/assets/hero/beauty-wellness.png';
import stationeryImg from '@/assets/hero/stationery.png';
import heroNewsletter from '@/assets/localmart-hero.jpg';
import stories from '@/assets/local-stories.jpg';
import {
  Button,
  Link,
  ArrowRight,
  SectionHeading,
  ProductsSection,
  Categories,
  features,
  Loading,
} from './shared';

const HERO_SLIDES = [
  {
    id: 1,
    title: 'Food & Bakery',
    src: foodImg,
    alt: 'Local food and bakery products',
  },
  {
    id: 2,
    title: 'Fashion & Accessories',
    src: fashionImg,
    alt: 'Local fashion and accessories',
  },
  {
    id: 3,
    title: 'Home Decor & Handicrafts',
    src: homeDecorImg,
    alt: 'Local handmade home decor',
  },
  {
    id: 4,
    title: 'Beauty & Wellness',
    src: beautyWellnessImg,
    alt: 'Local beauty and wellness products',
  },
  {
    id: 5,
    title: 'Gifts, Stationery & Lifestyle',
    src: stationeryImg,
    alt: 'Local gifts and lifestyle products',
  },
];

export function Home() {
  const [email, setEmail] = useState('');
  const [notice, setNotice] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Automatic 5-second rotation with hover-pause on desktop
  useEffect(() => {
    if (!isPaused) {
      startTimer();
    } else {
      stopTimer();
    }
    return () => {
      stopTimer();
    };
  }, [isPaused, startTimer, stopTimer]);

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
    // Reset timer on manual dot switch
    if (!isPaused) {
      startTimer();
    }
  };

  return (
    <>
      <section
        className="hero"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        aria-roledescription="carousel"
        aria-label="Local businesses highlight carousel"
      >
        <div className="hero-slides" aria-live="polite">
          {HERO_SLIDES.map((slide, idx) => (
            <img
              key={slide.id}
              src={slide.src}
              alt={slide.alt}
              className={`hero-slide ${idx === currentSlide ? 'active' : ''}`}
              width={1920}
              height={800}
              fetchPriority={idx === 0 ? 'high' : 'low'}
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
          ))}
        </div>

        <div className="hero-content">
          <div className="eyebrow">SMALL BUSINESSES. EXTRAORDINARY FINDS.</div>
          <h1>
            Discover the best
            <br />
            from local businesses.
          </h1>
          <p>
            Find products you love from businesses
            <br />
            around your community.
          </p>
          <Button asChild className="hero-cta">
            <Link to="/catalog">
              EXPLORE MARKETPLACE <ArrowRight />
            </Link>
          </Button>
          <Link to="/business" className="hero-secondary">
            Discover the people behind the products <ArrowRight />
          </Link>

          <div className="hero-dots" role="tablist" aria-label="Hero slide navigation">
            {HERO_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={idx === currentSlide}
                aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                className={`hero-dot ${idx === currentSlide ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleDotClick(idx);
                }}
              />
            ))}
          </div>
        </div>

        <span className="hero-caption">
          A celebration of craft, community & everyday discoveries
        </span>
      </section>

      <Suspense fallback={<Loading />}>
        <Categories />
        <ProductsSection />
      </Suspense>

      <section className="about-band">
        <div className="wrap">
          <SectionHeading title="WHAT IS LOCALMART?" />
          <p className="about-copy">
            A world of local discoveries, brought a little closer. LOCALMART connects you with small
            <br className="hidden md:block" /> businesses and their products through one database-driven marketplace.
          </p>
          <div className="about-features">
            <div>
              <h3>DISCOVER LOCAL</h3>
              <p>Find products from nearby businesses.</p>
            </div>
            <div>
              <h3>SHOP WITH CONFIDENCE</h3>
              <p>See product, stock and rating information.</p>
            </div>
            <div>
              <h3>SUPPORT SMALL</h3>
              <p>Help local businesses reach more customers.</p>
            </div>
          </div>
          <Link to="/about" className="text-link">
            A little more about us <ArrowRight />
          </Link>
        </div>
      </section>

      <section className="section wrap">
        <SectionHeading title="THE LOCALMART PROMISE" />
        <div className="standards-grid">
          {features.map(({ Icon, title, text }) => (
            <div key={title}>
              <div className="standard-icon">
                <Icon />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <Suspense fallback={<Loading />}>
        <ProductsSection popular />
      </Suspense>

      <section className="section wrap">
        <SectionHeading
          title="GOOD THINGS START LOCAL"
          subtitle="Behind every discovery, there’s a story worth knowing."
        />
        <div className="stories-grid">
          {[
            {
              position: 'left',
              tag: 'THE PEOPLE',
              title: 'Meet local sellers',
              link: 'Discover their stores',
              to: '/business' as const,
            },
            {
              position: 'middle',
              tag: 'THE NEIGHBOURHOOD',
              title: 'Discover nearby products',
              link: 'Explore the marketplace',
              to: '/catalog' as const,
            },
            {
              position: 'right',
              tag: 'THE LITTLE DIFFERENCE',
              title: 'Shop local. Support local.',
              link: 'Find your next favourite',
              to: '/catalog' as const,
            },
          ].map((item) => (
            <article className="story-card" key={item.title}>
              <div className={`story-image ${item.position}`}>
                <img src={stories} alt={item.title} width={1536} height={640} loading="lazy" />
              </div>
              <p className="eyebrow">{item.tag}</p>
              <h3>{item.title}</h3>
              <Link to={item.to}>
                {item.link}
                <ArrowRight />
              </Link>
            </article>
          ))}
        </div>
        <div className="coral-rule" />
      </section>

      <section className="community">
        <h2>JOIN THE LOCALMART COMMUNITY</h2>
        <p>
          Discover something special in your own neighbourhood.
          <br />
          Every local purchase makes a little difference.
        </p>
        <Button asChild className="hero-cta">
          <Link to="/catalog">
            EXPLORE NOW <ArrowRight />
          </Link>
        </Button>
      </section>

      <section className="newsletter">
        <img
          src={heroNewsletter}
          alt="Artisan products on a workshop table"
          width={1920}
          height={800}
          loading="lazy"
        />
        <h2>
          Stay connected with your
          <br />
          local marketplace.
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setNotice('Subscriptions aren’t available yet. Your email has not been saved.');
          }}
        >
          <input
            type="email"
            required
            aria-label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
          />
          <Button type="submit" size="sm">
            SUBSCRIBE
          </Button>
        </form>
        {notice && (
          <p className="newsletter-status" role="status">
            {notice}
          </p>
        )}
      </section>
    </>
  );
}
