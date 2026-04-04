import { PaperProvider } from 'react-native-paper';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import 'react-native-reanimated';
import { theme } from '@/src/theme';

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <View style={styles.root}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>
        <StatusBar style="light" />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
});
