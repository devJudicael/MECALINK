import { Image, StyleSheet, Text, TouchableOpacity, View, ImageSourcePropType } from 'react-native';

interface PubProps {
  imageUrl?: string;
}

const Pub = ({ imageUrl }: PubProps) => {
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        resizeMode="cover"
        source={imageUrl ? { uri: imageUrl } : require('@/assets/images/icon.png')}
      />

      {/* <View className="absolute left-0 w-3/5 p-5">
        <Text className="text-white font-montserrat-bold text-[19px]  ">
          50-40% DE RÉDUCTION
        </Text>

        <Text className="text-white font-montserrat text-[12px]  ">
          Vêtements, chaussures etc.
        </Text>

        <TouchableOpacity className="my-2  py-2 px-4 border flex-row border-white rounded-md justify-between items-center">
          <Text className="text-white font-montserrat-semibold text-[10px]  ">
            VOIR LES OFFRES
          </Text>

          <Image style={{ width: 20, height: 20 }} source={icons.arrowRight} />
        </TouchableOpacity>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    marginVertical: 10,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 8,
  },
});

export default Pub;
