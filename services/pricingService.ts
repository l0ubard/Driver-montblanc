
import { BookingData, EstimationResult } from "../types";

// Base de données simplifiée des tarifs (Approximation des tarifs réels du marché)
// Format: "LieuA-LieuB": [PrixBerline, PrixVan]
const FIXED_ROUTES: Record<string, [number, number]> = {
  // Départ Genève
  "Aéroport Genève (GVA)-Chamonix Mont-Blanc": [220, 260],
  "Aéroport Genève (GVA)-Les Houches": [210, 250],
  "Aéroport Genève (GVA)-Argentière": [230, 270],
  "Aéroport Genève (GVA)-Megève": [260, 300],
  "Aéroport Genève (GVA)-Saint-Gervais-les-Bains": [240, 280],
  "Aéroport Genève (GVA)-Morzine": [260, 300],
  "Aéroport Genève (GVA)-Avoriaz": [280, 320],
  "Aéroport Genève (GVA)-Courchevel 1850": [450, 500],
  "Aéroport Genève (GVA)-Val Thorens": [480, 550],
  "Aéroport Genève (GVA)-Annecy": [160, 190],
  
  // Départ Lyon
  "Aéroport Lyon St-Exupéry (LYS)-Chamonix Mont-Blanc": [450, 520],
  "Aéroport Lyon St-Exupéry (LYS)-Megève": [420, 490],
  "Aéroport Lyon St-Exupéry (LYS)-Courchevel 1850": [480, 550],
};

// Fonction pour normaliser les lieux (ignorer majuscules/minuscules)
const normalize = (str: string) => str.toLowerCase().trim();

export const calculatePrice = async (data: BookingData): Promise<EstimationResult> => {
  // Simulation de délai réseau
  await new Promise(resolve => setTimeout(resolve, 800));

  const routeKey1 = `${data.pickup}-${data.dropoff}`;
  const routeKey2 = `${data.dropoff}-${data.pickup}`; // Trajet inverse

  // Recherche dans les routes fixes
  let foundPrice: [number, number] | undefined;
  
  // Recherche exacte
  foundPrice = FIXED_ROUTES[routeKey1] || FIXED_ROUTES[routeKey2];

  // Si pas trouvé, on cherche des correspondances partielles
  if (!foundPrice) {
    const keys = Object.keys(FIXED_ROUTES);
    const match = keys.find(key => {
      const [a, b] = key.split('-');
      const p = normalize(data.pickup);
      const d = normalize(data.dropoff);
      return (normalize(a).includes(p) && normalize(b).includes(d)) || 
             (normalize(b).includes(p) && normalize(a).includes(d));
    });
    if (match) foundPrice = FIXED_ROUTES[match];
  }

  // Prix par défaut (Berline / Van)
  let basePrice = 0;
  let isFixed = false;

  if (foundPrice) {
    // Index 0 = Berline (1-3 pax), Index 1 = Van (4-7 pax)
    const isVanNeeded = data.passengers > 3 || data.vehicleType === 'van';
    basePrice = isVanNeeded ? foundPrice[1] : foundPrice[0];
    isFixed = true;
  } else {
    // Fallback: Calcul approximatif distance (simulation)
    // On assume ~100km par défaut si inconnu pour la démo
    basePrice = 200 + (data.passengers > 3 ? 50 : 0);
    isFixed = false;
  }

  // Ajustement type véhicule 'Luxe' (+40%)
  if (data.vehicleType === 'luxury') {
    basePrice = Math.round(basePrice * 1.4);
  }

  // Aller-retour (x2 avec petite remise 5%)
  if (data.returnTrip) {
    basePrice = Math.round(basePrice * 2 * 0.95);
  }

  return {
    price: basePrice,
    duration: "1h 15min", // Valeur par défaut pour la démo
    distance: "88 km",    // Valeur par défaut pour la démo
    message: isFixed ? "Tarif fixe tout compris" : "Tarif estimatif basé sur la distance",
    isFixedPrice: isFixed
  };
};
