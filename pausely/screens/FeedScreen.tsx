import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useSession } from '../context/sessionStore';

const FeedScreen = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Feed'>) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Feed Screen</Text>
      <Text style={styles.text}>This is a placeholder.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    marginBottom: 20,
  },
});

export default FeedScreen;
