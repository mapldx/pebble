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
  ScrollView,
  Alert,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

import * as AppleAuthentication from 'expo-apple-authentication';
import * as SecureStore from 'expo-secure-store';
import * as Updates from 'expo-updates';

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

  const runTypeMessage = Updates.isEmbeddedLaunch
    ? 'Feature inactive'
    : 'Active bundle';

  useEffect(() => {
    // alert(await SecureStore.getItemAsync("uid"));
    async function init() {
      try {
        setUid(await getValueFor('uid'));
        await AppleAuthentication.getCredentialStateAsync(uid).then((state) => {
          if (state === AppleAuthentication.AppleAuthenticationCredentialState.AUTHORIZED) {
            setAuthApple(true);
          } else {
            setAuthApple(false);
          }
        });
      } catch {
        //
      }
    }
    init().then(() => {
      if (uid && uid.length > 0) {
        axios.get('https://pebble-server.fly.dev/api/auth/get?uid=' + uid).then((response) => {
          setEmail(response.data.email);
        }).catch((error) => {
          // alert('Error getting email: ' + error);
        });
      }
    });
  });

  const setIcsFeed = async (icsFeed) => {
    try {
      const response = await axios.put('https://pebble-server.fly.dev/api/auth/update?uid=' + uid, {
        icsFeedUrl: icsFeed,
      });
      // console.log(response);
    } catch (error) {
      // console.log(error);
      // alert('Error updating user');
      return;
    }
    Alert.alert('Success', 'Your calendar events will now be synced to Pebble.', [
      {
        text: 'OK',
        onPress: () => { },
      },
    ]);
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1">
        <ScrollView>
          <View
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
            style={{ flex: 1 }}
          >
            <View className="flex-1">
              <View className="pt-12 items-center justify-center">
                <Text className="self-start p-4 text-4xl font-extrabold">Settings</Text>
                <Image source={require('../assets/cover.png')} style={{ height: 150 }} className="rounded-lg w-11/12" />
                <StatusBar style="auto" />
              </View>
              <View className="m-3 flex-1 rounded-lg pt-6">
                {uid && (
                  <View>
                    <TouchableOpacity activeOpacity={1}>
                      <Text className="mb-2 px-3 opacity-50">ACCOUNT</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-gray-300 rounded-lg border-b border-gray-200 p-4 -mb-1" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', padding: 16 }}
                      onPress={async () => {
                        Alert.alert(
                          "Manage account",
                          `You are logged in as ${email}.\n\nThank you for being a part of the Pebble community! 🎉`,
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
                    {
                      /* <TouchableOpacity className="bg-gray-300 rounded-lg border-b border-gray-200 p-4 -mb-1" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', padding: 16 }}
                          onPress={async () => {
                            navigation.navigate('Report');
                          }}
                        >
                          <Ionicons name="bar-chart" size={24} color="gray" />
                          <Text className="text-md font-bold">Create a report</Text>
                          <Ionicons name="ios-arrow-forward" size={24} color="gray" />
                        </TouchableOpacity> */
                    }
                  </View>
                )}
                {uid && (
                  <View>
                    <TouchableOpacity activeOpacity={1}>
                      <Text className="mb-2 px-3 opacity-50 mt-6">GENERAL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-gray-300 rounded-t-lg border-b border-gray-200 p-4 -mb-1" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', padding: 16 }}
                      onPress={() => {
                        Alert.alert(
                          "How to use Pebble",
                          "1. Create a task by assigning it a name, workload estimate, and due date\n\n2. Practice day-blocking by assigning it to a day, ideally before its due date\n\n3. Once complete, swipe right to mark a task as complete (if need be, swipe left to mark it as incomplete)\n\n4. Repeat and enjoy!",
                          [
                            {
                              text: "Back", onPress: (value) => {
                                // setIcsFeed(value);
                              }
                            }
                          ]
                        )
                      }}
                    >
                      <Ionicons name="color-wand-sharp" size={24} color="gray" />
                      <Text className="text-md font-bold">Tips & tricks</Text>
                      <Ionicons name="ios-arrow-forward" size={24} color="gray" />
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-gray-300 rounded-t-lg border-b border-gray-200 p-4 -mb-1" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', padding: 16 }}
                      onPress={() => {
                        Alert.alert(
                          // "Enter a valid calendar URL",
                          // "This will populate the unassigned section automatically with your tasks every two weeks.",
                          "Coming soon 👀",
                          "Soon, the unassigned section will be populated automatically with your tasks on a regular basis.\n\nStay tuned!",
                          [
                            {
                              text: "Back", onPress: (value) => {
                                // setIcsFeed(value);
                              }
                            }
                          ]
                        )
                      }}
                    >
                      <Ionicons name="link" size={24} color="gray" />
                      <Text className="text-md font-bold">Sync calendar events</Text>
                      <Ionicons name="ios-arrow-forward" size={24} color="gray" />
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-gray-300 rounded-lg border-b border-gray-200 p-4 -mb-1" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', padding: 16 }}
                      onPress={() => {
                        Alert.alert(
                          "Coming soon 👀",
                          "Soon, you'll be able to customize when and what types of notifications to receive.\n\nStay tuned!",
                          [
                            {
                              text: "Back", onPress: () => { }
                            }
                          ]
                        )
                      }}
                    >
                      <Ionicons name="notifications" size={24} color="gray" />
                      <Text className="text-md font-bold">Manage notifications</Text>
                      <Ionicons name="ios-arrow-forward" size={24} color="gray" />
                    </TouchableOpacity>
                  </View>
                )}
                {uid && (
                  <View>
                    <TouchableOpacity activeOpacity={1}>
                      <Text className="mb-2 px-3 opacity-50 mt-6">SUPPORT</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-gray-300 rounded-t-lg border-b border-gray-200 p-4 -mb-1"
                      style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', padding: 16 }}
                      onPress={() => {
                        Linking.openURL('mailto:zacharysy@mapl.one?cc=&subject=Reaching%20out%20from%20Pebble&body=Hi%20Zachary,');
                      }}
                    >
                      <Ionicons name="mail" size={24} color="gray" />
                      <Text className="text-md font-bold">Email</Text>
                      <Ionicons name="ios-arrow-forward" size={24} color="gray" />
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-gray-300 border-b border-gray-200 p-4 -mb-1" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', padding: 16 }}
                      onPress={() => {
                        Alert.alert(
                          "Thanks for being a tester!",
                          `This is a development build of Pebble. By default, it will automatically retrieve new app updates from the server.\n\nWhen available, you will find our update notes here as well. Get ready to receive our latest and greatest!\n\nStatus: ${runTypeMessage}`,
                          [
                            {
                              text: "Back", onPress: () => { }
                            }
                          ]
                        )
                      }}
                    >
                      <Ionicons name="construct" size={24} color="gray" />
                      <Text className="text-md font-bold">Development updates</Text>
                      <Ionicons name="ios-arrow-forward" size={24} color="gray" />
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-gray-300 rounded-b-lg border-b border-gray-200 p-4 -mb-1"
                      style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', padding: 16 }}
                      onPress={() => {
                        Linking.openURL('https://mapl.one');
                      }}
                    >
                      <Ionicons name="ios-information-circle" size={24} color="gray" />
                      <Text className="text-md font-bold">About</Text>
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
                              axios.get('https://pebble-server.fly.dev/api/auth/check?uid=' + credential.user).then((response) => {
                                if (response.data.exists) {
                                  // console.log('User exists');
                                } else {
                                }
                              }).catch((error) => {
                                // alert('Error creating user: ' + error);
                                // console.log('User does not exist');
                                // console.log(credential);
                                axios.post('https://pebble-server.fly.dev/api/auth/create', {
                                  credential: credential,
                                }).then((response) => {
                                  // alert(response);
                                  // console.log(response);
                                }).catch((error) => {
                                  // alert('Error creating user: ' + error);
                                });
                              });
                              await SecureStore.setItemAsync('uid', credential.user);
                              setUid(credential.user);
                            }
                          } catch (e) {
                            if (e.code === 'ERR_REQUEST_CANCELED') {
                              // alert('User cancelled sign in');
                            } else {
                              // alert('Error signing in: ' + e);
                            }
                          }
                        } else {
                          alert('You are already signed in as ' + email);
                        }
                      }}
                    />
                    <Text className="mt-3 mb-3 text-center opacity-60">{authApple ? `${email} is authenticated as ${uid}` : ""}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
        <TouchableOpacity className="absolute top-0 left-0 p-4 mt-8" onPress={() => navigation.goBack()}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="arrow-back" size={21} color="gray" />
          </View>
        </TouchableOpacity>
        <View className="pt-6">
          <Text className="self-center font-bold">made with 🥐 at mapl labs</Text>
          <Text className="self-center">v1.0.0 - beta release</Text>
        </View>
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

