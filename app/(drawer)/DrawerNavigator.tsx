// navigation/DrawerNavigator.tsx
import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { View, StyleSheet } from 'react-native';
import { Avatar, Text, Divider, Button } from 'react-native-paper';
import SettingsScreen from '../Screens/Settings';
import HomeScreen from '../Screens/Home';

type DrawerNavigatorProps = {
  onLogout: () => void;
};

const Drawer = createDrawerNavigator();

export default function DrawerNavigator({ onLogout }: DrawerNavigatorProps) {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
      }}
      drawerContent={(props) => <CustomDrawer {...props} onLogout={onLogout} />}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

function CustomDrawer(props: any) {
  const { onLogout } = props;

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <Avatar.Icon icon="account" size={48} />
        <Text style={styles.username}>Hello, User</Text>
      </View>
      <Divider style={{ marginVertical: 8 }} />
      <DrawerItemList {...props} />
      <Divider />
      <Button
        icon="logout"
        mode="outlined"
        onPress={onLogout}
        style={styles.logout}
      >
        Logout
      </Button>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginVertical: 20,
  },
  username: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  logout: {
    margin: 16,
  },
});