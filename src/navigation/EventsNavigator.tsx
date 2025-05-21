import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import FutureEventsScreen from '../screens/event/FutureEventsScreen';
import PastEventsScreen from '../screens/event/PastEventsScreen';
import colors from '../assets/colors/colors';
import { StyleSheet } from 'react-native';
import { Event } from '../types/event.types';

const Tab = createMaterialTopTabNavigator();

interface TabsNavigatorProps {
  searchQuery: string;
  onEventSelect: (event: Event) => void;
}

const TabsNavigator = ({ searchQuery, onEventSelect }: TabsNavigatorProps) => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.grey,
        tabBarIndicatorStyle: {
          backgroundColor: colors.primary,
        },
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarContentContainerStyle: styles.tabBarContentContainer,
      }}>
      <Tab.Screen name="Upcoming">
        {() => <FutureEventsScreen searchQuery={searchQuery} onEventSelect={onEventSelect} />}
      </Tab.Screen>
      <Tab.Screen name="Past">
        {() => <PastEventsScreen searchQuery={searchQuery} onEventSelect={onEventSelect} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
    width: '100%',
    maxWidth: '100%', // Ensure full width on tablet screens
  },
  tabLabel: {
    fontWeight: 'bold',
    textTransform: 'none',
  },
  tabBarContentContainer: {
    width: '100%',
    maxWidth: '100%', // Ensure full width on tablet screens
    alignSelf: 'stretch', // Use stretch instead of center for tablet layouts
  },
});

export default TabsNavigator;
