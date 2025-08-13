import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Avatar, Button, Divider, Text } from 'react-native-paper';
import HomeScreen from '../Screens/Home';
import RakeSampleForm from '../Screens/RakeSampleform';

type DrawerNavigatorProps = {
  onLogout: () => Promise<void>;
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
      <Drawer.Screen name='Rank Sample' component={RakeSampleForm} />
      
    </Drawer.Navigator>
  );
}

async function handleLogout(onLogout: () => Promise<void>) {
  Alert.alert("Are you sure You want to Logout", "This action will throw you for login", [
    {
      text: "cancel",
      onPress: () => { }
    },
    {
      text: "Yes",
      onPress: async () => {
        await onLogout();
      }
    }
  ]);
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
      <DrawerItemList  {...props} />
      <Divider style={{ marginVertical: 8 }} />
      <Button
        icon="logout"
        mode="outlined"
        onPress={async () => {
          await handleLogout(onLogout)
        }}
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