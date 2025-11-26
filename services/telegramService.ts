
import { BookingData, ClientDetails, EstimationResult } from '../types';

// ⚠️ CONFIGURATION TELEGRAM ⚠️
const TELEGRAM_BOT_TOKEN: string = '8113257653:AAEIky7jpMfU8Ap-nVEtfIiWfLlN7ZJJUJs'; 
const TELEGRAM_CHAT_ID: string = '7935818989'; 

export const sendBookingNotification = async (
  booking: BookingData, 
  client: ClientDetails, 
  result: EstimationResult,
  paymentMethodId: string
): Promise<boolean> => {
  
  // Formatage du message pour une lecture facile sur mobile
  const message = `
🚖 *NOUVELLE RÉSERVATION PAYÉE* 🚖
--------------------------------
💰 *Montant : ${result.price} €*
💳 ID Stripe : \`${paymentMethodId}\`
--------------------------------

👤 *CLIENT*
👤 Nom : ${client.firstName} ${client.lastName}
📞 Tel : ${client.phone}
📧 Email : ${client.email}

📍 *TRAJET ALLER*
🚩 Départ : ${booking.pickup}
🏁 Arrivée : ${booking.dropoff}
📅 Date : ${new Date(booking.date).toLocaleDateString('fr-FR')}
🕒 Heure : ${booking.time}
👥 Pax : ${booking.passengers}
🚗 Véhicule : ${booking.vehicleType === 'sedan' ? 'Berline' : booking.vehicleType === 'van' ? 'Van' : 'Luxe'}

${booking.returnTrip ? `
🔄 *TRAJET RETOUR*
📅 Date : ${new Date(booking.returnDate || '').toLocaleDateString('fr-FR')}
🕒 Heure : ${booking.returnTime}
` : '🚫 Pas de retour'}

ℹ️ *INFOS COMPLÉMENTAIRES*
🏠 Adresse précise : ${client.pickupAddress}
✈️ Vol : ${client.flightNumber || 'Non renseigné'}
💬 Notes : ${client.comments || 'Aucune'}

--------------------------------
✅ _Paiement validé via Stripe_
  `;

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown' // Permet le gras et l'italique
      }),
    });

    if (!response.ok) {
        console.error('Erreur Telegram API:', await response.text());
        return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur envoi Telegram:', error);
    return false;
  }
};
