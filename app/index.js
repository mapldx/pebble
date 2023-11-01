import React, { useState, useEffect, useRef } from 'react';
import { Text, View, SafeAreaView, TextInput, Button, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Modalize } from 'react-native-modalize';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import DateTimePicker from '@react-native-community/datetimepicker';

import { NativeWindStyleSheet } from 'nativewind';
import * as SecureStore from 'expo-secure-store';

import axios from 'axios';

export default function Page() {
  const navigation = useNavigation();
  const modalizeRef = useRef(null);

  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskSize, setTaskSize] = useState('Pebble');
  const [dueDate, setDueDate] = useState('');
  const [keyboardPadding, setKeyboardPadding] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [uid, setUid] = useState(null);

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate === undefined || selectedDate === null) {
      selectedDate = new Date();
    }
    const formattedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    setDueDate(formattedDate);
  };

  const onOpen = () => {
    modalizeRef.current?.open();
  };

  useEffect(() => {
    async function uidAssign() {
      const uid = await getValueFor('uid');
      setUid(uid);
      if (!uid) {
        console.log('User not signed in');
        return;
      } else {
      }
    }
    uidAssign();
  });

  async function getValueFor(key) {
    return await SecureStore.getItemAsync(key);
  }

  const handleCreateTask = async () => {
    const taskData = {
      uid,
      title,
      description: null,
      taskSize,
      dueDate,
    };

    try {
      const response = await axios.post('http://192.168.1.133:3000/api/tasks/create', taskData);

      if (response.status === 200) {
        taskData.createdAt = new Date().toISOString();
        setTasks(prevTasks => [...prevTasks, taskData]);
        modalizeRef.current?.close();
        setTitle('');
        setDescription('');
        setTaskSize('Pebble');
        setDueDate('');
      } else {
        console.error('Error creating task:', response.data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };


  const taskSizeIcon = (size) => {
    switch (size) {
      case 'Pebble':
        return '🤏';
      case 'Cobble':
        return '🤔';
      case 'Boulder':
        return '🪨';
    }
  };

  const getBadgeStyle = (size) => {
    switch (size) {
      case 'Pebble':
        return 'bg-blue-400';
      case 'Cobble':
        return 'bg-orange-400';
      case 'Boulder':
        return 'bg-green-400';
    }
  };

  const formatDate = (dateString) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const [year, monthIndex, day] = dateString.split('-');
    const dateObj = new Date(Date.UTC(year, monthIndex - 1, day));

    const month = months[dateObj.getUTCMonth()];

    return `${month} ${day}`;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView className="flex-1">
          <View className="flex-1 p-4">
            <Text className="self-start text-4xl font-extrabold">Your Pebblespace</Text>
            <View className="pt-6">
              <Text className="text-md opacity-50 mb-2">UNASSIGNED</Text>
              {tasks.filter(task => !task.assignedDate).map(task => (
                <View key={task.createdAt} className="flex-row items-center justify-between w-full mb-1">
                  <Text className="text-lg font-semibold break-normal w-1/2">{task.title}</Text>
                  <View className="flex-row items-center w-1/2 justify-end">
                    <Text className={`text-gray-400 font-semibold`}>{formatDate(task.dueDate)}</Text>
                    <View className={`flex-row items-center p-2 px-2 ml-4 ${getBadgeStyle(task.taskSize)} rounded-lg w-1/2`}>
                      <Text>{taskSizeIcon(task.taskSize)}</Text>
                      <Text className={`ml-2 text-white font-semibold`}>{task.taskSize}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
            <StatusBar style="auto" />
          </View>
          <View className="fixed bottom-0 left-0 right-0 p-6 flex-row justify-between">
            <TouchableOpacity
              className="flex-row items-center"
              onPress={onOpen}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="add-circle-sharp" size={21} color="gray" />
                <Text className="text-gray-400 text-lg font-bold ml-1">Add New Task</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => navigation.navigate('Settings')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="settings" size={21} color="gray" />
                <Text className="text-gray-400 text-lg font-bold ml-1">Settings</Text>
              </View>
            </TouchableOpacity>
          </View>
          <Modalize
            ref={modalizeRef}
            adjustToContentHeight={true}
          >
            <View className="p-5">
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Text className="text-2xl font-bold">Create a new task</Text>
                <View className="bg-slate-200 rounded-lg px-2">
                  <Button title="Confirm" onPress={handleCreateTask} />
                </View>
              </View>
              <Text className="mt-5 mb-1">Name it</Text>
              <Text className="text-xs opacity-50 mb-2">It can be helpful to keep this short and simple.</Text>
              <TextInput
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
                className="border border-gray-400 rounded-md p-4 mt-2 text-md"
              />
              <Text className="mt-5 mb-1">Estimate the required workload for it</Text>
              <Text className="text-xs opacity-50 mb-4">Pebble: quick tasks like emails. Cobble: moderate tasks like watching a video. Boulder: intensive tasks like research.
              </Text>
              <View className="flex-row justify-between">
                <TouchableOpacity
                  style={{ backgroundColor: taskSize === 'Pebble' ? '#ddd' : '#eee' }}
                  onPress={() => setTaskSize('Pebble')}
                  className="w-1/3 items-center border-[#ccc] rounded-l-lg p-4"
                >
                  <Text>Pebble</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ backgroundColor: taskSize === 'Cobble' ? '#ddd' : '#eee' }}
                  onPress={() => setTaskSize('Cobble')}
                  className="w-1/3 items-center border-[#ccc] p-4"
                >
                  <Text>Cobble</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ backgroundColor: taskSize === 'Boulder' ? '#ddd' : '#eee' }}
                  onPress={() => setTaskSize('Boulder')}
                  className="w-1/3 items-center border-[#ccc] rounded-r-lg p-4"
                >
                  <Text>Boulder</Text>
                </TouchableOpacity>
              </View>
              <Text className="mt-5 mb-1">Set the due date for it</Text>
              <Text className="text-xs opacity-50 mb-2">This can be different from when you choose to work on this task.</Text>
              <DateTimePicker
                value={new Date('2023-01-02T00:00:0.000Z')}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
              />
            </View>
          </Modalize>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </GestureHandlerRootView>
  );
}

NativeWindStyleSheet.setOutput({
  default: "native",
});
