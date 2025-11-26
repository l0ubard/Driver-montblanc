
import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Loader2, CreditCard, Download, User, Mail, Phone, Lock } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { BookingData, EstimationResult, ClientDetails, COMMON_LOCATIONS } from '../types';
import { calculatePrice } from '../services/pricingService';
import { sendBookingNotification } from '../services/telegramService';

// Clé publique LIVE fournie par l'utilisateur
const STRIPE_PUBLIC_KEY = 'pk_live_51PsvMbP3r5Nk5OejaCNos7oA2SdkQstAL8rRukNtRXUGQrsFlUxy9yZ97pne9bHcjvO9coSUtnqc83M65pD7UFVD00cBTV2wt7';
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

// Styles pour le champ carte Stripe
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#0f172a", // Text color (Dark-900)
      fontFamily: '"Inter", sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#ef4444", // Red-500
      iconColor: "#ef4444",
    },
  },
};

// Composant interne pour l'autocomplétion
const LocationInput = ({ label, name, value, onChange }: { label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div className="relative group">
    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide font-display">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-500">
        <MapPin size={18} />
      </div>
      <input
        type="text"
        name={name}
        list={`list-${name}`}
        required
        placeholder="Sélectionnez un lieu..."
        className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-transparent focus:border-brand-500 rounded-2xl text-dark-900 placeholder-gray-400 focus:outline-none transition-all font-medium shadow-sm"
        value={value}
        onChange={onChange}
      />
      <datalist id={`list-${name}`}>
        {COMMON_LOCATIONS.map((loc) => (
          <option key={loc} value={loc} />
        ))}
      </datalist>
    </div>
  </div>
);

// Composant de formulaire de paiement interne pour utiliser les hooks Stripe
const PaymentFormContent = ({ 
  amount, 
  onSuccess, 
  loading 
}: { 
  amount: number | string, 
  onSuccess: (paymentMethodId: string) => void, 
  loading: boolean 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    // Création de la méthode de paiement (Tokenisation)
    // En production réelle, on enverrait ce paymentMethod.id au backend pour créer un PaymentIntent
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      console.log('[error]', error);
      setError(error.message || "Erreur de paiement");
    } else {
      console.log('[PaymentMethod]', paymentMethod);
      setError(null);
      // Succès -> On transmet l'ID
      onSuccess(paymentMethod.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
       <div className="mb-6 bg-white p-5 border border-gray-200 rounded-2xl shadow-sm">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
       </div>
       
       {error && (
         <div className="mb-4 text-red-500 text-sm font-bold text-center bg-red-50 p-3 rounded-xl">
           {error}
         </div>
       )}

       <button 
        type="submit" 
        disabled={!stripe || loading}
        className="w-full bg-[#635BFF] hover:bg-[#534be0] text-white font-bold py-4 rounded-full shadow-lg transition-all flex justify-center items-center gap-3 disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" /> : <><Lock size={18} /> <span>Payer {amount} €</span></>}
      </button>
      <div className="mt-4 flex justify-center items-center gap-2 text-gray-400">
         <CreditCard size={14} />
         <span className="text-xs font-medium">Transactions sécurisées et cryptées par Stripe</span>
      </div>
    </form>
  );
};

const BookingForm: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EstimationResult | null>(null);
  
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('one-way');
  const [formData, setFormData] = useState<BookingData>({
    pickup: '',
    dropoff: '',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    passengers: 1,
    vehicleType: 'sedan',
    returnTrip: false,
    returnDate: '',
    returnTime: ''
  });

  const [clientDetails, setClientDetails] = useState<ClientDetails>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    pickupAddress: '',
    flightNumber: '',
    comments: ''
  });

  const handleTripChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClientDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const estimation = await calculatePrice(formData);
    setResult(estimation);
    setLoading(false);
    setStep(2);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handlePaymentSuccess = async (paymentMethodId: string) => {
    setLoading(true);
    
    // 1. Envoi de la notification Telegram
    if (result) {
        await sendBookingNotification(formData, clientDetails, result, paymentMethodId);
    }

    // 2. Simulation traitement serveur (2 sec)
    setTimeout(() => {
      setLoading(false);
      setStep(4);
    }, 1500);
  };

  const handleReset = () => {
    setStep(1);
    setResult(null);
    setFormData({
      pickup: '',
      dropoff: '',
      date: new Date().toISOString().split('T')[0],
      time: '12:00',
      passengers: 1,
      vehicleType: 'sedan',
      returnTrip: false,
      returnDate: '',
      returnTime: ''
    });
    setClientDetails({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      pickupAddress: '',
      flightNumber: '',
      comments: ''
    });
  };

  const renderTicket = () => (
    <div className="bg-white p-8 animate-fade-in-up rounded-[2rem]">
      <div className="border border-brand-500 relative bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-dark-900 text-white p-6 flex justify-between items-center border-b-4 border-brand-500">
          <div>
            <h2 className="text-2xl font-black uppercase font-display tracking-tighter">Driver <span className="text-brand-500">Mont Blanc</span></h2>
          </div>
          <div className="text-right">
            <p className="text-brand-500 font-black text-xl font-display">Confirmé</p>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
            <div>
              <p className="text-xs text-brand-500 uppercase font-bold mb-2 tracking-widest">Client</p>
              <p className="font-bold text-dark-900 text-xl uppercase font-display">{clientDetails.firstName} {clientDetails.lastName}</p>
              <p className="text-gray-600">{clientDetails.phone}</p>
              <p className="text-gray-500 text-sm mt-1">{clientDetails.email}</p>
            </div>
            <div className="md:text-right">
              <p className="text-xs text-brand-500 uppercase font-bold mb-2 tracking-widest">Montant Payé</p>
              <p className="font-black text-dark-900 text-4xl font-display">{result?.price} €</p>
            </div>
          </div>

          <div className="bg-gray-50 p-6 border-l-4 border-brand-500 rounded-r-xl">
             <div className="flex flex-col gap-6">
                <div>
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Départ</span>
                    <span className="text-xl font-bold text-dark-900 block">{formData.pickup}</span>
                    <span className="text-sm text-brand-500 font-medium">{new Date(formData.date).toLocaleDateString('fr-FR')} à {formData.time}</span>
                </div>
                <div>
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Arrivée</span>
                    <span className="text-xl font-bold text-dark-900 block">{formData.dropoff}</span>
                </div>
                {formData.returnTrip && (
                    <div className="pt-4 border-t border-gray-200">
                        <span className="block text-xs font-bold text-brand-500 uppercase tracking-widest mb-1">Retour Inclus</span>
                        <span className="text-sm font-bold text-dark-900">
                            {new Date(formData.returnDate || '').toLocaleDateString('fr-FR')} à {formData.returnTime}
                        </span>
                    </div>
                )}
             </div>
          </div>
        </div>

        <div className="bg-gray-100 p-4 text-center border-t border-gray-200">
            <p className="text-xs text-gray-500 uppercase font-bold">Ticket de réservation électronique - À présenter au chauffeur</p>
        </div>
      </div>

      <div className="mt-8 flex justify-center space-x-4">
        <button onClick={() => window.print()} className="flex items-center space-x-2 bg-dark-900 text-white px-8 py-4 uppercase font-bold tracking-widest hover:bg-black transition-colors rounded-full shadow-lg">
          <Download size={18} />
          <span>Imprimer / PDF</span>
        </button>
        <button onClick={handleReset} className="px-6 py-4 text-gray-500 hover:text-brand-500 font-bold uppercase tracking-widest text-sm rounded-full">
          Nouveau
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white shadow-2xl max-w-6xl mx-auto relative z-30 min-h-[400px] rounded-[2.5rem] overflow-hidden">
      {/* Header Form */}
      <div className="bg-dark-900 text-white p-5 flex justify-between items-center">
         <h3 className="font-display font-bold uppercase tracking-wider text-sm md:text-lg pl-4">Réservez votre chauffeur</h3>
         <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest pr-4">
            <span className={step >= 1 ? "text-brand-500" : "text-gray-600"}>1. Trajet</span>
            <span className="text-gray-700">/</span>
            <span className={step >= 2 ? "text-brand-500" : "text-gray-600"}>2. Infos</span>
            <span className="text-gray-700">/</span>
            <span className={step >= 3 ? "text-brand-500" : "text-gray-600"}>3. Paiement</span>
         </div>
      </div>

      {step === 4 ? renderTicket() : (
        <div className="p-6 md:p-12">
          
          {step === 1 && (
            <>
              <div className="flex justify-center mb-10">
                <div className="bg-gray-100 p-1 rounded-full flex">
                    <button 
                    className={`px-8 py-3 text-sm font-bold uppercase tracking-widest transition-all rounded-full ${tripType === 'one-way' ? 'bg-white text-brand-500 shadow-md' : 'text-gray-500 hover:text-dark-900'}`}
                    onClick={() => { setTripType('one-way'); setFormData(p => ({...p, returnTrip: false})); }}
                    >
                    Aller Simple
                    </button>
                    <button 
                    className={`px-8 py-3 text-sm font-bold uppercase tracking-widest transition-all rounded-full ${tripType === 'round-trip' ? 'bg-white text-brand-500 shadow-md' : 'text-gray-500 hover:text-dark-900'}`}
                    onClick={() => { setTripType('round-trip'); setFormData(p => ({...p, returnTrip: true})); }}
                    >
                    Aller - Retour
                    </button>
                </div>
              </div>

              <form onSubmit={handleEstimate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <LocationInput label="Départ" name="pickup" value={formData.pickup} onChange={handleTripChange} />
                  <LocationInput label="Destination" name="dropoff" value={formData.dropoff} onChange={handleTripChange} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-2">
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-2 font-display">Date</label>
                     <div className="relative">
                       <Calendar className="absolute left-4 top-4 text-brand-500 pointer-events-none" size={18} />
                       <input 
                        type="date" 
                        name="date" 
                        required 
                        className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-transparent focus:border-brand-500 rounded-2xl outline-none font-medium cursor-pointer" 
                        value={formData.date} 
                        onChange={handleTripChange} 
                        onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                       />
                     </div>
                  </div>
                  <div className="md:col-span-2">
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-2 font-display">Heure</label>
                     <div className="relative">
                       <Clock className="absolute left-4 top-4 text-brand-500 pointer-events-none" size={18} />
                       <input 
                        type="time" 
                        name="time" 
                        required 
                        className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-transparent focus:border-brand-500 rounded-2xl outline-none font-medium cursor-pointer" 
                        value={formData.time} 
                        onChange={handleTripChange} 
                        onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                       />
                     </div>
                  </div>
                </div>

                {tripType === 'round-trip' && (
                  <div className="p-6 bg-brand-50 border border-brand-100 grid grid-cols-1 md:grid-cols-2 gap-6 rounded-2xl">
                     <div>
                       <label className="block text-xs font-bold text-brand-600 uppercase mb-2 font-display">Date Retour</label>
                       <input 
                        type="date" 
                        name="returnDate" 
                        required 
                        className="w-full p-4 bg-white border border-brand-200 rounded-xl outline-none cursor-pointer" 
                        value={formData.returnDate} 
                        onChange={handleTripChange} 
                        onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-brand-600 uppercase mb-2 font-display">Heure Retour</label>
                       <input 
                        type="time" 
                        name="returnTime" 
                        required 
                        className="w-full p-4 bg-white border border-brand-200 rounded-xl outline-none cursor-pointer" 
                        value={formData.returnTime} 
                        onChange={handleTripChange} 
                        onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                       />
                     </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 font-display">Passagers</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-4 text-brand-500" size={18} />
                      <select name="passengers" className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-transparent focus:border-brand-500 outline-none appearance-none font-medium rounded-2xl" value={formData.passengers} onChange={handleTripChange}>
                        {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} Personne{n > 1 ? 's' : ''}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 font-display">Véhicule</label>
                    <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                      {['sedan', 'van', 'luxury'].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setFormData(p => ({...p, vehicleType: v as any}))}
                          className={`flex-1 py-3 text-xs font-bold uppercase transition-all rounded-xl ${formData.vehicleType === v ? 'bg-white text-brand-500 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                          {v === 'sedan' ? 'Berline' : v === 'van' ? 'Van' : 'Luxe'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-brand-500 text-white font-black uppercase tracking-widest py-5 hover:bg-brand-600 transition-all shadow-lg hover:shadow-xl flex justify-center items-center gap-2 group rounded-full mt-4">
                  {loading ? <Loader2 className="animate-spin" /> : <span className="group-hover:tracking-[0.2em] transition-all">Estimer le prix</span>}
                </button>
              </form>
            </>
          )}

          {step === 2 && result && (
            <div className="animate-fade-in-right">
              <div className="bg-dark-900 text-white p-6 mb-8 flex justify-between items-center shadow-lg rounded-2xl">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Estimation</p>
                  <p className="text-4xl font-black font-display text-brand-500">{result.price} €</p>
                </div>
                <div className="text-right">
                    <p className="font-bold uppercase tracking-wider">{formData.vehicleType === 'sedan' ? 'Berline' : formData.vehicleType === 'van' ? 'Van' : 'Luxe'}</p>
                    <p className="text-sm text-gray-400">{result.distance} • {result.duration}</p>
                </div>
              </div>

              <h3 className="text-lg font-bold text-dark-900 mb-6 uppercase font-display border-b pb-2">Vos informations</h3>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" name="firstName" placeholder="Prénom" required className="p-4 bg-gray-50 border border-gray-100 focus:border-brand-500 rounded-xl outline-none" value={clientDetails.firstName} onChange={handleClientChange} />
                  <input type="text" name="lastName" placeholder="Nom" required className="p-4 bg-gray-50 border border-gray-100 focus:border-brand-500 rounded-xl outline-none" value={clientDetails.lastName} onChange={handleClientChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="email" name="email" placeholder="Email" required className="p-4 bg-gray-50 border border-gray-100 focus:border-brand-500 rounded-xl outline-none" value={clientDetails.email} onChange={handleClientChange} />
                  <input type="tel" name="phone" placeholder="Téléphone" required className="p-4 bg-gray-50 border border-gray-100 focus:border-brand-500 rounded-xl outline-none" value={clientDetails.phone} onChange={handleClientChange} />
                </div>
                <input type="text" name="pickupAddress" placeholder="Adresse précise (Hôtel, Rue...)" required className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-brand-500 rounded-xl outline-none" value={clientDetails.pickupAddress} onChange={handleClientChange} />
                <div className="grid grid-cols-1 gap-4">
                     <input type="text" name="flightNumber" placeholder="Numéro de vol (Optionnel)" className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-brand-500 rounded-xl outline-none" value={clientDetails.flightNumber} onChange={handleClientChange} />
                </div>
                <textarea name="comments" placeholder="Commentaires (Siège bébé, skis...)" className="w-full p-4 bg-gray-50 border border-gray-100 focus:border-brand-500 rounded-xl outline-none" value={clientDetails.comments} onChange={handleClientChange}></textarea>

                <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setStep(1)} className="px-8 py-4 font-bold uppercase text-gray-500 hover:text-dark-900 rounded-full">Retour</button>
                    <button type="submit" className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-bold uppercase tracking-widest py-4 shadow-lg rounded-full">
                        Valider
                    </button>
                </div>
              </form>
            </div>
          )}

          {step === 3 && result && (
            <div className="text-center max-w-lg mx-auto py-8">
              <h3 className="text-2xl font-black uppercase font-display text-dark-900 mb-2">Paiement Sécurisé</h3>
              <p className="text-gray-500 mb-8">Montant à régler : <span className="text-brand-500 font-bold">{result.price} €</span></p>
              
              <Elements stripe={stripePromise}>
                  <PaymentFormContent 
                    amount={result.price} 
                    onSuccess={handlePaymentSuccess} 
                    loading={loading}
                  />
              </Elements>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingForm;
