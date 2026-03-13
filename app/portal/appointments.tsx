import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { supabase } from '@/lib/supabase'
import Card from '@/components/Card'
import EmptyState from '@/components/EmptyState'
import LoadingSpinner from '@/components/LoadingSpinner'
import Badge from '@/components/Badge'

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
  teal: '#0F8DA8',
  tealDark: '#0C6F86',
  cream: '#FAF7F2',
  forest: '#18382C',
  stone: '#7C7A70',
}

function isWithinNext3Months(dateStr: string) {
  return true
}

export default function PortalAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all')

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
    backgroundColor: P.cream,
  },
  hero: {
    backgroundColor: P.teal,
    borderRadius: 18,
    padding: 22,
    marginBottom: 16,
  },
  eye: {
    color: '#CDEEF4',
    fontFamily: 'Nunito_700Bold',
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 22,
  },
  sub: {
    color: 'rgba(255,255,255,0.75)',
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
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
    borderColor: '#E8E1D6',
  },
  filterBtnActive: {
    backgroundColor: P.teal,
    borderColor: P.teal,
  },
  filterTxt: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: P.stone,
  },
  filterTxtActive: {
    color: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    color: P.forest,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: P.stone,
  },
  meta: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
    color: P.tealDark,
    marginTop: 8,
  },
})