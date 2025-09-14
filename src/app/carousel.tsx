// src/components/InfiniteRedSquareCarousel.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import './OfferCard.css';

const RedSquareCarousel: React.FC = () => {
  const squares = Array.from({ length: 3 }, (_, i) => i);
  const [squareWidth, setSquareWidth] = useState(0);

  useEffect(() => {
    setSquareWidth(window.innerWidth - 16);
  }, []);

  const offers = [
    {
      id: 1,
      badge: "Έκπτωση 20%",
      title: "Σαββατιάτικη Προσφορά",
      description: "Κάθε Σάββατο από τις 18:00 έως τις 22:00, απολαύστε 20% έκπτωση σε όλα τα σουβλάκια μας.",
    },
    {
      id: 2,
      badge: "1+1 Δώρο",
      title: "Προσφορά Ομάδας",
      description: "Παραγγείλετε 10 σουβλάκια και πάρτε το 11ο εντελώς δωρεάν!",
    },
    {
      id: 3,
      badge: "3+1",
      title: "Οικογενειακή Προσφορά",
      description: "Ιδανική για παρέες και οικογένειες – παραγγείλετε 3 σουβλάκια και το 4ο είναι δώρο!",
    },
  ];


  const containerRef = useRef<HTMLDivElement>(null);

  const transitionDuration = 500; // ms
  const pauseDuration = 2000; // ms

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let currentIndex = 0;
    const totalSquares = squares.length;

    const move = () => {
      currentIndex++;
      container.style.transition = `transform ${transitionDuration}ms ease-in-out`;
      container.style.transform = `translateX(-${currentIndex * (squareWidth)}px)`;

      if (currentIndex === totalSquares) {
        setTimeout(() => {
          container.style.transition = "none";
          currentIndex = 0;
          container.style.transform = `translateX(0px)`;
        }, transitionDuration);
      }
    };

    const interval = setInterval(move, transitionDuration + pauseDuration);
    return () => clearInterval(interval);
  }, [squares.length, squareWidth]);

  return (
    <div
    className="w-screen"
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
                    <div className="offer-badge">
                    {offer.badge}
                    </div>
                    <h3 className="offer-title">{offer.title}</h3>
                </div>
                <p className="offer-description">{offer.description}</p>
                <button className="offer-button">Δες περισσότερα →</button>
                </div>
            </div>
        ))}
        </div>
    </div>
    </div>

);

};

export default RedSquareCarousel;