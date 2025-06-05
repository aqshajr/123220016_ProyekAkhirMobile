import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const OnboardingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      title: 'Jelajahi Warisan Budaya',
      description: 'Temukan keajaiban candi-candi bersejarah Indonesia dan pelajari kisah di balik setiap batu.',
      image: 'https://images.unsplash.com/photo-1555400082-8c5cd5b3c3b1?w=400&h=300&fit=crop&crop=center'
    },
    {
      title: 'Scan & Pelajari Artefak',
      description: 'Gunakan kamera untuk memindai artefak dan dapatkan informasi mendalam tentang sejarahnya.',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center'
    },
    {
      title: 'Beli Tiket dengan Mudah',
      description: 'Pesan tiket masuk candi favorit Anda langsung dari aplikasi dengan proses yang cepat dan aman.',
      image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop&crop=center'
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate('/login');
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const skipToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-secondary-light flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <button
          onClick={prevSlide}
          className={`p-2 rounded-lg ${currentSlide === 0 ? 'invisible' : 'text-gray hover:text-secondary'}`}
        >
          <ChevronLeft size={24} />
        </button>
        
        <button
          onClick={skipToLogin}
          className="text-gray text-sm font-medium hover:text-secondary transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="text-center">
          {/* Image */}
          <div className="w-80 h-80 mx-auto mb-8 rounded-3xl overflow-hidden shadow-xl">
            <img 
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title & Description */}
          <h1 className="text-2xl font-bold text-secondary mb-4">
            {slides[currentSlide].title}
          </h1>
          <p className="text-gray text-base leading-relaxed mb-8 max-w-sm mx-auto">
            {slides[currentSlide].description}
          </p>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2 mb-8">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6">
        <button
          onClick={nextSlide}
          className="btn btn-primary btn-full btn-lg flex items-center justify-between"
        >
          <span>{currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}</span>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default OnboardingPage; 