import { useEffect, useState } from 'react'
import { Tabs, useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'

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
      router.replace('/')
      return
    }

    setChecked(true)
  }

  if (!checked) return null

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0F8DA8',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Appointments',
        }}
      />
      <Tabs.Screen
        name="prescriptions"
        options={{
          title: 'Prescriptions',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  )
}