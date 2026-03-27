import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { useAppInit } from './hooks/useAppInit';
import { useSessionCsvExport } from './hooks/useSessionCsvExport';

export default function App() {
  useAppInit();
  useSessionCsvExport();

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
