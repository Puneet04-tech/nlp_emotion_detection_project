import { useEffect, useRef } from 'react';

export const useMouse3D = (intensity = 10) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleMouseMove = (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * intensity;
      const rotateY = ((centerX - x) / centerX) * intensity;

      element.style.transform = `
        perspective(1000px) 
        rotateX(${rotateX}deg) 
        rotateY(${rotateY}deg)
        translateZ(10px)
      `;
    };

    const handleMouseLeave = () => {
      element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [intensity]);

  return elementRef;
};

export const useParallax = (speed = 0.5) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallax = scrolled * speed;
      element.style.transform = `translateZ(${parallax}px)`;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return elementRef;
};

export const useFloating = (duration = 6000) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.style.animation = `float3d ${duration}ms ease-in-out infinite`;
    
    return () => {
      element.style.animation = '';
    };
  }, [duration]);

  return elementRef;
};
