import { View, Text, Alert } from 'react-native';
import React, { useState } from 'react';
import { Link, router } from 'expo-router';
import CustomInput from '@/components/ui/CustomInput';
import CustomButton from '@/components/ui/CustomButton';
import { authService } from '@/services';
import useAuthStore from '@/store/auth-store';
import * as Sentry from '@sentry/react-native';

const SignUp = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { setIsAuthenticated, setUser } = useAuthStore();

  const submit = async () => {
    const { name, email, password } = form;

    if (!name || !email || !password)
      return Alert.alert('Error', 'Please enter valid name, email address & password.');

    setIsSubmitting(true);

    try {
      const { user } = await authService.register(name, email, password);
      setUser(user);
      setIsAuthenticated(true);
      router.replace('/');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      Alert.alert('Error', message);
      Sentry.captureException(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="mt-5 gap-10 rounded-lg bg-white p-5">
      <CustomInput
        placeholder="Enter your full name"
        value={form.name}
        onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
        label="Full name"
      />
      <CustomInput
        placeholder="Enter your email"
        value={form.email}
        onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
        label="Email"
        keyboardType="email-address"
      />
      <CustomInput
        placeholder="Enter your password"
        value={form.password}
        onChangeText={(text) => setForm((prev) => ({ ...prev, password: text }))}
        label="Password"
        secureTextEntry={true}
      />

      <CustomButton title="Sign Up" isLoading={isSubmitting} onPress={submit} />

      <View className="mt-5 flex flex-row justify-center gap-2">
        <Text className="base-regular text-gray-100">Already have an account?</Text>
        <Link href="/sign-in" className="base-bold text-primary">
          Sign In
        </Link>
      </View>
    </View>
  );
};

export default SignUp;
