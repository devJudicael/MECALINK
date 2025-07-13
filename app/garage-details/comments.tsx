import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useCommentStore } from '@/stores/comments';
import { useAuth } from '@/context/AuthContext';
import { Comment } from '@/types/garages';
import { Star, X, Send } from 'lucide-react-native';
import { useGarageStore } from '@/stores/garages';

type CommentsModalProps = {
  visible: boolean;
  onClose: () => void;
  garageId: string;
};

export default function CommentsModal({
  visible,
  onClose,
  garageId,
}: CommentsModalProps) {
  const { comments, isLoading, fetchGarageComments, addComment } =
    useCommentStore();
  const { currentUser } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getGarageById, setSelectedGarage } = useGarageStore();

  useEffect(() => {
    if (visible && garageId) {
      fetchGarageComments(garageId);
    }
  }, [visible, garageId]);

  const handleAddComment = async () => {
    if (!currentUser) {
      Alert.alert(
        'Erreur',
        'Vous devez être connecté pour ajouter un commentaire'
      );
      return;
    }

    if (!newComment.trim()) {
      Alert.alert('Erreur', 'Le commentaire ne peut pas être vide');
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await addComment(garageId, rating, newComment.trim());

      if (success) {
        setNewComment('');
        setRating(5);
        Alert.alert('Succès', 'Votre commentaire a été ajouté avec succès');

        const garageDetails = await getGarageById(garageId);
        // console.log(
        //   '--- garageDetails ---',
        //   JSON.stringify(garageDetails, null, 2)
        // );
        setSelectedGarage(garageDetails);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      Alert.alert('Erreur', "Impossible d'ajouter votre commentaire");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const renderRatingSelector = () => {
    return (
      <View style={styles.ratingSelector}>
        <Text style={styles.ratingLabel}>Votre note :</Text>
        <View style={styles.starsSelector}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              style={styles.starButton}
            >
              <Star
                size={24}
                color={star <= rating ? '#f59e0b' : '#e2e8f0'}
                fill={star <= rating ? '#f59e0b' : 'none'}
              />
            </TouchableOpacity>
          ))}
        </View>
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Commentaires</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        <View style={styles.ratingOverview}>
          <Text style={styles.averageRating}>{calculateAverageRating()}</Text>
          {renderStars(parseFloat(calculateAverageRating()))}
          <Text style={styles.totalReviews}>{comments.length} avis</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>
              Chargement des commentaires...
            </Text>
          </View>
        ) : (
          <>
            {comments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Aucun commentaire pour le moment. Soyez le premier à donner
                  votre avis !
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
          </>
        )}

        {currentUser && (
          <View style={styles.addCommentContainer}>
            {renderRatingSelector()}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ajouter un commentaire..."
                value={newComment}
                onChangeText={setNewComment}
                multiline
                placeholderTextColor="#94a3b8"
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  isSubmitting && styles.sendButtonDisabled,
                ]}
                onPress={handleAddComment}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Send size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
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
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    padding: 8,
  },
  ratingOverview: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
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
    lineHeight: 24,
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
  addCommentContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  ratingSelector: {
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  starsSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 50,
    fontSize: 16,
    maxHeight: 100,
    color: '#000',
  },
  sendButton: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: '#2563eb',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
});
