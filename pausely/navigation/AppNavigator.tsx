import { useRef } from 'react';
import { Pressable, View } from 'react-native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import FeedScreen from '../screens/FeedScreen';
import EntryPromptScreen from '../screens/EntryPromptScreen';
import ExitPromptScreen from '../screens/ExitPromptScreen';
import MidSessionPromptScreen from '../screens/MidSessionPromptScreen';
import QuestionnaireScreen from '../screens/QuestionnaireScreen';
import ResultsScreen from '../screens/ResultsScreen';
import EndSessionPromptScreen from '../screens/EndSessionPromptScreen';
import ResearcherConfigScreen from '../screens/ResearcherConfigScreen';
import { AppLogo } from '../components/AppLogo';

export type RootStackParamList = {
  Feed: undefined;
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
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoTap = () => {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    if (tapCount.current >= 5) {
      tapCount.current = 0;
      navigation.navigate('ResearcherConfig');
    } else {
      tapTimer.current = setTimeout(() => {
        tapCount.current = 0;
      }, 3000);
    }
  };

  return (
    <Pressable onPress={handleLogoTap}>
      <View style={{ paddingTop: 50, marginLeft: -85 }}>
        <AppLogo width={250} />
      </View>
    </Pressable>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="EntryPrompt"
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
