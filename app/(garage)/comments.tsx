import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';
import { useCommentStore } from '@/stores/comments';
import { Comment } from '@/types/garages';
import { Star, MessageSquare } from 'lucide-react-native';
import { API_URL } from '@/config/api';

export default function GarageCommentsScreen() {
  const { currentUser } = useAuth();
  const { comments, isLoading, error, fetchGarageComments } = useCommentStore();
  const [garageId, setGarageId] = useState<string | null>(null);

  useEffect(() => {
    const loadGarageId = async () => {
      if (!currentUser) return;

      try {
        // Récupérer l'ID du garage associé à l'utilisateur connecté
        const response = await fetch(`${API_URL}/garages/profile`, {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem('authToken')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Impossible de récupérer les informations du garage');
        }

        const data = await response.json();
        if (data.garage && data.garage._id) {
          setGarageId(data.garage._id);
          fetchGarageComments(data.garage._id);
        }
      } catch (error) {
        console.error('Error fetching garage ID:', error);
      }
    };

    loadGarageId();
  }, [currentUser]);

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            color={star <= rating ? '#f59e0b' : '#e2e8f0'}
            fill={star <= rating ? '#f59e0b' : 'none'}
          />
        ))}
      </View>
    );
  };

  const renderCommentItem = ({ item }: { item: Comment }) => {
    const date = new Date(item.createdAt);
    const formattedDate = `${date.toLocaleDateString()} à ${date.toLocaleTimeString(
      undefined,
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    )}`;

    return (
      <View style={styles.commentItem}>
        <View style={styles.commentHeader}>
          <Text style={styles.userName}>{item.userName}</Text>
          {renderStars(item.rating)}
        </View>
        <Text style={styles.commentText}>{item.comment}</Text>
        <Text style={styles.commentDate}>{formattedDate}</Text>
      </View>
    );
  };

  const calculateAverageRating = () => {
    if (comments.length === 0) return 0;
    const sum = comments.reduce((acc, comment) => acc + comment.rating, 0);
    return (sum / comments.length).toFixed(1);
  };

  if (!currentUser || currentUser.role !== 'garage') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Vous devez être connecté en tant que garage pour accéder à cette
            page.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <MessageSquare size={24} color="#059669" />
        <Text style={styles.headerTitle}>Commentaires des clients</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.ratingOverview}>
          <Text style={styles.averageRating}>{calculateAverageRating()}</Text>
          {renderStars(parseFloat(calculateAverageRating()))}
          <Text style={styles.totalReviews}>
            {comments.length} avis au total
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={styles.loadingText}>
              Chargement des commentaires...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : comments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Vous n'avez pas encore reçu de commentaires.
            </Text>
          </View>
        ) : (
          <FlatList
            data={comments}
            renderItem={renderCommentItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.commentsList}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  content: {
    flex: 1,
  },
  ratingOverview: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  averageRating: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  totalReviews: {
    fontSize: 14,
    color: '#64748b',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  commentsList: {
    padding: 16,
  },
  commentItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  commentText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
    marginBottom: 8,
  },
  commentDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
});
