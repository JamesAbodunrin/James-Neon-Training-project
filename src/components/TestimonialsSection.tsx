'use client';

import { useEffect, useRef } from 'react';

interface Testimonial {
  name: string;
  role: string;
  university: string;
  content: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    name: 'Sarah Johnson',
    role: 'PhD Candidate',
    university: 'MIT',
    content: 'ThesisAnalyzer transformed my research workflow. The visualization tools helped me discover patterns I never would have found otherwise.',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Graduate Student',
    university: 'Stanford University',
    content: 'Incredible platform! The pivot table feature saved me weeks of manual data analysis. Highly recommend for any thesis work.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Research Assistant',
    university: 'Harvard University',
    content: 'The collaborative features made it easy to work with my advisor. Real-time updates and sharing capabilities are outstanding.',
    rating: 5,
  },
  {
    name: 'David Kim',
    role: 'Master\'s Student',
    university: 'UC Berkeley',
    content: 'As someone new to data analysis, ThesisAnalyzer made complex statistical analysis accessible and intuitive.',
    rating: 5,
  },
  {
    name: 'Lisa Anderson',
    role: 'PhD Student',
    university: 'Oxford University',
    content: 'The export features and multiple format support made it seamless to integrate my analysis into my thesis document.',
    rating: 5,
  },
  {
    name: 'James Wilson',
    role: 'Graduate Researcher',
    university: 'Cambridge University',
    content: 'Fast, reliable, and powerful. ThesisAnalyzer is now an essential tool in my research toolkit.',
    rating: 5,
  },
];

interface TestimonialsSectionProps {
  className?: string;
}

export default function TestimonialsSection({ className = '' }: TestimonialsSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollPosition = 0;
    const scrollSpeed = 1;

    function scroll() {
      scrollPosition += scrollSpeed;
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0;
      }
      scrollContainer.scrollLeft = scrollPosition;
      requestAnimationFrame(scroll);
    }

    const animationId = requestAnimationFrame(scroll);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Duplicate testimonials for seamless loop
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <section className={`py-20 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Students Are Saying
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of students who have transformed their thesis research
          </p>
        </div>
        <div
          ref={scrollRef}
          className="overflow-x-hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex gap-6" style={{ width: 'max-content' }}>
            {duplicatedTestimonials.map((testimonial, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-80 bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl shadow-md"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div className="border-t border-gray-200 pt-4">
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-sm text-gray-500">{testimonial.university}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

