import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native'
import { Slot, usePathname, useRouter, type Href } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'

const PATIENT_SESSION_KEY = 'aurahealth_patient_session'

const NAV_ITEMS = [
  { label: 'Home', path: '/portal' as Href, icon: '🏠' },
  { label: 'Appointments', path: '/portal/appointments' as Href, icon: '📅' },
  { label: 'Prescriptions', path: '/portal/prescriptions' as Href, icon: '💊' },
  { label: 'Profile', path: '/portal/profile' as Href, icon: '👤' },
]

export default function PortalLayout() {
  const router = useRouter()
  const pathname = usePathname()
  const { width } = useWindowDimensions()
  const [checked, setChecked] = useState(false)

  const isMobile = width < 900

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

  if (isMobile) {
    return <Slot />
  }

  return (
    <View style={s.root}>
      <View style={s.sidebar}>
        <View style={s.brandWrap}>
          <Text style={s.brandEyebrow}>AURAHEALTH</Text>
          <Text style={s.brandTitle}>Patient Portal</Text>
          <Text style={s.brandSub}>Simple, secure access to your care</Text>
        </View>

        <View style={s.navWrap}>
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.path ||
              (item.path === '/portal' && pathname === '/portal/index')

            return (
              <TouchableOpacity
  key={item.label}
  style={[s.navItem, active && s.navItemActive]}
  onPress={() => router.push(item.path)}
  activeOpacity={0.8}
>
  <Text style={s.navIcon}>{item.icon}</Text>
  <Text style={[s.navLabel, active && s.navLabelActive]}>
    {item.label}
  </Text>
</TouchableOpacity>
            )
          })}
        </View>
      </View>

      <View style={s.content}>
        <Slot />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
  },
  sidebar: {
    width: 260,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    paddingHorizontal: 18,
    paddingTop: 28,
    paddingBottom: 24,
  },
  brandWrap: {
    marginBottom: 28,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  brandEyebrow: {
    fontSize: 10,
    letterSpacing: 2,
    fontFamily: 'Nunito_700Bold',
    color: '#2563EB',
    marginBottom: 6,
  },
  brandTitle: {
    fontSize: 22,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#0F172A',
  },
  brandSub: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Nunito_400Regular',
    color: '#64748B',
  },
  navWrap: {
    gap: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'transparent',
  },
  navItemActive: {
    backgroundColor: '#DBEAFE',
  },
  navIcon: {
    fontSize: 18,
  },
  navLabel: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: '#64748B',
  },
  navLabelActive: {
    color: '#1D4ED8',
  },
  content: {
    flex: 1,
  },
})