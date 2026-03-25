import { createNativeStackNavigator } from '@react-navigation/native-stack';

import FeedScreen from '../screens/FeedScreen';
import EntryPromptScreen from '../screens/EntryPromptScreen';
import ExitPromptScreen from '../screens/ExitPromptScreen';
import MidSessionPromptScreen from '../screens/MidSessionPromptScreen';
import QuestionnaireScreen from '../screens/QuestionnaireScreen';
import ResultsScreen from '../screens/ResultsScreen';
import EndSessionPromptScreen from '../screens/EndSessionPromptScreen';

export type RootStackParamList = {
  Feed: undefined;
  EntryPrompt: undefined;
  ExitPrompt: undefined;
  MidSessionPrompt: undefined;
  EndSessionPrompt: undefined;
  Questionnaire: undefined;
  Results: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="EntryPrompt"
      screenOptions={{ headerShown: true }}
    >
      <Stack.Screen
        name="Feed"
        component={FeedScreen}
        options={{ title: 'My Daily Feed' }}
      />
      <Stack.Screen
        name="EntryPrompt"
        component={EntryPromptScreen}
        options={{ title: 'Entry Prompt' }}
      />
      <Stack.Screen
        name="ExitPrompt"
        component={ExitPromptScreen}
        options={{ title: 'Exit Prompt' }}
      />
      <Stack.Screen
        name="MidSessionPrompt"
        component={MidSessionPromptScreen}
        options={{ title: 'Mid-Session Prompt' }}
      />
      <Stack.Screen
        name="EndSessionPrompt"
        component={EndSessionPromptScreen}
        options={{ title: 'End-Session Prompt' }}
      />
      <Stack.Screen
        name="Questionnaire"
        component={QuestionnaireScreen}
        options={{ title: 'Questionnaire' }}
      />
      <Stack.Screen
        name="Results"
        component={ResultsScreen}
        options={{ title: 'My Results' }}
      />
    </Stack.Navigator>
  );
}
