import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { supabase } from '@/lib/supabase'
import Card from '@/components/Card'
import EmptyState from '@/components/EmptyState'
import LoadingSpinner from '@/components/LoadingSpinner'
import Badge from '@/components/Badge'
import { exportAppointmentsPdf } from '@/lib/pdf/exportAppointmentsPdf'

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

const P = {
  blue: '#2563EB',
  blueDark: '#1D4ED8',
  blueLight: '#DBEAFE',
  background: '#F8FAFC',
  white: '#FFFFFF',
  heading: '#0F172A',
  text: '#64748B',
  border: '#E2E8F0',
}

function isWithinNext3Months(dateStr: string) {
  const now = new Date()
  const limit = new Date()
  limit.setMonth(limit.getMonth() + 3)
  const target = new Date(dateStr)
  return target >= now && target <= limit
}

export default function PortalAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all')
  const [patientName, setPatientName] = useState('')

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    const raw = await AsyncStorage.getItem(PATIENT_SESSION_KEY)
    if (!raw) {
      setLoading(false)
      return
    }

    const session: PatientSession = JSON.parse(raw)
    setPatientName(session.name)

    const { data } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', session.id)
      .order('datetime', { ascending: true })

    const upcoming = (data || []).filter((a) => isWithinNext3Months(a.datetime))
    setAppointments(upcoming)
    setLoading(false)
  }

  const filteredAppointments =
    filter === 'all'
      ? appointments
      : appointments.filter((a) => (a.status || 'scheduled') === filter)

  if (loading) return <LoadingSpinner message="Loading appointments..." />

  return (
    <ScrollView style={s.root} contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
      <View style={s.hero}>
        <Text style={s.eye}>APPOINTMENTS</Text>
        <Text style={s.title}>Upcoming Schedule</Text>
        <Text style={s.sub}>Showing appointments for the next 3 months.</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterRow}
      >
        {(['all', 'scheduled', 'completed', 'cancelled'] as const).map((item) => (
          <TouchableOpacity
            key={item}
            style={[s.filterBtn, filter === item && s.filterBtnActive]}
            onPress={() => setFilter(item)}
            activeOpacity={0.7}
          >
            <Text style={[s.filterTxt, filter === item && s.filterTxtActive]}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={s.pdfBtn}
        onPress={() => exportAppointmentsPdf(patientName, filteredAppointments)}
        activeOpacity={0.8}
      >
        <Text style={s.pdfBtnTxt}>⬇ Download Appointments PDF</Text>
      </TouchableOpacity>

      {filteredAppointments.length === 0 ? (
        <Card>
          <EmptyState
            icon="📅"
            title="No appointments found"
            message="There are no appointments for this filter in the next 3 months."
          />
        </Card>
      ) : (
        filteredAppointments.map((appt) => (
          <Card key={appt.id}>
            <Text style={s.cardTitle}>{appt.provider}</Text>
            <Text style={s.cardSub}>
              {new Date(appt.datetime).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </Text>
            <Text style={s.meta}>Repeat: {appt.repeat}</Text>
            <View style={{ marginTop: 10 }}>
              <Badge status={appt.status || 'scheduled'} />
            </View>
          </Card>
        ))
      )}
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
  eye: {
    color: '#DBEAFE',
    fontFamily: 'Nunito_700Bold',
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 24,
  },
  sub: {
    color: 'rgba(255,255,255,0.82)',
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    marginTop: 4,
  },
  filterRow: {
    gap: 10,
    paddingBottom: 12,
    marginBottom: 4,
  },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterBtnActive: {
    backgroundColor: P.blue,
    borderColor: P.blue,
  },
  filterTxt: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: P.text,
  },
  filterTxtActive: {
    color: '#FFFFFF',
  },
  pdfBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  pdfBtnTxt: {
    color: '#1D4ED8',
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    color: P.heading,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: P.text,
  },
  meta: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
    color: P.blueDark,
    marginTop: 8,
  },
})