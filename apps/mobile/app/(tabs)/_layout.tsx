import { Redirect, Tabs } from 'expo-router';
import useAuthStore from '@/store/auth-store';
import useCartStore from '@/store/cart-store';
import { TabBarIconProps } from '@/types';
import { Image, Text, View } from 'react-native';
import { images } from '@/constants';
import cn from 'clsx';

const TabBarIcon = ({ focused, icon, title, badge }: TabBarIconProps & { badge?: number }) => (
  <View className="tab-icon">
    <View>
      <Image
        source={icon}
        className="size-7"
        resizeMode="contain"
        tintColor={focused ? '#FE8C00' : '#5D5F6D'}
      />
      {badge !== undefined && badge > 0 && (
        <View className="absolute -right-2 -top-1 min-w-[18px] items-center justify-center rounded-full bg-primary px-1 py-0.5">
          <Text className="text-center text-[10px] font-bold text-white">{badge}</Text>
        </View>
      )}
    </View>
    <Text className={cn('text-sm font-bold', focused ? 'text-primary' : 'text-gray-200')}>
      {title}
    </Text>
  </View>
);

export default function TabsLayout() {
  const { isAuthenticated } = useAuthStore();
  const totalItems = useCartStore((s) => s.getTotalItems());

  if (!isAuthenticated) return <Redirect href="/sign-in" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          borderTopLeftRadius: 50,
          borderTopRightRadius: 50,
          borderBottomLeftRadius: 50,
          borderBottomRightRadius: 50,
          marginHorizontal: 20,
          height: 80,
          position: 'absolute',
          bottom: 40,
          backgroundColor: 'white',
          shadowColor: '#1a1a1a',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon title="Home" icon={images.home} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon title="Search" icon={images.search} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon title="Cart" icon={images.bag} focused={focused} badge={totalItems} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon title="Profile" icon={images.person} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
