import { Pressable, StyleSheet, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/stores/app-store';
import { TopBarHeight } from '@/constants/theme';
import { CosmicIcon } from '@/components/cosmic-icon';

export function TopBar() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.topbarBg,
          borderBottomColor: theme.border,
          paddingTop: insets.top,
        },
      ]}
    >
      <View style={styles.inner}>
        <Pressable
          onPress={toggleSidebar}
          style={({ pressed }) => [
            styles.iconBtn,
            { backgroundColor: pressed ? theme.surface : 'transparent' },
          ]}
          hitSlop={8}
        >
          <CosmicIcon name="HambergerMenu" size={22} color={theme.text} />
        </Pressable>

        <Pressable onPress={() => router.navigate('/')} style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.accent }]}>Asterion</Text>
        </Pressable>

        <Pressable
          onPress={() => router.navigate('/settings')}
          style={({ pressed }) => [
            styles.iconBtn,
            { backgroundColor: pressed ? theme.surface : 'transparent' },
          ]}
          hitSlop={8}
        >
          <CosmicIcon name="Setting2" size={22} color={theme.text} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  inner: {
    height: TopBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'lowercase',
  },
  icon: {
    fontSize: 22,
  },
  iconSvg: {
    width: 22,
    height: 22,
  },
});
