import { useEffect, useState } from 'react'
import { Tabs, useRouter, type Href } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Text } from 'react-native'

const PATIENT_SESSION_KEY = 'aurahealth_patient_session'

export default function PortalLayout() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    const raw = await AsyncStorage.getItem(PATIENT_SESSION_KEY)

    if (!raw) {
      router.replace('/' as Href)
      return
    }

    setChecked(true)
  }

  if (!checked) return null

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
          height: 70,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Nunito_700Bold',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Appointments',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📅</Text>,
        }}
      />
      <Tabs.Screen
        name="prescriptions"
        options={{
          title: 'Prescriptions',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>💊</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>👤</Text>,
        }}
      />
    </Tabs>
  )
}