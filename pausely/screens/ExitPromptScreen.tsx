import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';

const ExitPromptScreen = ({ navigation }: StackScreenProps<any>) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exit Prompt Screen</Text>
      <Text>This is a placeholder.</Text>
      <Button 
        title="Go Back" 
        onPress={() => navigation.goBack()} 
      />
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
});

export default ExitPromptScreen;