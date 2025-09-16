import { Tabs } from "expo-router";
import { Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
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
            backgroundColor: "#1E4D37",
          },
          headerTintColor: "#ffffff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Tabs.Screen
          name="discover"
          options={{
            title: "Ontdek",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="compass-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="collection"
          options={{
            title: "Collectie",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bookmark-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
      
      {/* Floating + Button Overlay */}
      <View className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50">
        <TouchableOpacity
          onPress={() => setIsImportTrayOpen(true)}
          className="w-16 h-16 bg-green-700 rounded-full items-center justify-center shadow-lg"
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
