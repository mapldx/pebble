import { NativeWindStyleSheet } from "nativewind";
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard, 
  SafeAreaView, 
  Image, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

import * as AppleAuthentication from 'expo-apple-authentication';
import * as SecureStore from 'expo-secure-store';

import { useNavigation } from "@react-navigation/native";

import axios from 'axios';

async function getValueFor(key) {
  return await SecureStore.getItemAsync(key);
}

export default function Settings() {
  const navigation = useNavigation();

  [uid, setUid] = useState(null);
  [authApple, setAuthApple] = useState(null);
  [email, setEmail] = useState(null);
  [ics_feed, setFeed] = useState(null);

  useEffect(() => {
    // alert(await SecureStore.getItemAsync("uid"));
    async function init() {
      setUid(await getValueFor('uid'));
      await AppleAuthentication.getCredentialStateAsync(uid).then((state) => {
        if (state === AppleAuthentication.AppleAuthenticationCredentialState.AUTHORIZED) {
          setAuthApple(true);
        } else {
          setAuthApple(false);
        }
      });
    }
    init().then(() => {
      if (uid.length > 0) {
        axios.get('http://192.168.1.133:3000/api/auth/get?uid=' + uid).then((response) => {
          setEmail(response.data.email);
        }).catch((error) => {
          alert('Error getting email: ' + error);
        });
      }
    });
  });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1">
        <View
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
          style={{ flex: 1 }}
        >
          <View className="flex-1">
            <View className="pt-12 items-center justify-center">
              <Text className="self-start p-4 text-4xl font-extrabold">Settings</Text>
              <Image source={require('../assets/cover.png')} style={{ width: 400, height: 150 }} className="rounded-lg" />
              <StatusBar style="auto" />
            </View>
            <View className="m-3 flex-1 rounded-lg pt-6">
              <Text className="mb-2 px-3 opacity-50">ACCOUNT</Text>
              {uid && (
                <View>
                  <TouchableOpacity className="bg-gray-300 rounded-lg border-b border-gray-200 p-4 -mb-1" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', padding: 16 }}
                    onPress={async () => {
                      Alert.alert(
                        "Manage account",
                        `${email}: ${uid}`,
                        [
                          {
                            text: "Back",
                            style: "cancel"
                          },
                          {
                            text: "Sign out", onPress: async () => {
                              await SecureStore.deleteItemAsync('uid');
                              setUid(null);
                              setAuthApple(false);
                            }
                          }
                        ],
                        { cancelable: false }
                      );
                    }}
                  >
                    <Ionicons name="person" size={24} color="gray" />
                    <Text className="text-md font-bold">Manage account</Text>
                    <Ionicons name="ios-arrow-forward" size={24} color="gray" />
                  </TouchableOpacity>
                </View>
              )}
              <Text className="mb-2 px-3 opacity-50 mt-6">INTEGRATIONS</Text>
              {uid && (
                <View>
                  <TouchableOpacity className="bg-gray-300 rounded-lg border-b border-gray-200 p-4 -mb-1" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', padding: 16 }}
                    onPress={() => {
                      Alert.prompt(
                        "Automatically sync tasks",
                        "Enter your calendar URL as retrieved from purdue.brightspace.com. This will be used to sync your Brightspace tasks to your Pebblespace.\n\nNote: This does not provide us with any access to your Brightspace account.",
                        [
                          {
                            text: "Cancel",
                            onPress: () => {},
                            style: "cancel"
                          },
                          {
                            text: "OK", onPress: () => {}
                          }
                        ]
                      )
                    }}
                  >
                    <Ionicons name="link" size={24} color="gray" />
                    <Text className="text-md font-bold">Sync your Brightspace tasks?</Text>
                    <Ionicons name="ios-arrow-forward" size={24} color="gray" />
                  </TouchableOpacity>
                </View>
              )}
              <Text className="mb-2 px-3 opacity-50 mt-6">SUPPORT</Text>
              {uid && (
                <View>
                  <TouchableOpacity className="bg-gray-300 rounded-lg border-b border-gray-200 p-4 -mb-1" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', padding: 16 }}>
                    <Ionicons name="podium-sharp" size={24} color="gray" />
                    <Text className="text-md font-bold">Analytics</Text>
                    <Ionicons name="ios-arrow-forward" size={24} color="gray" />
                  </TouchableOpacity>
                  <TouchableOpacity className="bg-gray-300 border-b border-gray-200 p-4 -mb-1" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', padding: 16 }}>
                    <Ionicons name="reader-sharp" size={24} color="gray" />
                    <Text className="text-md font-bold">Credits</Text>
                    <Ionicons name="ios-arrow-forward" size={24} color="gray" />
                  </TouchableOpacity>
                  <TouchableOpacity className="bg-gray-300 rounded-b-lg border-b border-gray-200 p-4 -mb-1" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', padding: 16 }}>
                    <Ionicons name="mail" size={24} color="gray" />
                    <Text className="text-md font-bold">Email</Text>
                    <Ionicons name="ios-arrow-forward" size={24} color="gray" />
                  </TouchableOpacity>
                </View>
              )}
              {uid === null && (
                <View className="pt-6 items-center align-center">
                  <AppleAuthentication.AppleAuthenticationButton
                    buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
                    buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                    cornerRadius={10}
                    style={styles.button}
                    onPress={async () => {
                      if (uid === null) {
                        try {
                          const credential = await AppleAuthentication.signInAsync({
                            requestedScopes: [
                              AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                              AppleAuthentication.AppleAuthenticationScope.EMAIL,
                            ],
                          });
                          if (uid === null || !authApple) {
                            axios.get('http://192.168.1.133:3000/api/auth/check?uid=' + credential.user).then((response) => {
                              if (response.data.exists) {
                                console.log('User exists');
                              } else {
                              }
                            }).catch((error) => {
                              // alert('Error creating user: ' + error);
                              console.log('User does not exist');
                              console.log(credential);
                              axios.post('http://192.168.1.133:3000/api/auth/create', {
                                credential: credential,
                              }).then((response) => {
                                alert(response);
                                console.log(response);
                              }).catch((error) => {
                                alert('Error creating user: ' + error);
                              });
                            });
                            await SecureStore.setItemAsync('uid', credential.user);
                            setUid(credential.user);
                          }
                        } catch (e) {
                          if (e.code === 'ERR_REQUEST_CANCELED') {
                            alert('User cancelled sign in');
                          } else {
                            alert('Error signing in: ' + e);
                          }
                        }
                      } else {
                        alert('You are already signed in as ' + email);
                      }
                    }}
                  />
                  <Text className="mt-3 mb-3 text-center opacity-60">{authApple ? `${email} is authenticated as ${uid}` : "No user object found"}</Text>
                </View>
              )}
            </View>
            <Text className="self-center">v0.0.1 - pre-alpha</Text>
          </View>
        </View>
        <TouchableOpacity className="absolute top-0 left-0 p-4 mt-8" onPress={() => navigation.goBack()}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="arrow-back" size={21} color="gray" />
          </View>
        </TouchableOpacity>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 200,
    height: 44,
  },
  inner: {
    padding: 24,
    flex: 1,
    justifyContent: 'space-around',
  },
  header: {
    fontSize: 36,
    marginBottom: 48,
  },
  textInput: {
    height: 40,
    borderColor: '#000000',
    borderBottomWidth: 1,
    marginBottom: 36,
  },
  btnContainer: {
    backgroundColor: 'blue',
    marginTop: 12,
  },
});

NativeWindStyleSheet.setOutput({
  default: "native",
});

