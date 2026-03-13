import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
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
  warning: '#C98A04',
  warningLight: '#FEF3C7',
}

function isWithinNext7Days(dateStr: string) {
  const now = new Date()
  const target = new Date(dateStr)
  const diff = (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return diff >= 0 && diff <= 7
}

export default function PortalHome() {
  const router = useRouter()
  const [patient, setPatient] = useState<PatientSession | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
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
          <Avatar name={patient?.name || 'P'} size={58} />
          <View style={{ flex: 1 }}>
            <Text style={s.eye}>PATIENT DASHBOARD</Text>
            <Text style={s.title}>
              {greeting()}, {patient?.name?.split(' ')[0]} 👋
            </Text>
            <Text style={s.sub}>Here’s your health summary for the next 7 days.</Text>
          </View>
        </View>
      </View>

      <Card>
        <Text style={s.sectionTitle}>Basic Info</Text>
        <Text style={s.infoText}>Name: {patient?.name}</Text>
        <Text style={s.infoText}>Email: {patient?.email}</Text>
        <Text style={s.infoText}>
          Member since: {patient?.created_at ? new Date(patient.created_at).toLocaleDateString() : '—'}
        </Text>
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
            title="No upcoming appointments this week"
            message="You’re all clear for the next 7 days."
          />
        ) : (
          appointments.map((appt) => (
            <View key={appt.id} style={s.rowCard}>
              <Text style={s.rowTitle}>{appt.provider}</Text>
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
            title="No refills due this week"
            message="No medication refills are coming up soon."
          />
        ) : (
          prescriptions.map((pres) => (
            <View key={pres.id} style={[s.rowCard, { borderColor: '#FDE7A8' }]}>
              <Text style={s.rowTitle}>{pres.medication}</Text>
              <Text style={s.rowSub}>
                {pres.dosage} · Qty: {pres.quantity}
              </Text>
              <View style={s.refillBadge}>
                <Text style={s.refillBadgeText}>Refill on {pres.refill_on}</Text>
              </View>
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: P.cream },
  hero: {
    backgroundColor: P.teal,
    borderRadius: 18,
    padding: 22,
    marginBottom: 16,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
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
    lineHeight: 30,
  },
  sub: {
    color: 'rgba(255,255,255,0.75)',
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    marginTop: 4,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Nunito_800ExtraBold',
    color: P.forest,
  },
  link: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: P.teal,
  },
  infoText: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: P.stone,
    marginTop: 8,
  },
  rowCard: {
    backgroundColor: P.white,
    borderWidth: 1,
    borderColor: P.parchment,
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
  },
  rowTitle: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: P.forest,
    marginBottom: 4,
  },
  rowSub: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: P.stone,
  },
  rowMeta: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
    color: P.tealDark,
    marginTop: 6,
  },
  refillBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: P.warningLight,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  refillBadgeText: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    color: P.warning,
  },
})