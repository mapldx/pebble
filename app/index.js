import React, { useState, useEffect, useRef, createRef } from 'react';
import { Text, View, SafeAreaView, TextInput, Button, TouchableWithoutFeedback, Keyboard, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Modalize } from 'react-native-modalize';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

import DateTimePicker from '@react-native-community/datetimepicker';

import { NativeWindStyleSheet } from 'nativewind';
import * as SecureStore from 'expo-secure-store';

import axios from 'axios';
import { startOfWeek, eachDayOfInterval, format } from 'date-fns';

export default function Page() {
  const navigation = useNavigation();
  const modalizeRef = useRef(null);
  const controlRef = useRef(null);
  const swipeableRef = useRef(null);

  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskSize, setTaskSize] = useState('Pebble');
  const [dueDate, setDueDate] = useState('');

  const [uid, setUid] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const onTaskPress = (task) => {
    setSelectedTask(task);
    controlRef.current?.open();
  };

  const assignTaskToDay = async (task, day) => {
    let response = await axios.put('http://192.168.1.133:3000/api/tasks/update', { taskId: task.id, assignedDate: day }).catch(error => {
      console.error(error);
    });
    if (response && response.status === 200) {
      console.log('Successfully updated task');
    }
    fetchTasks();
  };

  const handleAssignDate = (day) => {
    if (selectedTask) {
      assignTaskToDay(selectedTask, day);
      setTasks(prev => prev.filter(t => t !== selectedTask));
      setSelectedTask(null);
      controlRef.current?.close();
    }
  };

  const handleUnassign = () => {
    if (selectedTask) {
      assignTaskToDay(selectedTask, "1970-01-01");
      setTasks(prev => prev.filter(t => t !== selectedTask));
      setSelectedTask(null);
      controlRef.current?.close();
    }
  };

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
      if (uid === null) {
        alert('Log in via settings to sync your tasks');
      }
      await fetchTasks();
    }
    uidAssign();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`http://192.168.1.133:3000/api/tasks/get?uid=${await getValueFor('uid')}`).catch(error => console.error(error));
      const data = await response.data.tasks;
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return eachDayOfInterval({ start, end });
  };

  const weekDays = getWeekDays();

  async function getValueFor(key) {
    return await SecureStore.getItemAsync(key);
  }

  const handleCreateTask = async () => {
    const taskData = {
      uid,
      title,
      description: null,
      taskSize,
      status: 'Not Started',
      assignedDate: "1970-01-01",
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
    fetchTasks();
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
    const dateObj = new Date(dateString);

    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return formattedDate;
  };

  const renderLeftActions = () => {
    return (
      <View style={{ width: 1 }}>
      </View>
    );
  };

  const renderRightActions = () => {
    return (
      <View style={{ width: 1 }}>
      </View>
    );
  };

  const markTaskAsDone = async (taskId, currentRef) => {
    try {
      const response = await axios.put('http://192.168.1.133:3000/api/tasks/update', {
        taskId: taskId,
        status: 'Completed'
      });

      if (response.data.message === 'Task updated successfully') {
        // alert('Task marked as completed!');
        currentRef.current?.close();
      } else {
        alert('Failed to update task. Please try again.');
        currentRef.current?.close();
      }
    } catch (error) {
      console.error('Error marking task as completed:', error);
      alert('An error occurred. Please try again.');
      currentRef.current?.close();
    }
    fetchTasks();
  };

  const markTaskAsNotDone = async (taskId, currentRef) => {
    try {
      const response = await axios.put('http://192.168.1.133:3000/api/tasks/update', {
        taskId: taskId,
        status: 'Not Started'
      });

      if (response.data.message === 'Task updated successfully') {
        // alert('Task marked as incomplete!');
        currentRef.current?.close();
      } else {
        alert('Failed to update task. Please try again.');
        currentRef.current?.close();
      }
    } catch (error) {
      console.error('Error marking task as incomplete:', error);
      alert('An error occurred. Please try again.');
      currentRef.current?.close();
    }
    fetchTasks();
  };

  const deleteTask = async (id) => {
    try {
      const response = await axios.post(`http://192.168.1.133:3000/api/tasks/delete`, {
        id: id
      });
      controlRef.current?.close();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('An error occurred. Please try again.');
    }
    fetchTasks();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView className="flex-1">
          <View className="flex-1 p-4">
            <Text className="self-start text-4xl font-extrabold">Your Pebblespace</Text>
            <View className="pt-6 mb-2">
              <View className="flex-row justify-between">
                <Text className="text-md opacity-50 mb-2">UNASSIGNED</Text>
              </View>
              <FlatList
                data={tasks.filter(task => format(new Date(task.assignedDate), 'yyyy-MM-dd') === '1970-01-01')}
                renderItem={({ item: task }) => (
                  <TouchableOpacity key={task.createdAt} className="flex-row items-center justify-between w-full mb-1" onPress={() => onTaskPress(task)}>
                    <Text className="text-lg font-semibold break-normal w-1/2">{task.title}</Text>
                    <View className="flex-row items-center w-1/2 justify-end">
                      <Text className={`text-gray-400 font-semibold`}>{formatDate(task.dueDate)}</Text>
                      <View className={`flex-row items-center p-2 px-2 ml-4 ${getBadgeStyle(task.taskSize)} rounded-lg w-1/2`}>
                        <Text>{taskSizeIcon(task.taskSize)}</Text>
                        <Text className={`ml-2 text-white font-semibold`}>{task.taskSize}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
                keyExtractor={task => task.id}
              />
            </View>
            <View className="pt-3">
              <FlatList
                data={weekDays}
                renderItem={({ item: day }) => {
                  const tasksForTheDay = tasks.filter(task => format(new Date(task.assignedDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
                  return (
                    <View key={format(day, 'yyyy-MM-dd')} className="mb-5">
                      <Text className="text-md opacity-50 mb-2">{format(day, 'EE, MMM dd').toUpperCase()}</Text>
                      <FlatList
                        data={tasksForTheDay}
                        renderItem={({ item: task }) => {
                          const currentRef = createRef();
                          return (
                            <Swipeable
                              ref={currentRef}
                              renderLeftActions={renderLeftActions}
                              renderRightActions={renderRightActions}
                              onSwipeableLeftOpen={() => markTaskAsDone(task.id, currentRef)}
                              onSwipeableRightOpen={() => markTaskAsNotDone(task.id, currentRef)}
                            >
                              <TouchableOpacity key={task.createdAt} className="flex-row items-center justify-between w-full mb-1" onPress={() => onTaskPress(task)} 
                                style={task.status == "Completed" && { textDecorationLine: 'line-through', opacity: 0.5 }}>
                                <Text className="text-lg font-semibold break-normal w-1/2" style={task.status == "Completed" && { textDecorationLine: 'line-through' }}>{task.title}</Text>
                                <View className="flex-row items-center w-1/2 justify-end">
                                  <Text className={`text-gray-400 font-semibold`}>{formatDate(task.dueDate)}</Text>
                                  <View className={`flex-row items-center p-2 px-2 ml-4 ${getBadgeStyle(task.taskSize)} rounded-lg w-1/2`}>
                                    <Text>{taskSizeIcon(task.taskSize)}</Text>
                                    <Text className={`ml-2 text-white font-semibold`}>{task.taskSize}</Text>
                                  </View>
                                </View>
                              </TouchableOpacity>
                            </Swipeable>
                          );
                        }}
                        keyExtractor={task => task.createdAt.toString()}
                      />
                    </View>
                  );
                }}
                keyExtractor={day => format(day, 'yyyy-MM-dd')}
              />
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
          <Modalize ref={controlRef} adjustToContentHeight={true}>
            <View className="p-5 mb-5">
              {selectedTask && (
                <View>
                  <View className="flex-row justify-between items-center">
                    <View className="w-3/4">
                      <Text className="text-2xl font-bold break-normal">{selectedTask.title}</Text>
                      {selectedTask.dueDate && (
                        <Text className="text-md font-light break-normal mt-1">Due on {format(new Date(selectedTask.dueDate), 'yyyy-MM-dd')}</Text>
                      )}
                    </View>
                    <View>
                      <Ionicons name="trash" size={24} color="red" onPress={() => deleteTask(selectedTask.id)} />
                    </View>
                  </View>
                  <Text className="mt-5 mb-1">Assign it to a day sometime this week</Text>
                  <Text className="text-xs opacity-50 mb-4">For better focus and effective planning, you can only assign tasks to days within the current week. This encourages weekly planning and prevents overwhelming yourself.</Text>
                  <View className="flex-row flex-wrap items-center">
                    {weekDays.map(day => {
                      const dayFormat = format(day, 'yyyy-MM-dd');
                      if (selectedTask && selectedTask.assignedDate && format(new Date(selectedTask.assignedDate), 'yyyy-MM-dd') === dayFormat) {
                        return null;
                      }
                      return (
                        <TouchableOpacity key={day} onPress={() => handleAssignDate(dayFormat)} className="bg-blue-200 mr-2 mt-3 p-2 rounded-lg">
                          <Text>{format(day, 'EE, MMM dd')}</Text>
                        </TouchableOpacity>
                      );
                    })}
                    {selectedTask.assignedDate && (
                      <TouchableOpacity onPress={handleUnassign} className="bg-red-200 mr-2 mt-3 p-2 rounded-lg">
                        <Text>Postpone this task</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
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
