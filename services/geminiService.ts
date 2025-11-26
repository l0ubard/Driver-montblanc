import { GoogleGenAI, Type } from "@google/genai";
import { BookingData, EstimationResult } from "../types";

export const getBookingEstimation = async (data: BookingData): Promise<EstimationResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Tu es l'IA de réservation pour "Driver Mont Blanc", un service de VTC de luxe dans les Alpes.
      
      Détails de la demande :
      - Départ : ${data.pickup}
      - Arrivée : ${data.dropoff}
      - Date : ${data.date} à ${data.time}
      - Retour : ${data.returnTrip ? `OUI (Le ${data.returnDate} à ${data.returnTime})` : 'NON'}
      - Passagers : ${data.passengers}
      - Véhicule : ${data.vehicleType}

      Tâche :
      Estime le prix, la durée et la distance pour ce trajet spécifique dans les Alpes.
      Si le lieu est ambigu, fais une supposition logique basée sur la région du Mont-Blanc / Genève.
      Le prix doit être réaliste pour un service premium (ex: Genève-Chamonix ~200-250€ en Berline).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            price: { type: Type.STRING, description: "Prix estimé (ex: 220-260). Ne pas inclure le symbole €." },
            duration: { type: Type.STRING, description: "Durée estimée (ex: 1h 10min)" },
            distance: { type: Type.STRING, description: "Distance estimée (ex: 88 km)" },
            message: { type: Type.STRING, description: "Message court et courtois" }
          },
          required: ["price", "duration", "distance", "message"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const result = JSON.parse(text);
    return {
      ...result,
      isFixedPrice: false
    } as EstimationResult;

  } catch (error) {
    console.error("Error getting estimation:", error);
    return {
      price: "Sur devis",
      duration: "À confirmer",
      distance: "À confirmer",
      message: "Impossible de calculer l'estimation automatiquement. Veuillez nous contacter par téléphone pour un devis immédiat.",
      isFixedPrice: false
    };
  }
};