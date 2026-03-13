import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter, type Href } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'

import Card from '@/components/Card'
import Avatar from '@/components/Avatar'
import { supabase } from '@/lib/supabase'
import { exportPatientSummaryPdf } from '@/lib/pdf/exportPatientSummaryPdf'

const PATIENT_SESSION_KEY = 'aurahealth_patient_session'

type PatientSession = {
  id: string
  name: string
  email: string
  created_at?: string
}

const P = {
  blue: '#2563EB',
  blueDark: '#1D4ED8',
  blueLight: '#DBEAFE',
  sky: '#E0F2FE',
  skyDark: '#0369A1',
  green: '#16A34A',
  greenLight: '#DCFCE7',
  background: '#F8FAFC',
  white: '#FFFFFF',
  heading: '#0F172A',
  text: '#64748B',
  border: '#E2E8F0',
}

export default function PortalProfile() {
  const router = useRouter()
  const [patient, setPatient] = useState<PatientSession | null>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [prescriptions, setPrescriptions] = useState<any[]>([])

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

    const { data: appts } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', session.id)

    const { data: meds } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('patient_id', session.id)

    setAppointments(appts || [])
    setPrescriptions(meds || [])
  }

  const handleLogout = async () => {
    await AsyncStorage.removeItem(PATIENT_SESSION_KEY)
    router.replace('/' as Href)
  }

  return (
    <ScrollView style={s.root} contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
      <View style={s.hero}>
        <View style={s.heroRow}>
          <Avatar name={patient?.name || 'P'} size={68} />
          <View style={s.heroInfo}>
            <Text style={s.eye}>PROFILE</Text>
            <Text style={s.title}>{patient?.name || 'Patient'}</Text>
            <Text style={s.sub}>{patient?.email || '—'}</Text>
          </View>
        </View>
      </View>

      <View style={s.statsGrid}>
        <View style={[s.statCard, { borderLeftColor: P.blue }]}>
          <View style={[s.statIconBox, { backgroundColor: P.blueLight }]}>
            <Text style={s.statIcon}>🪪</Text>
          </View>
          <Text style={s.statValueSmall}>#{patient?.id?.slice(0, 8) || '—'}</Text>
          <Text style={s.statLabel}>Patient ID</Text>
        </View>

        <View style={[s.statCard, { borderLeftColor: P.green }]}>
          <View style={[s.statIconBox, { backgroundColor: P.greenLight }]}>
            <Text style={s.statIcon}>✅</Text>
          </View>
          <Text style={s.statValueSmall}>Active</Text>
          <Text style={s.statLabel}>Account Status</Text>
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

      <Card>
        <Text style={s.sectionTitle}>Portal Access</Text>
        <Text style={s.portalText}>
          You are signed in to AuraHealth Patient Portal. You can securely review your appointments,
          prescriptions, and personal account information here.
        </Text>
      </Card>

      <TouchableOpacity
        style={s.pdfBtn}
        onPress={() => exportPatientSummaryPdf(patient, appointments, prescriptions)}
        activeOpacity={0.8}
      >
        <Text style={s.pdfBtnTxt}>⬇ Download Patient Summary PDF</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
        <Text style={s.logoutTxt}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: P.background,
  },
  hero: {
    backgroundColor: P.blue,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroInfo: {
    flex: 1,
  },
  eye: {
    color: '#DBEAFE',
    fontFamily: 'Nunito_700Bold',
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    color: P.white,
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 24,
  },
  sub: {
    color: 'rgba(255,255,255,0.82)',
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    marginTop: 4,
  },
  statsGrid: {
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: P.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: P.border,
    borderLeftWidth: 4,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statIcon: {
    fontSize: 18,
  },
  statValueSmall: {
    fontSize: 18,
    fontFamily: 'Nunito_800ExtraBold',
    color: P.heading,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: P.text,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
    color: P.heading,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: P.border,
    gap: 12,
  },
  infoLabel: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: P.text,
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: P.heading,
    flex: 1,
    textAlign: 'right',
  },
  portalText: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'Nunito_400Regular',
    color: P.text,
  },
  pdfBtn: {
    marginTop: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  pdfBtnTxt: {
    color: '#1D4ED8',
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
  },
  logoutBtn: {
    marginTop: 10,
    backgroundColor: P.white,
    borderWidth: 1.5,
    borderColor: P.blue,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutTxt: {
    color: P.blue,
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
  },
})