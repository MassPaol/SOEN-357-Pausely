import { Platform, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import FeedScreen from '../screens/FeedScreen';
import EntryPromptScreen from '../screens/EntryPromptScreen';
import IntroductionScreen from '../screens/IntroductionScreen';
import ExitPromptScreen from '../screens/ExitPromptScreen';
import MidSessionPromptScreen from '../screens/MidSessionPromptScreen';
import QuestionnaireScreen from '../screens/QuestionnaireScreen';
import ResultsScreen from '../screens/ResultsScreen';
import EndSessionPromptScreen from '../screens/EndSessionPromptScreen';
import ResearcherConfigScreen from '../screens/ResearcherConfigScreen';
import { AppLogo } from '../components/AppLogo';

export type RootStackParamList = {
  Feed: undefined;
  Introduction: undefined;
  EntryPrompt: undefined;
  ExitPrompt: undefined;
  MidSessionPrompt: undefined;
  EndSessionPrompt: undefined;
  Questionnaire: undefined;
  Results: undefined;
  ResearcherConfig: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function LogoHeader() {
  return (
    <View
      style={{ paddingTop: 50, marginLeft: Platform.OS === 'ios' ? -85 : 0 }}
    >
      <AppLogo width={250} />
    </View>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="ResearcherConfig"
      screenOptions={{
        headerTitle: () => <LogoHeader />,
        headerTitleAlign: 'left',
        headerShadowVisible: false,
        headerBackVisible: false,
      }}
    >
      <Stack.Screen
        name="Feed"
        component={FeedScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Introduction" component={IntroductionScreen} />
      <Stack.Screen name="EntryPrompt" component={EntryPromptScreen} />
      <Stack.Screen name="ExitPrompt" component={ExitPromptScreen} />
      <Stack.Screen
        name="MidSessionPrompt"
        component={MidSessionPromptScreen}
      />
      <Stack.Screen
        name="EndSessionPrompt"
        component={EndSessionPromptScreen}
      />
      <Stack.Screen name="Questionnaire" component={QuestionnaireScreen} />
      <Stack.Screen name="Results" component={ResultsScreen} />
      <Stack.Screen
        name="ResearcherConfig"
        component={ResearcherConfigScreen}
      />
    </Stack.Navigator>
  );
}
