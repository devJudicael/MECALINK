# MECALINK API

API backend pour l'application MECALINK, permettant la gestion des utilisateurs, des garages et des demandes de service.

## Technologies utilisées

- Node.js
- Express.js
- MongoDB
- JWT pour l'authentification

## Installation

1. Cloner le dépôt
2. Installer les dépendances :

```bash
cd api
npm install
```

3. Configurer les variables d'environnement :
   - Créer un fichier `.env` à la racine du dossier `api` avec les variables suivantes :

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mecalink
JWT_SECRET=votre_secret_jwt
NODE_ENV=development
```

## Démarrage

```bash
# Mode développement
npm run dev

# Mode production
npm start
```

Le serveur démarrera sur le port 5000 par défaut (ou le port spécifié dans le fichier .env).

## Structure du projet

```
api/
├── src/
│   ├── index.js          # Point d'entrée de l'application
│   ├── models/           # Modèles Mongoose
│   │   ├── User.js
│   │   ├── Garage.js
│   │   └── ServiceRequest.js
│   ├── routes/           # Routes API
│   │   ├── auth.js
│   │   ├── garages.js
│   │   └── serviceRequests.js
│   └── middleware/       # Middleware
│       └── auth.js
├── .env                  # Variables d'environnement
└── package.json
```

## API Endpoints

### Authentification

- `POST /api/auth/register` - Inscription d'un nouvel utilisateur
- `POST /api/auth/login` - Connexion d'un utilisateur
- `GET /api/auth/profile` - Obtenir le profil de l'utilisateur connecté

### Garages

- `GET /api/garages` - Obtenir tous les garages
- `GET /api/garages/nearby` - Obtenir les garages à proximité
- `GET /api/garages/:id` - Obtenir un garage par ID
- `PUT /api/garages/profile` - Mettre à jour le profil d'un garage

### Demandes de service

- `POST /api/service-requests` - Créer une nouvelle demande de service
- `GET /api/service-requests/client` - Obtenir toutes les demandes d'un client
- `GET /api/service-requests/garage` - Obtenir toutes les demandes d'un garage
- `GET /api/service-requests/:id` - Obtenir une demande par ID
- `PATCH /api/service-requests/:id/status` - Mettre à jour le statut d'une demande
- `PATCH /api/service-requests/:id/cancel` - Annuler une demande

## Exemples de requêtes et réponses

### Authentification

#### Inscription d'un client

**Requête:**

```json
POST /api/auth/register

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "0612345678",
  "role": "client"
}
```

**Réponse:**

```json
{
  "message": "Inscription réussie",
  "user": {
    "id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "0612345678",
    "role": "client"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Inscription d'un garage

**Requête:**

```json
POST /api/auth/register

{
  "name": "Garage Central",
  "email": "contact@garagecentral.com",
  "password": "password123",
  "phone": "0612345678",
  "role": "garage",
  "location": {
    "latitude": 48.8566,
    "longitude": 2.3522,
    "address": "123 Avenue des Mécaniciens, Paris"
  },
  "services": ["Réparation moteur", "Changement de pneus", "Diagnostic électronique"]
}
```

**Réponse:**

```json
{
  "message": "Inscription réussie",
  "user": {
    "id": "60d21b4667d0d8992e610c86",
    "name": "Garage Central",
    "email": "contact@garagecentral.com",
    "phone": "0612345678",
    "role": "garage",
    "location": {
      "latitude": 48.8566,
      "longitude": 2.3522,
      "address": "123 Avenue des Mécaniciens, Paris"
    }
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Connexion

**Requête:**

```json
POST /api/auth/login

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Réponse:**

```json
{
  "message": "Connexion réussie",
  "user": {
    "id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "0612345678",
    "role": "client"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Garages

#### Obtenir les garages à proximité

**Requête:**

```
GET /api/garages/nearby?latitude=48.8566&longitude=2.3522&radius=10
```

**Réponse:**

```json
[
  {
    "id": "60d21b4667d0d8992e610c86",
    "name": "Garage Central",
    "email": "contact@garagecentral.com",
    "phone": "0612345678",
    "address": "123 Avenue des Mécaniciens, Paris",
    "location": {
      "latitude": 48.8566,
      "longitude": 2.3522
    },
    "services": ["Réparation moteur", "Changement de pneus", "Diagnostic électronique"],
    "rating": 4.5,
    "isOpen": true,
    "openingHours": "Lun-Ven: 9h-18h, Sam: 9h-12h",
    "description": "Garage spécialisé dans la réparation de véhicules toutes marques.",
    "distance": 2.5
  }
]
```

#### Mettre à jour le profil d'un garage

**Requête:**

```json
PUT /api/garages/profile
Authorization: Bearer <token>

{
  "name": "Garage Central Plus",
  "phone": "0612345679",
  "services": ["Réparation moteur", "Changement de pneus", "Diagnostic électronique", "Climatisation"],
  "description": "Garage spécialisé dans la réparation de véhicules toutes marques avec service rapide.",
  "openingHours": "Lun-Ven: 8h-19h, Sam: 9h-17h",
  "isOpen": true,
  "location": {
    "latitude": 48.8567,
    "longitude": 2.3523,
    "address": "125 Avenue des Mécaniciens, Paris"
  }
}
```

**Réponse:**

```json
{
  "message": "Profil du garage mis à jour avec succès",
  "garage": {
    "id": "60d21b4667d0d8992e610c86",
    "name": "Garage Central Plus",
    "email": "contact@garagecentral.com",
    "phone": "0612345679",
    "address": "125 Avenue des Mécaniciens, Paris",
    "location": {
      "latitude": 48.8567,
      "longitude": 2.3523
    },
    "services": ["Réparation moteur", "Changement de pneus", "Diagnostic électronique", "Climatisation"],
    "rating": 4.5,
    "isOpen": true,
    "openingHours": "Lun-Ven: 8h-19h, Sam: 9h-17h",
    "description": "Garage spécialisé dans la réparation de véhicules toutes marques avec service rapide."
  }
}
```

### Demandes de service

#### Créer une demande de service

**Requête:**

```json
POST /api/service-requests
Authorization: Bearer <token>

{
  "garageId": "60d21b4667d0d8992e610c86",
  "description": "Ma voiture ne démarre plus, besoin d'une assistance urgente.",
  "location": {
    "latitude": 48.8570,
    "longitude": 2.3530,
    "address": "45 Rue du Problème, Paris"
  },
  "vehicleInfo": {
    "make": "Renault",
    "model": "Clio",
    "year": "2018",
    "licensePlate": "AB-123-CD"
  },
  "urgency": "high"
}
```

**Réponse:**

```json
{
  "message": "Demande de service créée avec succès",
  "serviceRequest": {
    "id": "60d21b4667d0d8992e610c87",
    "clientId": "60d21b4667d0d8992e610c85",
    "clientName": "John Doe",
    "clientPhone": "0612345678",
    "clientEmail": "john@example.com",
    "garageId": "60d21b4667d0d8992e610c86",
    "garageName": "Garage Central",
    "status": "pending",
    "description": "Ma voiture ne démarre plus, besoin d'une assistance urgente.",
    "location": {
      "latitude": 48.8570,
      "longitude": 2.3530,
      "address": "45 Rue du Problème, Paris"
    },
    "vehicleInfo": {
      "make": "Renault",
      "model": "Clio",
      "year": "2018",
      "licensePlate": "AB-123-CD"
    },
    "urgency": "high",
    "createdAt": "2023-06-15T10:30:00.000Z"
  }
}
```

#### Mettre à jour le statut d'une demande

**Requête:**

```json
PATCH /api/service-requests/60d21b4667d0d8992e610c87/status
Authorization: Bearer <token>

{
  "status": "accepted"
}
```

**Réponse:**

```json
{
  "message": "Statut de la demande mis à jour avec succès",
  "serviceRequest": {
    "id": "60d21b4667d0d8992e610c87",
    "status": "accepted",
    "acceptedAt": "2023-06-15T11:30:00.000Z"
  }
}
```

## Modèles de données

### User

- `name` - Nom de l'utilisateur
- `email` - Email de l'utilisateur (unique)
- `password` - Mot de passe (haché)
- `phone` - Numéro de téléphone
- `role` - Rôle (client ou garage)
- `location` - Localisation (obligatoire pour les garages)
- `isActive` - Statut du compte

### Garage

- `userId` - ID de l'utilisateur associé
- `name` - Nom du garage
- `email` - Email du garage
- `phone` - Numéro de téléphone
- `address` - Adresse
- `location` - Coordonnées géographiques
- `services` - Services proposés
- `rating` - Note moyenne
- `isOpen` - Statut d'ouverture
- `openingHours` - Horaires d'ouverture
- `description` - Description du garage

### ServiceRequest

- `clientId` - ID du client
- `clientName` - Nom du client
- `clientPhone` - Téléphone du client
- `clientEmail` - Email du client
- `garageId` - ID du garage
- `garageName` - Nom du garage
- `status` - Statut de la demande
- `description` - Description du problème
- `location` - Localisation du véhicule
- `vehicleInfo` - Informations sur le véhicule
- `urgency` - Niveau d'urgence
- Timestamps divers (création, acceptation, etc.)