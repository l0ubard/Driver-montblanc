
import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import BookingForm from './components/BookingForm';
import { Section } from './types';
import { Shield, Clock, MapPin, Award, Phone, Mail, Instagram, Facebook, CheckCircle, HelpCircle, ChevronDown, ChevronUp, Star, Mountain, Quote, ArrowRight, UserCheck, Wifi } from 'lucide-react';

// Composant pour l'animation au scroll
interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
}

const RevealOnScroll: React.FC<RevealOnScrollProps> = ({ children, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div ref={ref} className={`reveal ${isVisible ? 'active' : ''} ${className}`}>
      {children}
    </div>
  );
};

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>(Section.HOME);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const scrollToSection = (section: Section) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(section);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-brand-500 selection:text-white">
      <Navbar activeSection={activeSection} scrollToSection={scrollToSection} />

      {/* --- HERO SECTION --- */}
      <section id={Section.HOME} className="relative h-[85vh] min-h-[600px] flex flex-col justify-center items-center text-white pb-20 overflow-hidden rounded-b-[3rem]">
        <div className="absolute inset-0 bg-dark-900/30 z-10"></div>
        {/* Ajout d'un overlay dégradé bleu nuit pour casser le coté sombre/sport */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent z-10 opacity-80"></div>
        
        {/* Image de fond : Randonneurs face au Mont Blanc (Image fournie par l'utilisateur) */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://distances.plus/app/uploads/2022/09/tour-mont-blanc-photo-vincent-champagne.jpg')" }}
        ></div>
        
        <div className="relative z-20 text-center px-4 w-full max-w-7xl mx-auto flex flex-col items-center pt-10">
          
          <h1 className="animate-fade-in-up text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-shadow uppercase font-display tracking-wide" style={{animationDelay: '0.3s'}}>
            Transfert<br/>
            Mont Blanc
          </h1>

          <p className="animate-fade-in-up text-lg md:text-xl font-medium mb-10 max-w-2xl mx-auto text-shadow font-sans text-gray-100 leading-relaxed" style={{animationDelay: '0.5s'}}>
            Vivez l'aventure des Alpes avec un confort absolu. De Genève aux sentiers de randonnée, nous vous transportons.
          </p>

          <div className="animate-fade-in-up" style={{animationDelay: '0.7s'}}>
             <button 
              onClick={() => {
                  const form = document.getElementById('booking-form-anchor');
                  form?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group bg-brand-500 hover:bg-white text-white hover:text-brand-500 font-bold py-4 px-10 text-sm uppercase tracking-widest shadow-2xl transition-all duration-300 flex items-center gap-2 font-display rounded-full"
            >
              <span>Réserver maintenant</span>
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 animate-bounce text-white/70">
           <ChevronDown size={32} />
        </div>
      </section>

      {/* --- BOOKING FORM --- */}
      <div id="booking-form-anchor" className="relative -mt-32 z-30 px-4 mb-24">
        <BookingForm />
      </div>

      {/* --- HISTOIRE & VALEURS --- */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <RevealOnScroll className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="relative">
                    <div className="absolute -top-4 -left-4 w-24 h-24 bg-brand-100 rounded-full opacity-50 z-0"></div>
                    <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-brand-500/10 rounded-full z-0"></div>
                    <img 
                        src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop" 
                        alt="Chauffeur privé" 
                        className="relative z-10 w-full h-[500px] object-cover shadow-2xl rounded-[2rem] grayscale hover:grayscale-0 transition-all duration-700"
                    />
                    <div className="absolute bottom-10 -right-10 bg-white p-8 shadow-xl max-w-xs hidden md:block z-20 rounded-2xl border-l-8 border-brand-500">
                        <p className="text-4xl font-bold text-brand-500 font-display">15+</p>
                        <p className="text-gray-600 font-bold uppercase text-sm tracking-wider">Années d'expérience dans les Alpes</p>
                    </div>
                </div>
                <div>
                    <h2 className="text-brand-500 font-bold tracking-widest uppercase mb-2">Notre Excellence</h2>
                    <h3 className="text-3xl md:text-4xl font-bold text-dark-900 uppercase font-display mb-6 leading-tight">
                        Plus qu'un trajet,<br/>un voyage <span className="text-brand-500">sur mesure</span>.
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                        Fondée au cœur de Chamonix, Driver Mont Blanc n'est pas une simple société de taxi. Nous sommes des artisans du transport. Nos chauffeurs connaissent chaque virage, chaque raccourci et les conditions météorologiques changeantes de la montagne.
                    </p>
                    <ul className="space-y-4 mb-8">
                        {[
                            "Chauffeurs locaux expérimentés et multilingues",
                            "Flotte Mercedes-Benz & Tesla dernière génération",
                            "Service disponible 24h/24 et 7j/7",
                            "Attente gratuite à l'aéroport en cas de retard"
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-3">
                                <span className="bg-brand-500 text-white rounded-full p-1"><CheckCircle size={14} /></span>
                                <span className="text-dark-800 font-medium">{item}</span>
                            </li>
                        ))}
                    </ul>
                    <button onClick={() => scrollToSection(Section.CONTACT)} className="text-brand-500 font-bold uppercase tracking-widest border-b-2 border-brand-500 pb-1 hover:text-brand-600 transition-colors">
                        En savoir plus sur nous
                    </button>
                </div>
            </RevealOnScroll>
        </div>
      </section>

      {/* --- FLEET (Moved Up) --- */}
      <section id={Section.FLEET} className="py-24 bg-dark-900 text-white relative rounded-[3rem] mx-4 my-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-gray-800 pb-8">
            <div>
                 <h2 className="text-3xl md:text-4xl font-bold text-white uppercase font-display">
                  Notre <span className="text-brand-500">Flotte</span>
                </h2>
                <p className="mt-4 text-gray-400 max-w-lg">Voyagez en première classe. Nos véhicules sont équipés pour la neige et le confort absolu.</p>
            </div>
            <div className="hidden md:flex gap-2">
                <span className="w-3 h-3 bg-brand-500 rounded-full animate-pulse"></span>
                <span className="text-xs uppercase font-bold tracking-widest text-gray-400">Véhicules 2024/2025</span>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
                { 
                    name: "Berline Électrique", 
                    model: "BYD Seal", 
                    img: "https://cdn-s-www.leprogres.fr/images/8E1B2E8A-E30E-4364-A121-89DF3E4E946F/NW_raw/le-design-fait-reference-aux-oceans-tout-comme-les-autres-modeles-de-la-gamme-le-nom-seal-signifie-phoque-le-style-est-sans-surprise-mais-fait-preuve-d-une-belle-elegance-les-joints-de-porte-doubles-ou-le-double-vitrage-feuillete-sur-les-vitres-rassurent-sur-la-qualite-de-fabrication-de-cette-chinoise-1702468813.jpg", // Image fournie
                    pax: 3, luggage: 2, 
                    features: ["100% Électrique", "Silence", "Toit Panoramique"] 
                },
                { 
                    name: "Berline Prestige", 
                    model: "Mercedes Classe E", 
                    img: "https://motorsactu.com/wp-content/uploads/2023/10/Mercedes-Benz-Classe-E-All-Terrain.jpg", // Image fournie
                    pax: 3, luggage: 3, 
                    features: ["Confort Business", "Intérieur Cuir", "Wifi à bord"] 
                },
                { 
                    name: "SUV Écologique", 
                    model: "Tesla Model Y", 
                    img: "https://cdn.mgig.fr/2025/01/mg-9389329b-w2818.jpg", // Image fournie
                    pax: 4, luggage: 4, 
                    features: ["Espace Bagages", "Technologie", "4 Roues Motrices"] 
                }
            ].map((car, i) => (
                <RevealOnScroll key={i} className={`group delay-${i*100}`}>
                    <div className="bg-dark-800 hover:bg-dark-950 border border-gray-800 hover:border-brand-500 transition-all duration-300 rounded-[2rem] overflow-hidden">
                        <div className="h-64 overflow-hidden relative">
                            <div className="absolute inset-0 bg-dark-900/10 group-hover:bg-transparent transition-all z-10"></div>
                            <img src={car.img} alt={car.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        </div>
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold font-display uppercase text-white">{car.name}</h3>
                                <span className="text-xs font-bold text-brand-500 border border-brand-500 px-3 py-1 rounded-full">{car.model}</span>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-6">
                                {car.features.map(f => (
                                    <span key={f} className="text-[10px] uppercase font-bold text-gray-400 bg-dark-900 px-2 py-1 rounded-md">{f}</span>
                                ))}
                            </div>
                            <div className="flex justify-between items-center border-t border-gray-700 pt-4">
                                <div className="flex items-center gap-4 text-sm font-semibold text-gray-300">
                                    <div className="flex items-center gap-1"><UserCheck size={16} className="text-brand-500"/> {car.pax}</div>
                                    <div className="flex items-center gap-1"><Shield size={16} className="text-brand-500"/> {car.luggage}</div>
                                </div>
                                <button onClick={() => scrollToSection(Section.BOOKING)} className="text-white hover:text-brand-500 uppercase font-bold text-xs tracking-widest transition-colors flex items-center gap-1">
                                    Réserver <ArrowRight size={12}/>
                                </button>
                            </div>
                        </div>
                    </div>
                </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* --- SERVICES --- */}
      <section id={Section.SERVICES} className="py-24 bg-slate-50 relative rounded-[3rem] my-8 mx-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-900 uppercase font-display mb-4">
              Nos <span className="text-brand-500">Services</span>
            </h2>
            <div className="w-24 h-1.5 bg-brand-500 mx-auto rounded-full"></div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
                { title: "Transfert Aéroport", icon: <MapPin size={32} />, desc: "Liaisons directes et privées depuis Genève (GVA), Lyon et Milan vers votre chalet." },
                { title: "Transport Privé", icon: <Mountain size={32} />, desc: "Mise à disposition à la journée pour vos excursions touristiques, shopping ou dîners." },
                { title: "Service Business", icon: <Shield size={32} />, desc: "Pour vos séminaires et événements, nous gérons la logistique transport de vos équipes." }
            ].map((service, i) => (
                <RevealOnScroll key={i} className={`delay-${i * 100}`}>
                    <div className="bg-white p-10 h-full border border-gray-100 hover:border-brand-500 shadow-sm hover:shadow-2xl transition-all duration-300 group rounded-[2rem]">
                        
                        <div className="w-16 h-16 bg-brand-50 text-brand-500 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
                            {service.icon}
                        </div>
                        
                        <h3 className="text-xl font-bold uppercase font-display mb-4 text-dark-900">{service.title}</h3>
                        <p className="text-gray-500 leading-relaxed">
                            {service.desc}
                        </p>
                    </div>
                </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* --- REVIEWS --- */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <RevealOnScroll className="text-center mb-16">
                <div className="flex justify-center gap-1 mb-4 text-brand-500">
                    <Star fill="currentColor" size={20} />
                    <Star fill="currentColor" size={20} />
                    <Star fill="currentColor" size={20} />
                    <Star fill="currentColor" size={20} />
                    <Star fill="currentColor" size={20} />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-dark-900 uppercase font-display mb-4">Avis Clients</h2>
            </RevealOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { name: "Sophie Martin", city: "Paris", text: "Service impeccable. Le chauffeur était à l'heure, la voiture immaculée et la conduite très douce malgré la neige. Je recommande vivement !" },
                    { name: "James Wilson", city: "London", text: "Best transfer service in Chamonix. Booking was easy, price was fair and fixed. Driver spoke perfect English. Will use again next winter." },
                    { name: "Marc Dubreuil", city: "Lyon", text: "Professionnalisme et courtoisie. Nous avons utilisé les services de Driver Mont Blanc pour un séminaire d'entreprise. Logistique parfaite." }
                ].map((review, i) => (
                    <RevealOnScroll key={i} className="bg-slate-50 p-8 border border-slate-100 hover:border-brand-200 transition-colors rounded-[2rem]">
                        <div className="flex gap-1 mb-4 text-brand-500">
                            {[1,2,3,4,5].map(s => <Star key={s} size={12} fill="currentColor" />)}
                        </div>
                        <p className="text-gray-700 italic mb-6 relative z-10 leading-relaxed text-sm">"{review.text}"</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-dark-900 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {review.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-dark-900 uppercase text-xs tracking-wide">{review.name}</p>
                                <p className="text-xs text-gray-500">{review.city}</p>
                            </div>
                        </div>
                    </RevealOnScroll>
                ))}
            </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-24 bg-slate-50 rounded-[3rem] mx-4 my-8">
        <div className="max-w-4xl mx-auto px-4">
             <RevealOnScroll className="text-center mb-16">
                <h2 className="text-3xl font-bold text-dark-900 uppercase font-display mb-4">Questions Fréquentes</h2>
             </RevealOnScroll>
             
             <div className="space-y-4">
                {[
                    { q: "Comment réserver un transfert depuis Genève ?", a: "Utilisez notre formulaire en haut de page. Sélectionnez 'Aéroport Genève', votre destination, et obtenez un prix fixe immédiat. Le paiement sécurisé valide la réservation." },
                    { q: "Les prix sont-ils fixes ?", a: "Oui, absolument. Le prix affiché lors de la réservation est le prix final. Aucun supplément bagage, trafic ou attente à l'aéroport." },
                    { q: "Que se passe-t-il si mon vol a du retard ?", a: "Nous suivons votre vol en temps réel grâce au numéro de vol que vous fournissez. Votre chauffeur vous attendra gratuitement à l'arrivée réelle." },
                    { q: "Fournissez-vous des sièges bébé ?", a: "Oui, sur simple demande. Lors de la réservation, précisez le besoin dans le champ 'Commentaires'. C'est un service gratuit." }
                ].map((item, index) => (
                    <RevealOnScroll key={index}>
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                            <button 
                                onClick={() => toggleFaq(index)}
                                className="w-full flex justify-between items-center p-6 text-left hover:bg-gray-50 transition-colors focus:outline-none"
                            >
                                <span className="font-bold text-dark-900 uppercase tracking-wide text-sm md:text-sm">{item.q}</span>
                                {openFaqIndex === index ? <ChevronUp className="text-brand-500" /> : <ChevronDown className="text-gray-400" />}
                            </button>
                            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaqIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-100 mt-2 text-sm">
                                    {item.a}
                                </div>
                            </div>
                        </div>
                    </RevealOnScroll>
                ))}
             </div>
        </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section className="py-20 bg-brand-500 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-dark-900 opacity-20"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold uppercase font-display mb-8">Prêt à partir ?</h2>
            <p className="text-xl mb-10 text-brand-50 max-w-2xl mx-auto">
                Réservez votre chauffeur en moins de 2 minutes et recevez votre confirmation instantanément.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
                 <button 
                    onClick={() => scrollToSection(Section.HOME)}
                    className="bg-white text-brand-500 hover:bg-gray-100 font-bold py-4 px-10 uppercase tracking-widest shadow-xl transition-all transform hover:-translate-y-1 font-display rounded-full"
                >
                    Réserver mon trajet
                </button>
                <a 
                    href="tel:+33686864159"
                    className="bg-dark-900 border border-dark-900 text-white hover:bg-transparent hover:border-white font-bold py-4 px-10 uppercase tracking-widest transition-all flex items-center justify-center gap-2 rounded-full"
                >
                    <Phone size={18} /> Appel direct
                </a>
            </div>
        </div>
      </section>

      {/* --- CONTACT & FOOTER --- */}
      <section id={Section.CONTACT} className="bg-dark-900 text-white pt-20 pb-10 rounded-t-[3rem] -mt-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                <div>
                     <div className="flex flex-col mb-6 gap-3">
                         {/* Logo Footer - SVG Pro */}
                         <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
                             <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" xmlns="http://www.w3.org/2000/svg" fill="none">
                                <path d="M50 20 L85 80 H15 L50 20 Z" fill="#F2541B" />
                                <path d="M50 20 L50 80 L85 80 Z" fill="#d94e18" />
                                <path d="M50 20 L38 42 L50 35 L62 42 L50 20 Z" fill="white" />
                                <path d="M35 85 Q50 75 65 85" stroke="#F2541B" strokeWidth="4" strokeLinecap="round"/>
                             </svg>
                        </div>
                        <div>
                            <span className="text-2xl font-bold tracking-tighter leading-none font-display uppercase text-white">
                                Driver
                            </span>
                            <span className="text-brand-500 font-bold tracking-[0.1em] text-xs leading-none uppercase font-display block">
                                Mont Blanc
                            </span>
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                        Votre partenaire de confiance pour tous vos déplacements dans la vallée de Chamonix et vers les aéroports de la région.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="w-10 h-10 bg-dark-800 rounded-full flex items-center justify-center hover:bg-brand-500 transition-colors"><Instagram size={18} /></a>
                        <a href="#" className="w-10 h-10 bg-dark-800 rounded-full flex items-center justify-center hover:bg-brand-500 transition-colors"><Facebook size={18} /></a>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold uppercase tracking-widest mb-6 text-brand-500 text-xs">Liens Rapides</h4>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li><button onClick={() => scrollToSection(Section.HOME)} className="hover:text-white transition-colors">Accueil</button></li>
                        <li><button onClick={() => scrollToSection(Section.FLEET)} className="hover:text-white transition-colors">Véhicules</button></li>
                        <li><button onClick={() => scrollToSection(Section.SERVICES)} className="hover:text-white transition-colors">Services</button></li>
                        <li><a href="#" className="hover:text-white transition-colors">CGV</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold uppercase tracking-widest mb-6 text-brand-500 text-xs">Destinations Top</h4>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li>Genève ⇄ Chamonix</li>
                        <li>Genève ⇄ Megève</li>
                        <li>Genève ⇄ Courchevel</li>
                        <li>Lyon ⇄ Chamonix</li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold uppercase tracking-widest mb-6 text-brand-500 text-xs">Contact</h4>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-gray-400 text-sm">
                            <Phone size={16} className="text-brand-500" />
                            <span>06 86 86 41 59</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-400 text-sm">
                            <Mail size={16} className="text-brand-500" />
                            <span>drivermontblanc@gmail.com</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-400 text-sm">
                            <MapPin size={16} className="text-brand-500" />
                            <span>74400 Chamonix, France</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
            <p>&copy; 2024 Driver Mont Blanc. Tous droits réservés.</p>
            <p className="mt-2 md:mt-0">Design Premium</p>
        </div>
      </section>
    </div>
  );
};

export default App;
