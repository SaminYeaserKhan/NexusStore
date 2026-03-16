// src/pages/Home.jsx
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown, ShieldCheck, Truck, Zap } from "lucide-react";
import { useRef } from "react";
import { DEFAULT_CATEGORY_TREE } from "../lib/categories";

const categories = [
  {
    to: "/shop?category=Electronics",
    title: "Electronics",
    subtitle: "Precision devices, everyday speed.",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1400&q=85",
  },
  {
    to: "/shop?category=Fashion",
    title: "Fashion",
    subtitle: "Sharp fits and expressive details.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=85",
  },
  {
    to: "/shop?category=Home",
    title: "Home & Living",
    subtitle: "Minimal spaces with warm character.",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1400&q=85",
  },
];

const valueProps = [
  {
    icon: Truck,
    title: "Fast Delivery",
    text: "Real-time order updates with rapid city dispatch.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Checkout",
    text: "Trusted payment flow and reliable purchase protection.",
  },
  {
    icon: Zap,
    title: "Smart Discovery",
    text: "Find products faster with intelligent, curated browsing.",
  },
];

const visualByCategory = {
  Electronics: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&q=80",
  Fashion: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80",
  Home: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
};

const visualBySubCategory = {
  Smartphones: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&q=80",
  Laptops: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=1200&q=80",
  Headsets: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80",
  Keyboards: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=1200&q=80",
  Mice: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=1200&q=80",
  Cameras: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&q=80",
  Monitors: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&q=80",
  "Men's Clothing": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1200&q=80",
  "Women's Clothing": "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&q=80",
  Shoes: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80",
  Watches: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1200&q=80",
  Accessories: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=1200&q=80",
  Furniture: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80",
  Decor: "https://images.unsplash.com/photo-1513161455079-7dc1de15ef3e?w=1200&q=80",
  Kitchen: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80",
  Lighting: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1200&q=80",
};

const scrollingItems = Object.entries(DEFAULT_CATEGORY_TREE).flatMap(([category, subs]) => {
  const categoryItem = {
    key: `cat-${category}`,
    title: category,
    subtitle: "Category",
    to: `/shop?category=${encodeURIComponent(category)}`,
    image: visualByCategory[category] || "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&q=80",
  };

  const subItems = subs.map((sub) => ({
    key: `sub-${category}-${sub}`,
    title: sub,
    subtitle: category,
    to: `/shop?category=${encodeURIComponent(category)}`,
    image: visualBySubCategory[sub] || visualByCategory[category] || "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&q=80",
  }));

  return [categoryItem, ...subItems];
});

const Home = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroTitleY = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.2]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.14),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(217,70,239,0.14),transparent_32%),radial-gradient(circle_at_50%_80%,rgba(14,165,233,0.14),transparent_30%)]" />

      <div className="relative z-10">
        <section ref={heroRef} className="min-h-[110vh] px-4 pt-8 sm:px-6 lg:px-10">
          <div className="mx-auto flex min-h-[95vh] w-full max-w-7xl items-start justify-center pt-6 sm:pt-12 lg:pt-16">
            <motion.div
              style={{ y: heroTitleY, opacity: heroOpacity }}
              className="text-center"
            >
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-block rounded-full border border-white/20 bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-dark-900/50 dark:text-gray-300"
              >
                NexusStore 2026 Collection
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="mt-6 text-5xl font-black leading-[0.9] tracking-tight text-gray-900 sm:text-6xl lg:text-8xl dark:text-white"
              >
                A Better Way
                <br />
                to Shop Online.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mx-auto mt-6 max-w-2xl text-base text-gray-600 sm:text-lg dark:text-gray-300"
              >
                Elevated product discovery, premium visuals, and a smoother buying journey from first scroll to checkout.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
              >
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-7 py-4 text-sm font-semibold text-white shadow-xl shadow-gray-900/20 transition-transform hover:-translate-y-0.5 dark:bg-white dark:text-gray-900"
                >
                  Explore Products
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/shop?category=Electronics"
                  className="inline-flex items-center gap-2 rounded-2xl border border-gray-300 bg-white/80 px-7 py-4 text-sm font-semibold text-gray-900 backdrop-blur transition-transform hover:-translate-y-0.5 dark:border-white/20 dark:bg-dark-900/50 dark:text-white"
                >
                  Jump to Electronics
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.45 }}
                className="relative mx-auto mt-16 w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/20 bg-white/65 p-4 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-dark-900/45"
              >
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white/90 to-transparent dark:from-dark-900/80" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-white/90 to-transparent dark:from-dark-900/80" />

                <motion.div
                  className="flex w-max gap-4"
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
                >
                  {[...scrollingItems, ...scrollingItems].map((item, idx) => (
                    <Link
                      key={`hero-${item.key}-${idx}`}
                      to={item.to}
                      className="group relative h-44 w-56 shrink-0 overflow-hidden rounded-2xl border border-white/25 bg-black sm:h-48 sm:w-60"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-110 group-hover:opacity-65"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 text-left">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75">
                          {item.subtitle}
                        </p>
                        <h3 className="mt-1 text-base font-bold text-white sm:text-lg">{item.title}</h3>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-500 dark:text-gray-400"
          >
            <ChevronDown className="h-6 w-6" />
          </motion.div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-end justify-between gap-4">
              <h2 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                Scroll Through Collections
              </h2>
              <Link to="/shop" className="text-sm font-semibold text-primary-600 dark:text-primary-300">
                View all
              </Link>
            </div>

            <div className="space-y-8">
              {categories.map((card, index) => (
                <section key={card.title} className="relative h-[72vh] min-h-[460px]">
                  <motion.div
                    initial={{ opacity: 0, y: 60, scale: 0.96 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.45 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="sticky top-24 h-[66vh] overflow-hidden rounded-[2rem] border border-white/20 bg-black shadow-2xl dark:border-white/10"
                  >
                    <img
                      src={card.image}
                      alt={card.title}
                      className="h-full w-full object-cover opacity-75"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />

                    <div className="absolute inset-0 flex items-end p-7 sm:p-10">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                          Collection {index + 1}
                        </p>
                        <h3 className="mt-2 text-3xl font-black text-white sm:text-5xl">
                          {card.title}
                        </h3>
                        <p className="mt-3 max-w-lg text-sm text-white/85 sm:text-base">
                          {card.subtitle}
                        </p>
                        <Link
                          to={card.to}
                          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/90 px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-white"
                        >
                          Enter {card.title}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                </section>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-10 sm:px-6 lg:px-10">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-3">
            {valueProps.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="rounded-3xl border border-white/20 bg-white/70 p-6 shadow-lg backdrop-blur dark:border-white/10 dark:bg-dark-900/45"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{item.text}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        <footer className="px-4 pb-12 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-7xl rounded-3xl border border-white/20 bg-white/70 px-6 py-8 backdrop-blur dark:border-white/10 dark:bg-dark-900/45">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">NexusStore</p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Elevated shopping for tech, fashion, and home.</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/shop" className="rounded-xl border border-gray-300 bg-white/80 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:-translate-y-0.5 dark:border-white/20 dark:bg-dark-900/50 dark:text-white">
                  Shop
                </Link>
                <Link to="/dashboard" className="rounded-xl border border-gray-300 bg-white/80 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:-translate-y-0.5 dark:border-white/20 dark:bg-dark-900/50 dark:text-white">
                  Dashboard
                </Link>
                <Link to="/cart" className="rounded-xl border border-gray-300 bg-white/80 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:-translate-y-0.5 dark:border-white/20 dark:bg-dark-900/50 dark:text-white">
                  Cart
                </Link>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-4 text-xs text-gray-500 dark:border-white/10 dark:text-gray-400">
              Copyright 2026 NexusStore. All rights reserved.
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default Home;
