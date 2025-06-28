const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Garage = require('../models/Garage');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validation pour l'inscription
const registerValidation = [
  body('name').notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('phone').notEmpty().withMessage('Le numéro de téléphone est requis'),
  body('role')
    .isIn(['client', 'garage'])
    .withMessage('Le rôle doit être client ou garage'),
];

// Validation pour la connexion
const loginValidation = [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Le mot de passe est requis'),
];

// Validation pour l'inscription d'un garage
const garageValidation = [
  body('location.latitude').isNumeric().withMessage('Latitude invalide'),
  body('location.longitude').isNumeric().withMessage('Longitude invalide'),
  body('location.address').notEmpty().withMessage('Adresse requise'),
  body('services')
    .isArray()
    .withMessage('Les services doivent être un tableau'),
];

// Générer un token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Route d'inscription
router.post('/register', registerValidation, async (req, res) => {
  // Vérifier les erreurs de validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password, phone, role, location, services } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Validation supplémentaire pour les garages
    if (role === 'garage') {
      if (!location) {
        return res.status(400).json({
          message:
            'Les informations de localisation sont requises pour un garage',
        });
      }
    }

    // Créer un nouvel utilisateur
    const user = new User({
      name,
      email,
      password,
      phone,
      role,
      location: role === 'garage' ? location : undefined,
    });

    await user.save();

    // Si c'est un garage, créer également une entrée dans la collection Garage
    if (role === 'garage') {
      const garage = new Garage({
        userId: user._id,
        name,
        email,
        phone,
        address: location.address,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        services: services || [],
        description: req.body.description || '',
      });

      await garage.save();
    }

    // Générer un token JWT
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Inscription réussie',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location,
      },
      token,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de l'inscription", error: error.message });
  }
});

// Route de connexion
router.post('/login', loginValidation, async (req, res) => {
  // Vérifier les erreurs de validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur par email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(401).json({ message: 'Ce compte a été désactivé' });
    }

    // Générer un token JWT
    const token = generateToken(user._id);

    // Si c'est un garage, récupérer les informations du garage
    let garageInfo = null;
    if (user.role === 'garage') {
      garageInfo = await Garage.findOne({ userId: user._id });
    }

    res.json({
      message: 'Connexion réussie',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location,
      },
      garage: garageInfo,
      token,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Erreur lors de la connexion', error: error.message });
  }
});

// Route pour obtenir le profil de l'utilisateur connecté
router.get('/profile', auth, async (req, res) => {
  try {
    // L'utilisateur est déjà disponible dans req.user grâce au middleware auth
    const user = req.user;

    // Si c'est un garage, récupérer les informations du garage
    let garageInfo = null;
    if (user.role === 'garage') {
      garageInfo = await Garage.findOne({ userId: user._id });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location,
      },
      garage: garageInfo,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la récupération du profil',
      error: error.message,
    });
  }
});

module.exports = router;
