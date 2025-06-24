const express = require('express');
const { body, validationResult } = require('express-validator');
const Garage = require('../models/Garage');
const { auth, checkRole } = require('../middleware/auth');

const router = express.Router();

// Fonction pour calculer la distance entre deux points géographiques
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance en km
};

// Route pour obtenir tous les garages
router.get('/', async (req, res) => {
  try {
    const garages = await Garage.find();
    res.json(garages);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des garages', error: error.message });
  }
});

// Route pour obtenir les garages à proximité
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude et longitude requises' });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ message: 'Latitude et longitude doivent être des nombres valides' });
    }

    // Récupérer tous les garages
    const garages = await Garage.find();

    // Calculer la distance pour chaque garage et filtrer par rayon
    const nearbyGarages = garages
      .map(garage => {
        const distance = calculateDistance(
          lat,
          lon,
          garage.location.latitude,
          garage.location.longitude
        );
        return { ...garage.toObject(), distance };
      })
      .filter(garage => garage.distance <= parseFloat(radius))
      .sort((a, b) => a.distance - b.distance);

    res.json(nearbyGarages);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des garages à proximité', error: error.message });
  }
});

// Route pour obtenir un garage par ID
router.get('/:id', async (req, res) => {
  try {
    const garage = await Garage.findById(req.params.id);
    
    if (!garage) {
      return res.status(404).json({ message: 'Garage non trouvé' });
    }
    
    res.json(garage);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du garage', error: error.message });
  }
});

// Route pour mettre à jour le profil d'un garage (protégée)
router.put('/profile', auth, checkRole(['garage']), [
  body('name').optional().notEmpty().withMessage('Le nom ne peut pas être vide'),
  body('phone').optional().notEmpty().withMessage('Le téléphone ne peut pas être vide'),
  body('services').optional().isArray().withMessage('Les services doivent être un tableau'),
  body('description').optional().notEmpty().withMessage('La description ne peut pas être vide'),
  body('openingHours').optional().notEmpty().withMessage('Les horaires d\'ouverture ne peuvent pas être vides'),
  body('isOpen').optional().isBoolean().withMessage('isOpen doit être un booléen')
], async (req, res) => {
  // Vérifier les erreurs de validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Trouver le garage associé à l'utilisateur connecté
    const garage = await Garage.findOne({ userId: req.user._id });
    
    if (!garage) {
      return res.status(404).json({ message: 'Garage non trouvé' });
    }

    // Mettre à jour les champs fournis
    const updateFields = ['name', 'phone', 'services', 'description', 'openingHours', 'isOpen'];
    
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        garage[field] = req.body[field];
      }
    });

    // Mettre à jour la localisation si fournie
    if (req.body.location) {
      if (req.body.location.latitude) garage.location.latitude = req.body.location.latitude;
      if (req.body.location.longitude) garage.location.longitude = req.body.location.longitude;
      if (req.body.location.address) {
        garage.address = req.body.location.address;
      }
    }

    await garage.save();
    
    res.json({ message: 'Profil du garage mis à jour avec succès', garage });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil', error: error.message });
  }
});

module.exports = router;