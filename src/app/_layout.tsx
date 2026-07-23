import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { TopBar } from '@/components/top-bar';
import { Sidebar } from '@/components/sidebar';
import { initDatabase } from '@/services/database';
import { useAppStore } from '@/stores/app-store';
import { useProfileStore } from '@/stores/profile-store';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const loadSettings = useAppStore((s) => s.loadSettings);
  const settings = useAppStore((s) => s.settings);
  const loaded = useAppStore((s) => s.loaded);
  const loadProfiles = useProfileStore((s) => s.loadProfiles);

  useEffect(() => {
    initDatabase().then(() => {
      loadSettings();
      loadProfiles();
    });
  }, [loadSettings, loadProfiles]);

  useEffect(() => {
    if (loaded && !settings.onboardingComplete) {
      router.replace('/onboarding');
    }
  }, [loaded, settings.onboardingComplete]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AnimatedSplashOverlay />
      <TopBar />
      <View style={styles.content}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="blueprint" />
          <Stack.Screen name="profiles" />
          <Stack.Screen name="profile-create" />
          <Stack.Screen name="numerology" />
          <Stack.Screen name="angel-numbers" />
          <Stack.Screen name="tarot" />
          <Stack.Screen name="astrology" />
          <Stack.Screen name="compatibility" />
          <Stack.Screen name="forecast" />
          <Stack.Screen name="letterology" />
          <Stack.Screen name="dreams" />
          <Stack.Screen name="chakras" />
          <Stack.Screen name="spirit-animals" />
          <Stack.Screen name="moon-calendar" />
          <Stack.Screen name="journal" />
          <Stack.Screen name="enemy-years" />
          <Stack.Screen name="planet-influence" />
          <Stack.Screen name="element-balance" />
          <Stack.Screen name="life-cycles" />
          <Stack.Screen name="sacred-geometry" />
          <Stack.Screen name="brands" />
          <Stack.Screen name="brand/[slug]" />
          <Stack.Screen name="reports" />
          <Stack.Screen name="birth-chart" />
          <Stack.Screen name="transits" />
          <Stack.Screen name="insights" />
          <Stack.Screen name="share" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="favorites" />
          <Stack.Screen name="backup" />
          <Stack.Screen name="widgets" />
          <Stack.Screen name="analytics" />
          <Stack.Screen name="search" />
        </Stack>
      </View>
      <Sidebar />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
