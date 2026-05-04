import { Alert, Text, View } from 'react-native';
import React, { useState } from 'react';
import CustomInput from '@/components/ui/CustomInput';
import CustomButton from '@/components/ui/CustomButton';
import { Link, router } from 'expo-router';
import { authService } from '@/services';
import useAuthStore from '@/store/auth-store';
import * as Sentry from '@sentry/react-native';

const SignIn = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const { setIsAuthenticated, setUser } = useAuthStore();

  const submit = async () => {
    const { email, password } = form;

    if (!email || !password)
      return Alert.alert('Error', 'Please enter valid email address & password.');

    setIsSubmitting(true);

    try {
      const { user } = await authService.login(email, password);
      setUser(user);
      setIsAuthenticated(true);
      router.replace('/login-success');
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

      <CustomButton title="Sign In" isLoading={isSubmitting} onPress={submit} />

      <View className="mt-5 flex flex-row justify-center gap-2">
        <Text className="base-regular text-gray-100">Don&apos;t have an account?</Text>
        <Link href="/sign-up" className="base-bold text-primary">
          Sign Up
        </Link>
      </View>
    </View>
  );
};

export default SignIn;
