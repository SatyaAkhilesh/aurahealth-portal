import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter, type Href } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'

import Card from '@/components/Card'
import Avatar from '@/components/Avatar'

const PATIENT_SESSION_KEY = 'aurahealth_patient_session'

type PatientSession = {
  id: string
  name: string
  email: string
  created_at?: string
}

const P = {
  teal: '#0F8DA8',
  tealDark: '#0C6F86',
  tealLight: '#E6F7FA',
  cream: '#FAF7F2',
  white: '#FFFFFF',
  forest: '#18382C',
  stone: '#7C7A70',
  parchment: '#E8E1D6',
}

export default function PortalProfile() {
  const router = useRouter()
  const [patient, setPatient] = useState<PatientSession | null>(null)

  useEffect(() => {
    loadPatient()
  }, [])

  const loadPatient = async () => {
    const raw = await AsyncStorage.getItem(PATIENT_SESSION_KEY)

    if (!raw) {
      router.replace('/' as Href)
      return
    }

    const session: PatientSession = JSON.parse(raw)
    setPatient(session)
  }

  const handleLogout = async () => {
    await AsyncStorage.removeItem(PATIENT_SESSION_KEY)
    router.replace('/' as Href)
  }

  return (
    <ScrollView style={s.root} contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
      <View style={s.hero}>
        <Avatar name={patient?.name || 'P'} size={64} />
        <View style={s.heroInfo}>
          <Text style={s.eye}>PROFILE</Text>
          <Text style={s.title}>{patient?.name || 'Patient'}</Text>
          <Text style={s.sub}>{patient?.email || '—'}</Text>
        </View>
      </View>

      <Card>
        <Text style={s.sectionTitle}>Patient Information</Text>

        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Full Name</Text>
          <Text style={s.infoValue}>{patient?.name || '—'}</Text>
        </View>

        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Email</Text>
          <Text style={s.infoValue}>{patient?.email || '—'}</Text>
        </View>

        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Member Since</Text>
          <Text style={s.infoValue}>
            {patient?.created_at
              ? new Date(patient.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '—'}
          </Text>
        </View>

        <View style={[s.infoRow, { borderBottomWidth: 0 }]}>
          <Text style={s.infoLabel}>Patient ID</Text>
          <Text style={s.infoValue}>{patient?.id || '—'}</Text>
        </View>
      </Card>

      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Text style={s.logoutTxt}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: P.cream,
  },
  hero: {
    backgroundColor: P.teal,
    borderRadius: 18,
    padding: 22,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroInfo: {
    flex: 1,
  },
  eye: {
    color: '#CDEEF4',
    fontFamily: 'Nunito_700Bold',
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    color: P.white,
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 22,
  },
  sub: {
    color: 'rgba(255,255,255,0.75)',
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Nunito_800ExtraBold',
    color: P.forest,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: P.parchment,
    gap: 12,
  },
  infoLabel: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: P.stone,
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: P.forest,
    flex: 1,
    textAlign: 'right',
  },
  logoutBtn: {
    marginTop: 6,
    backgroundColor: P.white,
    borderWidth: 1,
    borderColor: P.teal,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutTxt: {
    color: P.teal,
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
  },
})