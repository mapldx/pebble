import { NativeWindStyleSheet } from "nativewind";
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { Link } from "expo-router";

import * as AppleAuthentication from 'expo-apple-authentication';
import * as SecureStore from 'expo-secure-store';

import axios from 'axios';

async function getValueFor(key) {
  return await SecureStore.getItemAsync(key);
}

export default function Page() {
  [uid, setUid] = useState(null);
  [authApple, setAuthApple] = useState(null);
  [email, setEmail] = useState(null);

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
    <View className="flex-1">
      <View className="flex-1 items-center justify-center">
        <StatusBar style="auto" />
        <View style={styles.container}>
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={5}
            style={styles.button}
            onPress={async () => {
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
                  // handle that the user canceled the sign-in flow
                  alert('User cancelled sign in');
                } else {
                  // handle other errors
                  alert('Error signing in: ' + e);
                }
              }
            }}
          />
        </View>
        <Text className="mt-3 text-center opacity-20">{ authApple ? `${email} is authenticated as ${uid}` : "No user object found" }</Text>
      </View>
      <TouchableOpacity className="absolute top-0 left-0 p-4">
        <Link replace href="/">
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="arrow-back" size={21} color="gray" />
            <Text className="text-gray-400 text-lg font-bold ml-1">Back to Home</Text>
          </View>
        </Link>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 200,
    height: 44,
  },
});

NativeWindStyleSheet.setOutput({
  default: "native",
});

