import {
  ActivityIndicator,
  Alert,
  Image,
  ImageSourcePropType,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { images } from '@/constants';
import { userService } from '@/services';
import useAuthStore from '@/store/auth-store';

const ProfileField = ({
  icon,
  label,
  value,
}: {
  icon: ImageSourcePropType;
  label: string;
  value: string;
}) => (
  <View className="mb-6 flex-row items-center gap-4">
    <View className="size-12 items-center justify-center rounded-full bg-primary/10">
      <Image source={icon} className="size-5" resizeMode="contain" tintColor="#FE8C00" />
    </View>
    <View className="flex-1">
      <Text className="body-regular text-gray-200">{label}</Text>
      <Text className="paragraph-semibold text-dark-100" numberOfLines={2}>
        {value}
      </Text>
    </View>
  </View>
);

export default function Profile() {
  const { signOut } = useAuthStore();

  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: userService.getProfile,
  });

  const address1 = profile?.addresses?.[0];
  const address2 = profile?.addresses?.[1];

  const formatAddress = (address?: {
    address: string;
    city: string;
    district: string;
    postalCode: string | null;
  }) => {
    if (!address) return 'No address added';

    return [address.address, address.district, address.city, address.postalCode]
      .filter(Boolean)
      .join(', ');
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/sign-in');
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Edit profile screen will be added next.');
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-center flex-1">
          <ActivityIndicator size="large" color="#FE8C00" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-center flex-1 gap-4 px-6">
          <Text className="h3-bold text-center text-dark-100">Profile could not be loaded</Text>

          <TouchableOpacity className="rounded-full bg-primary px-8 py-3" onPress={() => refetch()}>
            <Text className="paragraph-semibold text-white">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-32 pt-5">
        {/* Header Section */}
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Image source={images.arrowBack} className="size-7" resizeMode="contain" />
          </TouchableOpacity>

          <Text className="base-bold text-dark-100">Profile</Text>

          <TouchableOpacity onPress={() => router.push('/search')}>
            <Image source={images.search} className="size-7" resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* Avatar Section */}
        <View className="mt-10 items-center">
          <View className="relative">
            <Image
              source={images.avatar}
              className="size-32 rounded-full border-2 border-[#FE8C00] shadow-lg"
              resizeMode="cover"
            />

            <TouchableOpacity
              className="absolute bottom-1 right-1 size-9 items-center justify-center rounded-full bg-primary"
              onPress={handleEditProfile}>
              <Image
                source={images.pencil}
                className="size-4"
                resizeMode="contain"
                tintColor="white"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Card */}
        <View className="mt-10 rounded-3xl bg-white px-5 py-7 shadow-lg shadow-black/10">
          <ProfileField icon={images.user} label="Full Name" value={profile.name} />

          <ProfileField icon={images.envelope} label="Email" value={profile.email} />

          <ProfileField
            icon={images.phone}
            label="Phone"
            value={profile.phone || 'No phone number added'}
          />

          <ProfileField
            icon={images.location}
            label={`Address 1 - (${address1?.title ?? 'Home'})`}
            value={formatAddress(address1)}
          />

          <ProfileField
            icon={images.location}
            label={`Address 2 - (${address2?.title ?? 'Work'})`}
            value={formatAddress(address2)}
          />
        </View>

        {/* Buttons */}
        <TouchableOpacity
          className="mt-8 rounded-full border border-primary py-4"
          onPress={handleEditProfile}>
          <Text className="paragraph-semibold text-center text-primary">Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="mt-5 flex-row items-center justify-center gap-2 rounded-full border border-error py-4"
          onPress={handleLogout}>
          <Image
            source={images.logout}
            className="size-5"
            resizeMode="contain"
            tintColor="#F14141"
          />
          <Text className="paragraph-semibold text-error">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
