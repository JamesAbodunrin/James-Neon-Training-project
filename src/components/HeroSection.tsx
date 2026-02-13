'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface HeroSectionProps {
  className?: string;
}

export default function HeroSection({ className = '' }: HeroSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLearnMore = () => {
    const howSection = document.getElementById('how-to-use');
    if (howSection) {
      howSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleStartAnalysis = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = 600;

    // Data points for animation
    const dataPoints: Array<{ x: number; y: number; vx: number; vy: number; size: number; color: string }> = [];
    const chartElements: Array<{ x: number; y: number; width: number; height: number; vx: number }> = [];
    const pivotPoints: Array<{ x: number; y: number; radius: number; angle: number; speed: number }> = [];

    // Initialize data points
    for (let i = 0; i < 20; i++) {
      dataPoints.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 4 + 2,
        color: `hsl(${Math.random() * 60 + 200}, 70%, 60%)`,
      });
    }

    // Initialize chart bars
    for (let i = 0; i < 8; i++) {
      chartElements.push({
        x: (canvas.width / 8) * i + 50,
        y: canvas.height / 2,
        width: 30,
        height: Math.random() * 200 + 50,
        vx: 0.5,
      });
    }

    // Initialize pivot points
    for (let i = 0; i < 5; i++) {
      pivotPoints.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 80 + i * 40,
        angle: (Math.PI * 2 * i) / 5,
        speed: 0.01 + i * 0.005,
      });
    }

    function animate() {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connecting lines between data points
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
      ctx.lineWidth = 1;
      for (let i = 0; i < dataPoints.length; i++) {
        for (let j = i + 1; j < dataPoints.length; j++) {
          const dx = dataPoints[i].x - dataPoints[j].x;
          const dy = dataPoints[i].y - dataPoints[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(dataPoints[i].x, dataPoints[i].y);
            ctx.lineTo(dataPoints[j].x, dataPoints[j].y);
            ctx.stroke();
          }
        }
      }

      // Update and draw data points
      dataPoints.forEach((point) => {
        point.x += point.vx;
        point.y += point.vy;

        if (point.x < 0 || point.x > canvas.width) point.vx *= -1;
        if (point.y < 0 || point.y > canvas.height) point.vy *= -1;

        ctx.fillStyle = point.color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update and draw chart bars
      chartElements.forEach((bar) => {
        bar.x += bar.vx;
        if (bar.x > canvas.width) bar.x = -bar.width;

        const gradient = ctx.createLinearGradient(bar.x, bar.y - bar.height, bar.x, bar.y);
        gradient.addColorStop(0, '#6366f1');
        gradient.addColorStop(1, '#8b5cf6');

        ctx.fillStyle = gradient;
        ctx.fillRect(bar.x, bar.y - bar.height, bar.width, bar.height);
      });

      // Update and draw pivot points
      pivotPoints.forEach((pivot) => {
        pivot.angle += pivot.speed;
        const x = pivot.x + Math.cos(pivot.angle) * pivot.radius;
        const y = pivot.y + Math.sin(pivot.angle) * pivot.radius;

        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Draw line to center
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pivot.x, pivot.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = 600;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section className={`relative w-full overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ height: '600px' }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
            Interactive Thesis
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Analysis Platform
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your research data into actionable insights with powerful visualization tools
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleStartAnalysis}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-center"
            >
              Start Analysis
            </button>
            <button
              onClick={handleLearnMore}
              className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold text-lg border-2 border-gray-300 hover:border-blue-600 transition-all duration-300"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

