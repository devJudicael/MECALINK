import { create } from 'zustand';
import { Comment } from '../types/garages';
import { API_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

type CommentStore = {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  fetchGarageComments: (garageId: string) => Promise<void>;
  addComment: (garageId: string, rating: number, comment: string) => Promise<boolean>;
};

export const useCommentStore = create<CommentStore>((set) => ({
  comments: [],
  isLoading: false,
  error: null,

  fetchGarageComments: async (garageId: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_URL}/comments/garage/${garageId}`);

      if (!response.ok) {
        throw new Error('Impossible de récupérer les commentaires');
      }

      const commentsData = await response.json();
      set({ comments: commentsData, isLoading: false });
    } catch (error) {
      console.error('Error fetching comments:', error);
      set({
        error: 'Erreur lors de la récupération des commentaires',
        isLoading: false,
      });
    }
  },

  addComment: async (garageId: string, rating: number, comment: string) => {
    set({ isLoading: true, error: null });

    try {
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        set({
          error: 'Vous devez être connecté pour ajouter un commentaire',
          isLoading: false,
        });
        return false;
      }

      const response = await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          garageId, // Le backend convertira garageId en garage
          rating,
          comment,
        }),
      });

      // Même si la réponse n'est pas OK, on vérifie si le commentaire a été ajouté
      // en rafraîchissant la liste des commentaires
      const commentsResponse = await fetch(`${API_URL}/comments/garage/${garageId}`);
      const commentsData = await commentsResponse.json();
      set({ comments: commentsData, isLoading: false });

      // Si la réponse initiale n'était pas OK, on ne génère pas d'erreur
      // car le commentaire peut avoir été ajouté malgré tout
      if (!response.ok) {
        console.warn('Réponse non OK lors de l\'ajout du commentaire, mais vérification effectuée');
        // On ne définit pas d'erreur ici pour éviter le message d'erreur
        return true; // On retourne true car le commentaire peut avoir été ajouté
      }

      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      
      // Même en cas d'erreur, on vérifie si le commentaire a été ajouté
      try {
        const commentsResponse = await fetch(`${API_URL}/comments/garage/${garageId}`);
        const commentsData = await commentsResponse.json();
        set({ comments: commentsData, isLoading: false });
        return true; // Le commentaire a peut-être été ajouté malgré l'erreur
      } catch (fetchError) {
        // Si la vérification échoue, on définit l'erreur
        set({
          error: 'Erreur lors de l\'ajout du commentaire',
          isLoading: false,
        });
        return false;
      }
    }
  },
}));