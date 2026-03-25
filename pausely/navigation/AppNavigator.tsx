import { createStackNavigator } from "@react-navigation/stack";

// Import all screens
import FeedScreen from "../screens/FeedScreen";
import EntryPromptScreen from "../screens/EntryPromptScreen";
import ExitPromptScreen from "../screens/ExitPromptScreen";
import MidSessionPromptScreen from "../screens/MidSessionPromptScreen";
import QuestionnaireScreen from "../screens/QuestionnaireScreen";
import ResultsScreen from "../screens/ResultsScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
    return (
        <Stack.Navigator
            initialRouteName="Feed"
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
    )
}