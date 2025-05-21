/**
 * Configuration for different print status states
 */
import acceptedAnimation from '../../assets/animations/Accepted.json';
import rejectedAnimation from '../../assets/animations/Rejected.json';
import printingAnimation from '../../assets/animations/Printing.json';

export const printStatusConfig = {
  printing: {
    message: 'Impression en cours...',
    animation: printingAnimation,
    loop: true,
    height: 150,
  },
  success: {
    message: 'Impression réussie !',
    animation: acceptedAnimation,
    loop: false,
    height: 100,
  },
  no_printer: {
    message: 'Aucune imprimante sélectionnée.',
    animation: rejectedAnimation,
    loop: false,
    height: 100,
  },
  file_not_found: {
    message: 'Fichier PDF introuvable.',
    animation: rejectedAnimation,
    loop: false,
    height: 100,
  },
  fetch_failed: {
    message: 'Echec du téléchargement du document.',
    animation: rejectedAnimation,
    loop: false,
    height: 100,
  },
  unknown_error: {
    message: 'Une erreur inconnue est survenue.',
    animation: rejectedAnimation,
    loop: false,
    height: 100,
  },
  error: {
    message: 'Erreur d\'impression.',
    animation: rejectedAnimation,
    loop: false,
    height: 100,
  },
  checkin_success: {
    message: 'Participant enregistré avec succès !',
    animation: acceptedAnimation,
    loop: false,
    height: 100,
  },
};
