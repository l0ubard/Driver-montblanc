
import React, { useState, useEffect } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import { Section } from '../types';

interface NavbarProps {
  activeSection: Section;
  scrollToSection: (section: Section) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeSection, scrollToSection }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Style blanc opaque au scroll, transparent en haut
  const navClass = `fixed w-full z-50 transition-all duration-300 ${
    isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4 md:py-6'
  }`;

  const linkClass = (section: Section) => `
    cursor-pointer px-4 py-2 font-bold text-xs md:text-sm tracking-widest uppercase transition-colors font-display rounded-full
    ${activeSection === section 
      ? 'text-brand-500' 
      : (isScrolled ? 'text-dark-900 hover:text-brand-500' : 'text-white hover:text-brand-500')}
  `;

  const logoColor = isScrolled ? 'text-dark-900' : 'text-white';

  return (
    <nav className={navClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer group gap-3" 
            onClick={() => scrollToSection(Section.HOME)}
          >
            {/* Logo SVG Pro - Badge Premium Montagne */}
            <div className="w-12 h-12 md:w-14 md:h-14 flex-shrink-0">
               <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" xmlns="http://www.w3.org/2000/svg" fill="none">
                  {/* Cercle extérieur (Badge) */}
                  <circle cx="50" cy="50" r="45" stroke="#F2541B" strokeWidth="3" fill="white" className="opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
                  
                  {/* Montagne Principale */}
                  <path d="M50 20 L85 80 H15 L50 20 Z" fill="#F2541B" />
                  
                  {/* Ombre/Relief Montagne */}
                  <path d="M50 20 L50 80 L85 80 Z" fill="#d94e18" />
                  
                  {/* Sommet Enneigé */}
                  <path d="M50 20 L38 42 L50 35 L62 42 L50 20 Z" fill="white" />
                  
                  {/* Route Stylisée en bas */}
                  <path d="M35 85 Q50 75 65 85" stroke="#F2541B" strokeWidth="4" strokeLinecap="round"/>
               </svg>
            </div>
            
            <div className={`flex flex-col ${logoColor}`}>
              <span className="text-xl md:text-2xl font-black tracking-tighter leading-none font-display uppercase drop-shadow-md">
                Driver
              </span>
              <span className="text-brand-500 font-bold tracking-[0.1em] text-xs leading-none uppercase font-display drop-shadow-sm">
                Mont Blanc
              </span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            <a onClick={() => scrollToSection(Section.HOME)} className={linkClass(Section.HOME)}>Transfert</a>
            <a onClick={() => scrollToSection(Section.FLEET)} className={linkClass(Section.FLEET)}>Véhicules</a>
            <a onClick={() => scrollToSection(Section.SERVICES)} className={linkClass(Section.SERVICES)}>Services</a>
            <a onClick={() => scrollToSection(Section.CONTACT)} className={linkClass(Section.CONTACT)}>Qui sommes nous</a>
            
            <div className="flex items-center ml-4 gap-4">
                 <a href="#contact" onClick={() => scrollToSection(Section.CONTACT)} className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 text-sm font-bold uppercase tracking-wider shadow-sm transition-all font-display rounded-full">
                  Contact
                </a>
                <div className={`border border-current px-3 py-1 text-xs font-bold rounded-full ${isScrolled ? 'text-dark-900' : 'text-white'}`}>
                    FR
                </div>
            </div>
          </div>

          {/* Mobile Button */}
          <div className="md:hidden flex items-center gap-4">
            <a href="tel:+33686864159" className="bg-brand-500 text-white p-2 rounded-full">
                <Phone size={20} />
            </a>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`${logoColor} focus:outline-none`}
            >
              {isMobileMenuOpen ? <X size={30} /> : <Menu size={30} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white absolute w-full border-t border-gray-100 shadow-xl h-screen top-16 left-0">
          <div className="flex flex-col p-6 space-y-4">
            <a onClick={() => { scrollToSection(Section.HOME); setIsMobileMenuOpen(false); }} className="text-dark-900 font-display font-black text-2xl uppercase">Transfert</a>
            <a onClick={() => { scrollToSection(Section.FLEET); setIsMobileMenuOpen(false); }} className="text-dark-900 font-display font-black text-2xl uppercase">Véhicules</a>
            <a onClick={() => { scrollToSection(Section.SERVICES); setIsMobileMenuOpen(false); }} className="text-dark-900 font-display font-black text-2xl uppercase">Services</a>
            <a onClick={() => { scrollToSection(Section.CONTACT); setIsMobileMenuOpen(false); }} className="text-dark-900 font-display font-black text-2xl uppercase">Contact</a>
            
            <div className="mt-8">
               <a href="tel:+33686864159" className="flex justify-center items-center gap-2 bg-brand-500 text-white w-full py-4 font-bold uppercase tracking-widest text-lg rounded-full">
                Appeler
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
