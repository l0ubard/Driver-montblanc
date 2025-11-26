
export interface BookingData {
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  passengers: number;
  vehicleType: 'sedan' | 'van' | 'luxury';
  returnTrip: boolean;
  returnDate?: string;
  returnTime?: string;
}

export interface ClientDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  pickupAddress: string; // Adresse précise ou nom de l'hôtel
  flightNumber?: string;
  comments?: string;
}

export interface EstimationResult {
  price: number | string;
  duration: string;
  distance: string;
  message: string;
  isFixedPrice: boolean;
}

export enum Section {
  HOME = 'home',
  SERVICES = 'services',
  FLEET = 'fleet',
  CONTACT = 'contact',
  BOOKING = 'booking'
}

export const COMMON_LOCATIONS = [
  "Aéroport Genève (GVA)",
  "Aéroport Lyon St-Exupéry (LYS)",
  "Aéroport Milan Malpensa (MXP)",
  "Chamonix Mont-Blanc",
  "Megève",
  "Saint-Gervais-les-Bains",
  "Les Houches",
  "Argentière",
  "Courchevel 1850",
  "Méribel",
  "Val Thorens",
  "Morzine",
  "Avoriaz",
  "Les Gets",
  "Annecy",
  "Gare de Bellegarde",
  "Gare de Lyon Part-Dieu"
];