import React, { useState, useEffect } from 'react';
import { Text, View, SafeAreaView, StyleSheet, TouchableWithoutFeedback, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { NativeWindStyleSheet } from 'nativewind';
import DateTimePicker from '@react-native-community/datetimepicker';

import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';
import moment from 'moment';

import * as SecureStore from 'expo-secure-store';

export default function Report() {
  const navigation = useNavigation();

  const [datePickerValue, setDatePickerValue] = useState('2023-01-01');
  const [workloadPickerValue, setWorkloadPickerValue] = useState('all');

  const [taskSizes, setTaskSizes] = useState([]);

  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [weekChange, setWeekChange] = useState(0);
  const [postpones, setPostpones] = useState(0);

  const [mostProductiveDay, setMostProductiveDay] = useState('');
  const [weekendCompletionRate, setWeekendCompletionRate] = useState(0);

  const [totalCompletedTasks, setTotalCompletedTasks] = useState(0);

  const styles = StyleSheet.create({
    picker: {
      inputIOS: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 118,
        paddingVertical: 8,
        paddingHorizontal: 9,
        borderWidth: 1,
        borderRadius: 8,
        borderColor: 'transparent',
        backgroundColor: '#e6e6e6',
        textAlign: 'center',
        fontSize: 16,
      },
    },
  });

  async function getValueFor(key) {
    return await SecureStore.getItemAsync(key);
  }

  async function getCompletedTasksCount() {
    let uid = await getValueFor('uid');

    let date = datePickerValue;
    let startDate = moment(date).clone().startOf('isoWeek').format('YYYY-MM-DD');
    let endDate = moment(date).clone().endOf('isoWeek').format('YYYY-MM-DD');

    let taskSize = workloadPickerValue;
    if (taskSize === 'all') {
      taskSize = '';
    }
    // console.log(uid, startDate, endDate, taskSize);
    await axios.get('https://pebble-server.fly.dev/api/report/completed', {
      params: {
        uid: uid,
        startDate: startDate,
        endDate: endDate,
        taskSize: taskSize,
      }
    }).then((response) => {
      setTasksCompleted(response.data.completedTasksCount);
    }).catch((error) => {
      // console.log(error);
    });
  }

  async function computeWeekChange() {
    let uid = await getValueFor('uid');

    let date = datePickerValue;
    let prevStart = moment(date).clone().subtract(1, 'week').startOf('isoWeek').format('YYYY-MM-DD');
    let prevEnd = moment(date).clone().subtract(1, 'week').endOf('isoWeek').format('YYYY-MM-DD');

    let taskSize = workloadPickerValue;
    if (taskSize === 'all') {
      taskSize = '';
    }

    await axios.get('https://pebble-server.fly.dev/api/report/completed', {
      params: {
        uid: uid,
        startDate: prevStart,
        endDate: prevEnd,
        taskSize: taskSize,
      }
    }).then((response) => {
      let prevWeekCompleted = response.data.completedTasksCount;
      let weekChange = tasksCompleted - prevWeekCompleted;
      if (weekChange > 0) {
        weekChange = `+${weekChange}`;
      } else {
        weekChange = `${weekChange}`;
      }
        
      setWeekChange(weekChange);
    }).catch((error) => {
      // console.log(error);
    });
  }

  async function getPostponesCount() {
    let uid = await getValueFor('uid');

    let date = datePickerValue;
    let startDate = moment(date).clone().startOf('isoWeek').format('YYYY-MM-DD');
    let endDate = moment(date).clone().endOf('isoWeek').add(1, 'day').format('YYYY-MM-DD');

    let taskSize = workloadPickerValue;
    if (taskSize === 'all') {
      taskSize = '';
    }

    await axios.get('https://pebble-server.fly.dev/api/report/postpones', {
      params: {
        uid: uid,
        startDate: startDate,
        endDate: endDate,
        taskSize: taskSize,
      }
    }).then((response) => {
      setPostpones(response.data.totalPostpones);
    }).catch((error) => {
      // console.log(error);
    });
  }

  async function getMostProductiveDay() {
    let uid = await getValueFor('uid');

    let taskSize = workloadPickerValue;
    if (taskSize === 'all') {
      taskSize = '';
    }

    await axios.get('https://pebble-server.fly.dev/api/report/productive', {
      params: {
        uid: uid,
        taskSize: taskSize,
      }
    }).then((response) => {
      setMostProductiveDay(response.data.productiveDays.dayOfWeek);
    }).catch((error) => {
      // console.log(error);
    });
  }

  async function getWeekendCompletionRate() {
    let uid = await getValueFor('uid');

    let taskSize = workloadPickerValue;
    if (taskSize === 'all') {
      taskSize = '';
    }

    // console.log(taskSize);
    await axios.get('https://pebble-server.fly.dev/api/report/weekend', {
      params: {
        uid: uid,
        taskSize: taskSize,
      }
    }).then((response) => {
      // console.log(response.data.weekendCompletionRate)
      setWeekendCompletionRate(response.data.weekendCompletionRate);
    }).catch((error) => {
      // console.log(error);
    });
  }

  async function getTotalCompletedTasks() {
    let uid = await getValueFor('uid');

    let taskSize = workloadPickerValue;
    if (taskSize === 'all') {
      taskSize = '';
    }

    await axios.get('https://pebble-server.fly.dev/api/report/total', {
      params: {
        uid: uid,
        taskSize: taskSize,
      }
    }).then((response) => {
      setTotalCompletedTasks(response.data.totalTasksCompleted);
    }).catch((error) => {
      // console.log(error);
    });
  }

  async function getTaskSizes() {
    let uid = await getValueFor('uid');

    await axios.get('https://pebble-server.fly.dev/api/report/sizes', {
      params: {
        uid: uid,
      }
    }).then((response) => {
      let taskSizes = response.data.taskSizes;
      taskSizes = taskSizes.map((taskSize) => {
        return {
          label: taskSize.taskSize,
          value: (taskSize.taskSize).toLowerCase(),
        }
      });
      setTaskSizes(taskSizes);
    }).catch((error) => {
      // console.log(error);
    });
  }

  async function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  useEffect(() => {
    if (datePickerValue && workloadPickerValue) {
      getTaskSizes();
      getCompletedTasksCount();
      getPostponesCount();
      computeWeekChange();
      getMostProductiveDay();
      getWeekendCompletionRate();
      getTotalCompletedTasks();
    }
  }, [datePickerValue, workloadPickerValue]);

  useEffect(() => {
    computeWeekChange();
  }, [tasksCompleted]);

  useEffect(() => {
    getTaskSizes();
    getCompletedTasksCount();
    getPostponesCount();
    computeWeekChange();
    getMostProductiveDay();
    getWeekendCompletionRate();
    getTotalCompletedTasks();
  }, []);

  return (
    <TouchableWithoutFeedback>
      <SafeAreaView className="flex-1">
        <ScrollView>
          <TouchableOpacity
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
            style={{ flex: 1 }}
            activeOpacity={1}
          >
            <View className="flex-1">
              <View className="pt-12 items-center justify-center mb-4">
                <Text className="self-start p-4 text-4xl font-extrabold">Your Pebblepulse</Text>
                <Text className="self-start text-md font-semibold text-gray-500 px-4 -mt-1">
                  Go back in time, compare your performance, and optimize your productivity.
                  Pebblepulse allows you to analyze task completion trends to help you stay
                  on top of your game.
                </Text>
                <StatusBar style="auto" />
              </View>
              <View className="flex-row items-center justify-between px-6 mt-6">
                <Ionicons name="analytics-outline" size={24} color="gray" />
                <Text>Select a date range</Text>
                <DateTimePicker
                  value={new Date('2023-01-02T00:00:0.000Z')}
                  mode="date"
                  display="compact"
                  style={{ width: 118 }}
                  onChange={(event, date) => {
                    if (event.type === 'set') {
                      setDatePickerValue(date);
                    }
                  }}
                />
              </View>
              <View className="flex-row items-center justify-between px-6 mt-4">
                <Ionicons name="list" size={24} color="gray" />
                <Text>Select a workload estimate</Text>
                <View className="">
                  <RNPickerSelect
                    onValueChange={(value) => setWorkloadPickerValue(value)}
                    onChange={(value) => setWorkloadPickerValue(value)}
                    placeholder={{ label: 'All workloads', value: 'all' }}
                    items={taskSizes}
                    style={styles.picker}
                  />
                </View>
              </View>
              <View className="flex-row mt-12 justify-between px-4">
                <View className="flex-col text-center justify-center items-center">
                  <Text className="font-semibold text-lg">This week</Text>
                  <Text className="text-gray-500 text-3xl font-bold">{tasksCompleted}</Text>
                  <Text className="text-gray-500 text-sm">{tasksCompleted == 1 ? 'task' : 'tasks'} completed</Text>
                </View>
                <View className="flex-col text-center justify-center items-center">
                  <Text className="font-semibold text-lg">Week change</Text>
                  <Text className="text-gray-500 text-3xl font-bold">{weekChange}</Text>
                  <Text className="text-gray-500 text-sm">from last week</Text>
                </View>
                <View className="flex-col text-center justify-center items-center">
                  <Text className="font-semibold text-lg">You postponed</Text>
                  <Text className="text-gray-500 text-3xl font-bold">{postpones || 0}</Text>
                  <Text className="text-gray-500 text-sm">{postpones === 1 ? 'time' : 'times'} this week</Text>
                </View>
              </View>
              <Text className="text-gray-500 text-lg text-center mt-8 mb-4 font-semibold">On average</Text>
              <View className="px-4">
                <View className="flex-col text-center justify-center items-center mb-6">
                  <Text className="font-semibold text-4xl">{mostProductiveDay}</Text>
                  <Text className="text-gray-500 text-sm">is your most productive day {workloadPickerValue === 'all' ? '' : 'for ' + capitalizeFirstLetter(workloadPickerValue)._j + 's'}</Text>
                </View>
                <View className="flex-col text-center justify-center items-center">
                  <Text className="font-semibold text-4xl">{weekendCompletionRate}%</Text>
                  <Text className="text-gray-500 text-sm">of your {workloadPickerValue === 'all' ? 'tasks' : capitalizeFirstLetter(workloadPickerValue)._j + 's'} are completed over the weekend</Text>
                </View>
              </View>
              <Text className="text-gray-500 text-lg text-center mt-8 mb-4 font-semibold">To date</Text>
              <View className="px-4">
                <View className="flex-col text-center justify-center items-center mb-6">
                  <Text className="font-semibold text-4xl">{totalCompletedTasks}</Text>
                  <Text className="text-gray-500 text-sm">
                    {workloadPickerValue === 'all' ?
                      (totalCompletedTasks === 1 ? 'task' : 'tasks') :
                      capitalizeFirstLetter(workloadPickerValue)._j + (totalCompletedTasks === 1 ? '' : 's')
                    } completed
                  </Text>

                </View>
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>
        <TouchableOpacity className="absolute top-0 left-0 p-4 mt-8" onPress={() => navigation.goBack()}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="arrow-back" size={21} color="gray" />
            </View>
          </TouchableOpacity>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

NativeWindStyleSheet.setOutput({
  default: "native",
});
