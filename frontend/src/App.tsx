import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChallengeSections } from './components/ChallengeSections';
import { Hero } from './components/Hero';
import MemoryGame from './components/MemoryGame';

gsap.registerPlugin(useGSAP, ScrollTrigger);

function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.hero-element', {
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out',
      delay: 0.2,
    });

    gsap.to('.spark', {
      y: 'random(-50, 50)',
      x: 'random(-50, 50)',
      duration: 'random(2, 4)',
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      stagger: 0.5,
    });

    gsap.from('.pixel-tile', {
      scale: 0.82,
      opacity: 0,
      duration: 0.75,
      stagger: 0.08,
      ease: 'steps(8)',
      delay: 0.8,
    });

    gsap.utils.toArray<HTMLElement>('.game-card').forEach((card) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
        },
        y: 100,
        opacity: 0,
        duration: 1,
        ease: 'back.out(1.7)',
      });
    });

    gsap.utils.toArray<HTMLElement>('.extra-card').forEach((card, index) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
        },
        y: 80,
        opacity: 0,
        duration: 0.8,
        delay: index * 0.15,
        ease: 'power3.out',
      });
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="w-full min-h-screen bg-[#1f2120] font-sans overflow-x-hidden">
      <Hero />

      <section className="relative w-full bg-[#1f2120] py-16 px-6 md:px-16 flex flex-col items-center z-20">
        <div className="mb-8 flex w-full max-w-5xl items-center justify-between gap-4 rounded-sm border border-[#eeecd0]/20 bg-[#151715] px-4 py-3">
          <h2 className="pixel-font text-xl font-black text-[#eeecd0] md:text-3xl">Demo Phaser</h2>
          <span className="pulse-light h-3 w-3 rounded-full bg-[#f2b84b]" />
        </div>
        <MemoryGame />
      </section>

      <ChallengeSections />

      <footer className="w-full py-12 bg-[#151715] border-t border-[#eeecd0]/15 flex flex-col items-center">
        <h2 className="pixel-font text-2xl font-black text-[#d9e074] mb-4">MINDCHALLENGE</h2>
        <p className="text-[#9fa88f] font-medium text-sm">© 2026. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

export default App;
