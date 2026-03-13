import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native'
import { useRouter, type Href } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { supabase } from '@/lib/supabase'
import Card from '@/components/Card'
import Avatar from '@/components/Avatar'
import EmptyState from '@/components/EmptyState'
import LoadingSpinner from '@/components/LoadingSpinner'

const PATIENT_SESSION_KEY = 'aurahealth_patient_session'

type PatientSession = {
  id: string
  name: string
  email: string
  created_at?: string
}

type Appointment = {
  id: string
  provider: string
  datetime: string
  repeat: string
  status?: string
}

type Prescription = {
  id: string
  medication: string
  dosage: string
  quantity: number
  refill_on: string
  refill_schedule: string
  notes?: string
  status?: string
}

const P = {
  blue: '#2563EB',
  blueDark: '#1D4ED8',
  blueLight: '#DBEAFE',
  sky: '#E0F2FE',
  skyDark: '#0369A1',
  green: '#16A34A',
  greenLight: '#DCFCE7',
  amber: '#D97706',
  amberLight: '#FEF3C7',
  background: '#F8FAFC',
  white: '#FFFFFF',
  heading: '#0F172A',
  text: '#64748B',
  border: '#E2E8F0',
}

function isWithinNext7Days(dateStr: string) {
  const now = new Date()
  const target = new Date(dateStr)
  const diff = (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return diff >= 0 && diff <= 7
}

function isRefillSoon(dateStr: string) {
  return isWithinNext7Days(dateStr)
}

export default function PortalHome() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const isMobile = width < 900

  const [patient, setPatient] = useState<PatientSession | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [allPrescriptions, setAllPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
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
      .order('datetime', { ascending: true })

    const { data: meds } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('patient_id', session.id)
      .order('refill_on', { ascending: true })

    const nextAppointments = (appts || []).filter((a) => {
      if (a.status && a.status !== 'scheduled') return false
      return isWithinNext7Days(a.datetime)
    })

    const nextRefills = (meds || []).filter((p) => isWithinNext7Days(p.refill_on))

    setAppointments(nextAppointments)
    setPrescriptions(nextRefills)
    setAllPrescriptions(meds || [])
    setLoading(false)
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) return <LoadingSpinner message="Loading portal..." />

  return (
    <ScrollView style={s.root} contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
      <View style={s.hero}>
        <View style={s.heroRow}>
          <Avatar name={patient?.name || 'P'} size={60} />
          <View style={{ flex: 1 }}>
            <Text style={s.eye}>AURAHEALTH PATIENT PORTAL</Text>
            <Text style={s.title}>
              {greeting()}, {patient?.name?.split(' ')[0]} 👋
            </Text>
            <Text style={s.sub}>
              Here’s your health summary for the next 7 days.
            </Text>
          </View>
        </View>
      </View>

      <View style={[s.statsGrid, isMobile && s.statsGridMobile]}>
        <View style={[s.statCard, { borderLeftColor: P.blue }]}>
          <View style={[s.statIconBox, { backgroundColor: P.blueLight }]}>
            <Text style={s.statIcon}>📅</Text>
          </View>
          <Text style={s.statValue}>{appointments.length}</Text>
          <Text style={s.statLabel}>Upcoming Appointments</Text>
          <Text style={s.statSub}>Next 7 days</Text>
        </View>

        <View style={[s.statCard, { borderLeftColor: P.amber }]}>
          <View style={[s.statIconBox, { backgroundColor: P.amberLight }]}>
            <Text style={s.statIcon}>💊</Text>
          </View>
          <Text style={s.statValue}>{prescriptions.length}</Text>
          <Text style={s.statLabel}>Refills Due Soon</Text>
          <Text style={s.statSub}>Next 7 days</Text>
        </View>

        <View style={[s.statCard, { borderLeftColor: P.green }]}>
          <View style={[s.statIconBox, { backgroundColor: P.greenLight }]}>
            <Text style={s.statIcon}>✅</Text>
          </View>
          <Text style={s.statValue}>{allPrescriptions.length}</Text>
          <Text style={s.statLabel}>Total Prescriptions</Text>
          <Text style={s.statSub}>All medications</Text>
        </View>
      </View>

      <Card>
        <Text style={s.sectionTitle}>Patient Information</Text>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Name</Text>
          <Text style={s.infoValue}>{patient?.name}</Text>
        </View>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Email</Text>
          <Text style={s.infoValue}>{patient?.email}</Text>
        </View>
        <View style={[s.infoRow, { borderBottomWidth: 0 }]}>
          <Text style={s.infoLabel}>Member Since</Text>
          <Text style={s.infoValue}>
            {patient?.created_at ? new Date(patient.created_at).toLocaleDateString() : '—'}
          </Text>
        </View>
      </Card>

      <Card>
        <View style={s.sectionHead}>
          <Text style={s.sectionTitle}>Appointments in Next 7 Days</Text>
          <TouchableOpacity onPress={() => router.push('/portal/appointments' as Href)}>
            <Text style={s.link}>View All →</Text>
          </TouchableOpacity>
        </View>

        {appointments.length === 0 ? (
          <EmptyState
            icon="📅"
            title="No upcoming appointments"
            message="You’re all caught up for the next 7 days."
          />
        ) : (
          appointments.map((appt) => (
            <View key={appt.id} style={s.rowCard}>
              <View style={s.rowTop}>
                <Text style={s.rowTitle}>{appt.provider}</Text>
                <View style={s.badgeBlue}>
                  <Text style={s.badgeBlueText}>{appt.status || 'scheduled'}</Text>
                </View>
              </View>
              <Text style={s.rowSub}>
                {new Date(appt.datetime).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </Text>
              <Text style={s.rowMeta}>Repeat: {appt.repeat}</Text>
            </View>
          ))
        )}
      </Card>

      <Card>
        <View style={s.sectionHead}>
          <Text style={s.sectionTitle}>Refills in Next 7 Days</Text>
          <TouchableOpacity onPress={() => router.push('/portal/prescriptions' as Href)}>
            <Text style={s.link}>View All →</Text>
          </TouchableOpacity>
        </View>

        {prescriptions.length === 0 ? (
          <EmptyState
            icon="💊"
            title="No refills due soon"
            message="No medication refills are scheduled in the next 7 days."
          />
        ) : (
          prescriptions.map((pres) => (
            <View key={pres.id} style={s.rowCard}>
              <View style={s.rowTop}>
                <Text style={s.rowTitle}>{pres.medication}</Text>
                {isRefillSoon(pres.refill_on) && (
                  <View style={s.badgeAmber}>
                    <Text style={s.badgeAmberText}>Refill Soon</Text>
                  </View>
                )}
              </View>
              <Text style={s.rowSub}>
                {pres.dosage} · Qty: {pres.quantity}
              </Text>
              <Text style={s.rowMeta}>Refill on: {pres.refill_on}</Text>
            </View>
          ))
        )}
      </Card>
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
    lineHeight: 32,
  },
  sub: {
    color: 'rgba(255,255,255,0.82)',
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statsGridMobile: {
    flexDirection: 'column',
  },
  statCard: {
    flex: 1,
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
  statValue: {
    fontSize: 28,
    fontFamily: 'Nunito_800ExtraBold',
    color: P.heading,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: P.heading,
    marginTop: 2,
  },
  statSub: {
    fontSize: 11,
    fontFamily: 'Nunito_400Regular',
    color: P.text,
    marginTop: 2,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
    color: P.heading,
  },
  link: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: P.blue,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
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
  rowCard: {
    backgroundColor: P.white,
    borderWidth: 1,
    borderColor: P.border,
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  rowTitle: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: P.heading,
  },
  rowSub: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: P.text,
  },
  rowMeta: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
    color: P.skyDark,
    marginTop: 6,
  },
  badgeBlue: {
    backgroundColor: P.sky,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  badgeBlueText: {
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
    color: P.skyDark,
    textTransform: 'capitalize',
  },
  badgeAmber: {
    backgroundColor: P.amberLight,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  badgeAmberText: {
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
    color: P.amber,
  },
})