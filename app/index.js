import { NativeWindStyleSheet } from "nativewind";
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { Link } from "expo-router";

import * as SecureStore from 'expo-secure-store';

export default function Page() {
  useEffect(() => {
  });

  return (
    <View className="flex-1">
      <View className="flex-1 items-center justify-center">
        <StatusBar style="auto" />
      </View>
      <TouchableOpacity className="fixed bottom-0 left-0 right-0 p-6 flex-row-reverse items-center">
        <Link replace href="/settings">
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="settings" size={21} color="gray" />
            <Text className="text-gray-400 text-lg font-bold ml-1">Settings</Text>
          </View>
        </Link>
      </TouchableOpacity>
    </View>
  );
}

NativeWindStyleSheet.setOutput({
  default: "native",
});
