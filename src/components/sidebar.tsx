import { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  Text,
  ScrollView,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/stores/app-store';
import { useProfileStore } from '@/stores/profile-store';
import { SidebarWidth } from '@/constants/theme';
import { CosmicIcon, type CosmicIconName } from '@/components/cosmic-icon';
import type { CosmicModule } from '@/types/cosmic';

interface NavItem {
  module: CosmicModule;
  label: string;
  icon: CosmicIconName;
  route: string;
}

const NAV_ITEMS: NavItem[] = [
  { module: 'home', label: 'Home', icon: 'Home2', route: '/' },
  { module: 'blueprint', label: 'Cosmic Blueprint', icon: 'MagicStar', route: '/blueprint' },
  { module: 'profile', label: 'Profiles', icon: 'Profile2User', route: '/profiles' },
  { module: 'onboarding', label: 'Onboarding', icon: 'InfoCircle', route: '/onboarding' },
  { module: 'enemy-years', label: 'Enemy Years', icon: 'ShieldCross', route: '/enemy-years' },
  { module: 'planet-influence', label: 'Planets', icon: 'Global', route: '/planet-influence' },
  { module: 'element-balance', label: 'Element Balance', icon: 'Drop', route: '/element-balance' },
  { module: 'life-cycles', label: 'Life Cycles', icon: 'Refresh', route: '/life-cycles' },
  { module: 'sacred-geometry', label: 'Sacred Geometry', icon: 'Box', route: '/sacred-geometry' },
  { module: 'reports', label: 'Reports', icon: 'Book1', route: '/reports' },
  { module: 'birth-chart', label: 'Birth Chart', icon: 'Flash', route: '/birth-chart' },
  { module: 'transits', label: 'Transits', icon: 'Global', route: '/transits' },
  { module: 'insights', label: 'Insights', icon: 'MessageText1', route: '/insights' },
  { module: 'share', label: 'Share', icon: 'Send2', route: '/share' },
  { module: 'notifications', label: 'Notifications', icon: 'Notification', route: '/notifications' },
  { module: 'favorites', label: 'Favorites', icon: 'Heart', route: '/favorites' },
  { module: 'backup', label: 'Backup & Restore', icon: 'Cloud', route: '/backup' },
  { module: 'widgets', label: 'Widgets', icon: 'Element2', route: '/widgets' },
  { module: 'analytics', label: 'Analytics', icon: 'Chart2', route: '/analytics' },
  { module: 'numerology', label: 'Numerology', icon: 'Hashtag', route: '/numerology' },
  { module: 'astrology', label: 'Astrology', icon: 'Sun1', route: '/astrology' },
  { module: 'tarot', label: 'Tarot', icon: 'Card', route: '/tarot' },
  { module: 'angel-numbers', label: 'Angel Numbers', icon: 'Star1', route: '/angel-numbers' },
  { module: 'compatibility', label: 'Compatibility', icon: 'Heart', route: '/compatibility' },
  { module: 'forecast', label: 'Forecast', icon: 'TrendUp', route: '/forecast' },
  { module: 'letterology', label: 'Letterology', icon: 'Text', route: '/letterology' },
  { module: 'dreams', label: 'Dreams', icon: 'Moon', route: '/dreams' },
  { module: 'chakras', label: 'Chakras', icon: 'OmegaCircle', route: '/chakras' },
  { module: 'spirit-animals', label: 'Spirit Animals', icon: 'Pet', route: '/spirit-animals' },
  { module: 'moon-calendar', label: 'Moon Calendar', icon: 'Calendar1', route: '/moon-calendar' },
  { module: 'journal', label: 'Journal', icon: 'Book1', route: '/journal' },
  { module: 'settings', label: 'Settings', icon: 'Setting2', route: '/settings' },
  { module: 'brands', label: 'Brands', icon: 'Element2', route: '/brands' },
  { module: 'search', label: 'Search', icon: 'SearchNormal1', route: '/search' },
];

export function Sidebar() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const activeModule = useAppStore((s) => s.activeModule);
  const setActiveModule = useAppStore((s) => s.setActiveModule);
  const activeProfile = useProfileStore((s) => s.activeProfile);
  const profiles = useProfileStore((s) => s.profiles);

  const [slideAnim] = useState(() => new Animated.Value(-SidebarWidth));
  const [fadeAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: sidebarOpen ? 0 : -SidebarWidth,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: sidebarOpen ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [sidebarOpen, slideAnim, fadeAnim]);

  const navigate = (item: NavItem) => {
    setActiveModule(item.module);
    setSidebarOpen(false);
    router.navigate(item.route);
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={() => setSidebarOpen(false)}>
        <Animated.View
          style={[
            styles.overlay,
            { backgroundColor: theme.overlay, opacity: fadeAnim },
          ]}
          pointerEvents={sidebarOpen ? 'auto' : 'none'}
        />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.sidebar,
          {
            backgroundColor: theme.sidebarBg,
            borderRightColor: theme.border,
            paddingTop: insets.top,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <View style={[styles.profileSection, { borderBottomColor: theme.border }]}>
          <View style={styles.profileRow}>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.text }]}>
                {activeProfile?.name ?? 'No Profile'}
              </Text>
              <Text style={[styles.profileSub, { color: theme.textSecondary }]}>
                {profiles.length > 0
                  ? `${profiles.length} profile${profiles.length !== 1 ? 's' : ''}`
                  : 'No profiles yet'}
              </Text>
            </View>
            <Pressable
              onPress={() => setSidebarOpen(false)}
              style={({ pressed }) => [
                styles.closeBtn,
                { backgroundColor: pressed ? theme.surface : 'transparent' },
              ]}
              hitSlop={8}
            >
              <Text style={[styles.closeIcon, { color: theme.textSecondary }]}>✕</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeModule === item.module;
            return (
              <Pressable
                key={item.module}
                onPress={() => navigate(item)}
                style={({ pressed }) => [
                  styles.navItem,
                  {
                    backgroundColor: isActive
                      ? theme.accent
                      : pressed
                        ? theme.surface
                        : 'transparent',
                  },
                ]}
              >
                <View style={styles.navIcon}>
                  <CosmicIcon name={item.icon} size={20} color={isActive ? '#ffffff' : theme.textSecondary} />
                </View>
                <Text
                  style={[
                    styles.navLabel,
                    {
                      color: isActive ? '#ffffff' : theme.text,
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Animated.View>
    </>
  );
}



const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SidebarWidth,
    zIndex: 101,
    borderRightWidth: 1,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  profileSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
  },
  profileSub: {
    fontSize: 13,
    marginTop: 4,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  closeIcon: {
    fontSize: 18,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginHorizontal: 8,
    marginVertical: 1,
    borderRadius: 10,
  },
  navIcon: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 15,
    marginLeft: 12,
  },
});
