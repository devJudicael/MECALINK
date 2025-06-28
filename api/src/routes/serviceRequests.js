const express = require('express');
const { body, validationResult } = require('express-validator');
const ServiceRequest = require('../models/ServiceRequest');
const Garage = require('../models/Garage');
const { auth, checkRole } = require('../middleware/auth');

const router = express.Router();

// Validation pour la création d'une demande de service
const createRequestValidation = [
  body('garageId').notEmpty().withMessage('ID du garage requis'),
  body('description').notEmpty().withMessage('Description requise'),
  body('location.latitude').isNumeric().withMessage('Latitude invalide'),
  body('location.longitude').isNumeric().withMessage('Longitude invalide'),
  body('location.address').notEmpty().withMessage('Adresse requise'),
  // body('vehicleInfo.make').notEmpty().withMessage('Marque du véhicule requise'),
  // body('vehicleInfo.model').notEmpty().withMessage('Modèle du véhicule requis'),
  // body('vehicleInfo.year').notEmpty().withMessage('Année du véhicule requise'),
  // body('vehicleInfo.licensePlate').notEmpty().withMessage('Plaque d\'immatriculation requise'),
  // body('urgency').isIn(['low', 'medium', 'high']).withMessage('Urgence invalide')
];

// Route pour créer une nouvelle demande de service (client uniquement)
router.post(
  '/',
  auth,
  checkRole(['client']),
  createRequestValidation,
  async (req, res) => {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { garageId, description, location } = req.body;

      // Vérifier si le garage existe
      const garage = await Garage.findById(garageId);
      if (!garage) {
        return res.status(404).json({ message: 'Garage non trouvé' });
      }

      // Créer une nouvelle demande de service
      const serviceRequest = new ServiceRequest({
        clientId: req.user._id,
        clientName: req.user.name,
        clientPhone: req.user.phone,
        clientEmail: req.user.email,
        garageId: garage._id,
        garageName: garage.name,
        description,
        location,
        status: 'pending',
      });

      await serviceRequest.save();

      res.status(201).json({
        message: 'Demande de service créée avec succès',
        serviceRequest,
      });
    } catch (error) {
      res
        .status(500)
        .json({
          message: 'Erreur lors de la création de la demande',
          error: error.message,
        });
    }
  }
);

// Route pour obtenir toutes les demandes de service d'un client
router.get('/client', auth, checkRole(['client']), async (req, res) => {
  try {
    const serviceRequests = await ServiceRequest.find({
      clientId: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(serviceRequests);
  } catch (error) {
    res
      .status(500)
      .json({
        message: 'Erreur lors de la récupération des demandes',
        error: error.message,
      });
  }
});

// Route pour obtenir toutes les demandes de service d'un garage
router.get('/garage', auth, checkRole(['garage']), async (req, res) => {
  try {
    // Trouver le garage associé à l'utilisateur connecté
    const garage = await Garage.findOne({ userId: req.user._id });

    if (!garage) {
      return res.status(404).json({ message: 'Garage non trouvé' });
    }

    const serviceRequests = await ServiceRequest.find({
      garageId: garage._id,
    }).sort({ createdAt: -1 });

    res.json(serviceRequests);
  } catch (error) {
    res
      .status(500)
      .json({
        message: 'Erreur lors de la récupération des demandes',
        error: error.message,
      });
  }
});

// Route pour obtenir une demande de service par ID
router.get('/:id', auth, async (req, res) => {
  try {
    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (!serviceRequest) {
      return res
        .status(404)
        .json({ message: 'Demande de service non trouvée' });
    }

    // Vérifier que l'utilisateur est autorisé à voir cette demande
    if (
      (req.user.role === 'client' &&
        serviceRequest.clientId.toString() !== req.user._id.toString()) ||
      (req.user.role === 'garage' &&
        serviceRequest.garageId.toString() !==
          (await Garage.findOne({ userId: req.user._id }))._id.toString())
    ) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    res.json(serviceRequest);
  } catch (error) {
    res
      .status(500)
      .json({
        message: 'Erreur lors de la récupération de la demande',
        error: error.message,
      });
  }
});

// Route pour mettre à jour le statut d'une demande de service (garage uniquement)
router.patch(
  '/:id/status',
  auth,
  checkRole(['garage']),
  [
    body('status')
      .isIn(['accepted', 'rejected', 'completed'])
      .withMessage('Statut invalide'),
  ],
  async (req, res) => {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { status } = req.body;

      // Trouver le garage associé à l'utilisateur connecté
      const garage = await Garage.findOne({ userId: req.user._id });

      if (!garage) {
        return res.status(404).json({ message: 'Garage non trouvé' });
      }

      // Trouver la demande de service
      const serviceRequest = await ServiceRequest.findById(req.params.id);

      if (!serviceRequest) {
        return res
          .status(404)
          .json({ message: 'Demande de service non trouvée' });
      }

      // Vérifier que la demande est bien pour ce garage
      if (serviceRequest.garageId.toString() !== garage._id.toString()) {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }

      // Mettre à jour le statut
      serviceRequest.status = status;

      // Mettre à jour les timestamps en fonction du statut
      if (status === 'accepted') {
        serviceRequest.acceptedAt = new Date();
      } else if (status === 'completed') {
        serviceRequest.completedAt = new Date();
      } else if (status === 'rejected') {
        serviceRequest.rejectedAt = new Date();
      }

      await serviceRequest.save();

      res.json({
        message: 'Statut de la demande mis à jour avec succès',
        serviceRequest,
      });
    } catch (error) {
      res
        .status(500)
        .json({
          message: 'Erreur lors de la mise à jour du statut',
          error: error.message,
        });
    }
  }
);

// Route pour annuler une demande de service (client uniquement)
router.patch('/:id/cancel', auth, checkRole(['client']), async (req, res) => {
  try {
    // Trouver la demande de service
    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (!serviceRequest) {
      return res
        .status(404)
        .json({ message: 'Demande de service non trouvée' });
    }

    // Vérifier que la demande appartient à ce client
    if (serviceRequest.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    // Vérifier que la demande peut être annulée
    if (
      serviceRequest.status === 'completed' ||
      serviceRequest.status === 'cancelled'
    ) {
      return res
        .status(400)
        .json({ message: 'Cette demande ne peut pas être annulée' });
    }

    // Mettre à jour le statut
    serviceRequest.status = 'cancelled';
    serviceRequest.cancelledAt = new Date();

    await serviceRequest.save();

    res.json({
      message: 'Demande annulée avec succès',
      serviceRequest,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Erreur lors de l'annulation de la demande",
        error: error.message,
      });
  }
});

module.exports = router;
