// src/components/InfiniteRedSquareCarousel.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import './OfferCard.css';

const RedSquareCarousel: React.FC = () => {
  const offers = [
    { id: 1, badge: "Έκπτωση 20%", title: "Σαββατιάτικη Προσφορά", description: "Κάθε Σάββατο από τις 18:00 έως τις 22:00, απολαύστε 20% έκπτωση σε όλα τα σουβλάκια μας." },
    { id: 2, badge: "1+1 Δώρο", title: "Προσφορά Ομάδας", description: "Παραγγείλετε 10 σουβλάκια και πάρτε το 11ο εντελώς δωρεάν!" },
    { id: 3, badge: "3+1", title: "Οικογενειακή Προσφορά", description: "Ιδανική για παρέες και οικογένειες – παραγγείλετε 3 σουβλάκια και το 4ο είναι δώρο!" },
  ];

  const squares = Array.from({ length: 3 }, (_, i) => i);
  const [squareWidth, setSquareWidth] = useState(0);
  const [isPaused, setIsPaused] = useState(false); // track if auto-scroll is paused
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const transitionDuration = 500; // ms
  const pauseDuration = 2000; // ms
  const currentIndexRef = useRef(0);
  const moveToIndex = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;

    currentIndexRef.current = index;

    container.style.transition = `transform ${transitionDuration}ms ease-in-out`;
    container.style.transform = `translateX(-${index * squareWidth}px)`;

    if (index === squares.length) {
      setTimeout(() => {
        container.style.transition = "none";
        currentIndexRef.current = 0;
        container.style.transform = `translateX(0px)`;
      }, transitionDuration);
    }
  }, [squares.length, squareWidth, transitionDuration]);

  useEffect(() => {
    setSquareWidth(window.innerWidth - 16);
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const move = () => moveToIndex(currentIndexRef.current + 1);

    intervalRef.current = setInterval(move, transitionDuration + pauseDuration);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [moveToIndex, isPaused, transitionDuration, pauseDuration]);

  // Handlers for buttons
  const handlePrev = () => {
    setIsPaused(true);
    const prevIndex = currentIndexRef.current === 0 ? squares.length - 1 : currentIndexRef.current - 1;
    moveToIndex(prevIndex);
  };

  const handleNext = () => {
    setIsPaused(true);
    const nextIndex = currentIndexRef.current + 1;
    moveToIndex(nextIndex);
  };

  return (
    <div
      className="w-screen relative"
      style={{
        backgroundImage: "url('/souvlakiBG2.jpg')",
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Static Title */}
      <div className="text-white text-3xl font-bold text-center py-12 z-10 relative">
        Προσφορές
      </div>

      {/* Carousel Wrapper */}
      <div className="overflow-hidden w-screen relative">
        <div
          ref={containerRef}
          className="flex gap-4"
          style={{ width: `${offers.length * 2 * squareWidth}px` }}
        >
          {[...offers, ...offers].map((offer, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 flex items-center justify-center text-white text-3xl font-bold"
              style={{
                width: `${squareWidth - 16}px`,
                height: `auto`,
                padding: '20px 0',
                backgroundColor: "transparent",
              }}
            >
              <div className="offer-card">
                <div className="offer-card-header">
                  <div className="offer-badge">{offer.badge}</div>
                  <h3 className="offer-title">{offer.title}</h3>
                </div>
                <p className="offer-description">{offer.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <button
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-400 opacity-80 hover:bg-gray-500 text-white px-4 py-2 rounded"
          onClick={handlePrev}
        >
          ◀
        </button>
        <button
          className="absolute top-1/2 right-4 md:right-8 transform -translate-y-1/2 bg-gray-400 opacity-80 hover:bg-gray-500 text-white px-4 py-2 rounded"
          onClick={handleNext}
        >
          ▶
        </button>
      </div>
    </div>
  );
};

export default RedSquareCarousel;
