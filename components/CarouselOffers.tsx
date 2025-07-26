import { memo, useCallback, useRef, useState, useEffect } from 'react';
import { Dimensions, StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, {
  ICarouselInstance,
  Pagination,
} from 'react-native-reanimated-carousel';
import Pub from './Pub';
import axios from 'axios';
import { API_ENDPOINTS } from '@/config/api';

const width = Dimensions.get('window').width - 35;

// MEMO du composant enfant
const MemoizedPub = memo(Pub);

interface Advertisement {
  _id: string;
  imageUrl: string;
  title: string;
  description: string;
  link: string;
  isActive: boolean;
}

function CarouselOffers() {
  const ref = useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(API_ENDPOINTS.ADVERTISEMENTS.ALL);
        setAdvertisements(response.data);
      } catch (err) {
        console.error('Erreur lors de la récupération des publicités:', err);
        setError('Impossible de charger les publicités');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdvertisements();
  }, []);

  const onPressPagination = useCallback(
    (index: number) => {
      ref.current?.scrollTo({
        count: index - progress.value,
        animated: true,
      });
    },
    [progress]
  );

  // useCallback pour éviter de recréer renderItem
  const renderItem = useCallback(
    ({ index }: { index: number }) => {
      // Si nous avons des publicités, utiliser leur URL d'image
      // Sinon, utiliser l'image par défaut (gérée dans le composant Pub)
      const imageUrl = advertisements.length > 0 && index < advertisements.length
        ? advertisements[index].imageUrl
        : undefined;
        
      return (
        <View key={index.toString()} style={{ flex: 1, marginHorizontal: 3 }}>
          <MemoizedPub imageUrl={imageUrl} />
        </View>
      );
    },
    [advertisements]
  );

  // Utiliser les données des publicités si disponibles, sinon utiliser un tableau par défaut
  const carouselData = advertisements.length > 0 
    ? advertisements 
    : [...new Array(3).keys()];
    
  if (loading) {
    return (
      <View style={[styles.wrapper, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }
  
  return (
    <View style={styles.wrapper}>
      {/* Images Carousel */}
      <Carousel
        ref={ref}
        width={width}
        height={200}
        autoPlayInterval={4000}
        data={carouselData}
        loop
        autoPlay
        pagingEnabled
        snapEnabled={false}
        onProgressChange={progress}
        overscrollEnabled
        style={{ gap: 30 }}
        containerStyle={{
          gap: 30,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        renderItem={renderItem}
      />

      {/* Pagination */}
      <Pagination.Custom
        progress={progress}
        data={carouselData}
        onPress={onPressPagination}
        size={10}
        activeDotStyle={{
          backgroundColor: '#1890FF',
          width: 12,
          height: 12,
        }}
        dotStyle={{
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderRadius: 50,
        }}
        containerStyle={{ gap: 5, marginTop: 5, alignItems: 'center' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    justifyContent: 'center',
    width: '100%',
  },
  loadingContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    position: 'absolute',
    zIndex: 10,
    width: 40,
    height: 40,
    top: '40%',
    backgroundColor: '#BBBBBB',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftButton: {
    left: 0,
  },
  rightButton: {
    right: 0,
  },
  icon: {
    width: 24,
    height: 24,
  },
});

export default CarouselOffers;
