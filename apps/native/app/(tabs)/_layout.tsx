import { Tabs } from "expo-router";
import { Text, View, TouchableOpacity } from 'react-native';
import { Ionicons, Octicons } from "@expo/vector-icons";
import { useState } from 'react';
import { ImportTray } from '@/components/import/import-tray';

export default function TabsLayout() {
  const [isImportTrayOpen, setIsImportTrayOpen] = useState(false);

  return (
    <View className="flex-1">
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#1E4D37",
          tabBarInactiveTintColor: "#6B7280",
          tabBarStyle: {
            backgroundColor: "#ffffff",
            borderTopColor: "#E5E7EB",
            borderTopWidth: 1,
            paddingBottom: 8,
            paddingTop: 8,
            height: 80,
          },
          headerStyle: {
            backgroundColor: "#fff",
            borderBottomColor: "#000000",
            borderBottomWidth: 0
          },
          headerTintColor: "#000",
          headerTitleStyle: {
            fontFamily: "Lora",
          },
        }}
      >
        <Tabs.Screen
          name="discover"
          options={{
            title: "Ontdek",
            tabBarIcon: ({ color, size, focused }) => (
              focused ? <Octicons name="home-fill" size={size} color={color} /> : <Octicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="collection"
          options={{
            title: "Collectie",
            tabBarIcon: ({ color, size, focused }) => (
              focused ? <Ionicons name="bookmark" size={size} color={color} /> : <Ionicons name="bookmark-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
      
      {/* Floating + Button Overlay */}
      <View className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50">
        <TouchableOpacity
          onPress={() => setIsImportTrayOpen(true)}
          className="w-16 h-16 bg-[#1E4D37] rounded-full items-center justify-center"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Ionicons name="add-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <ImportTray 
        isOpen={isImportTrayOpen} 
        onClose={() => setIsImportTrayOpen(false)} 
      />
    </View>
  );
}
