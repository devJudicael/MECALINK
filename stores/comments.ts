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
          garageId,
          rating,
          comment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Erreur lors de l\'ajout du commentaire'
        );
      }

      // Rafraîchir la liste des commentaires
      await fetch(`${API_URL}/comments/garage/${garageId}`)
        .then((res) => res.json())
        .then((commentsData) => {
          set({ comments: commentsData, isLoading: false });
        });

      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      set({
        error: 'Erreur lors de l\'ajout du commentaire',
        isLoading: false,
      });
      return false;
    }
  },
}));