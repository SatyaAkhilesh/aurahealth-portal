import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { supabase } from '@/lib/supabase'
import Card from '@/components/Card'
import EmptyState from '@/components/EmptyState'
import LoadingSpinner from '@/components/LoadingSpinner'

const PATIENT_SESSION_KEY = 'aurahealth_patient_session'

type PatientSession = {
  id: string
  name: string
  email: string
  created_at?: string
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
  teal: '#0F8DA8',
  tealDark: '#0C6F86',
  cream: '#FAF7F2',
  forest: '#18382C',
  stone: '#7C7A70',
  warning: '#C98A04',
  warningLight: '#FEF3C7',
  success: '#4F7D5C',
  successLight: '#EAF2EC',
}

function isRefillSoon(dateStr: string) {
  const now = new Date()
  const target = new Date(dateStr)
  const diff = (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return diff >= 0 && diff <= 7
}

export default function PortalPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  const fetchPrescriptions = async () => {
    const raw = await AsyncStorage.getItem(PATIENT_SESSION_KEY)
    if (!raw) {
      setLoading(false)
      return
    }

    const session: PatientSession = JSON.parse(raw)

    const { data } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('patient_id', session.id)
      .order('refill_on', { ascending: true })

    setPrescriptions(data || [])
    setLoading(false)
  }

  const filteredPrescriptions =
    filter === 'all'
      ? prescriptions
      : prescriptions.filter((p) => {
          const status = p.status || 'active'
          return status === filter
        })

  if (loading) return <LoadingSpinner message="Loading prescriptions..." />

  return (
    <ScrollView style={s.root} contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
      <View style={s.hero}>
        <Text style={s.eye}>PRESCRIPTIONS</Text>
        <Text style={s.title}>Medication Overview</Text>
        <Text style={s.sub}>View all prescriptions and upcoming refills.</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterRow}
      >
        {(['all', 'active', 'inactive'] as const).map((item) => (
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

      {filteredPrescriptions.length === 0 ? (
        <Card>
          <EmptyState
            icon="💊"
            title="No prescriptions found"
            message="There are no prescriptions for this filter."
          />
        </Card>
      ) : (
        filteredPrescriptions.map((pres) => {
          const soon = isRefillSoon(pres.refill_on)
          const status = pres.status || 'active'

          return (
            <Card key={pres.id}>
              <View style={s.titleRow}>
                <Text style={s.cardTitle}>{pres.medication}</Text>
                {soon && (
                  <View style={s.alertBadge}>
                    <Text style={s.alertBadgeTxt}>⚠ Refill Soon</Text>
                  </View>
                )}
              </View>

              <Text style={s.cardSub}>
                {pres.dosage} · Qty: {pres.quantity}
              </Text>

              <Text style={[s.refillText, soon && s.refillSoon]}>
                Refill on: {pres.refill_on}
              </Text>

              <View style={s.metaRow}>
                <View style={s.scheduleBadge}>
                  <Text style={s.scheduleBadgeTxt}>{pres.refill_schedule}</Text>
                </View>

                <View
                  style={[
                    s.statusBadge,
                    status === 'active' ? s.statusActive : s.statusInactive,
                  ]}
                >
                  <Text
                    style={[
                      s.statusBadgeTxt,
                      status === 'active' ? s.statusActiveTxt : s.statusInactiveTxt,
                    ]}
                  >
                    {status}
                  </Text>
                </View>
              </View>

              {!!pres.notes && (
                <View style={s.notesBox}>
                  <Text style={s.notesTitle}>Doctor's notes</Text>
                  <Text style={s.notesText}>{pres.notes}</Text>
                </View>
              )}
            </Card>
          )
        })
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    color: P.forest,
  },
  cardSub: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: P.stone,
    marginBottom: 8,
  },
  refillText: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    color: P.tealDark,
  },
  refillSoon: {
    color: P.warning,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 10,
  },
  scheduleBadge: {
    backgroundColor: '#E6F7FA',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  scheduleBadgeTxt: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    color: P.tealDark,
    textTransform: 'capitalize',
  },
  statusBadge: {
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusActive: {
    backgroundColor: P.successLight,
  },
  statusInactive: {
    backgroundColor: '#F3F4F6',
  },
  statusBadgeTxt: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    textTransform: 'capitalize',
  },
  statusActiveTxt: {
    color: P.success,
  },
  statusInactiveTxt: {
    color: P.stone,
  },
  alertBadge: {
    backgroundColor: P.warningLight,
    borderRadius: 20,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  alertBadgeTxt: {
    color: P.warning,
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
  },
  notesBox: {
    marginTop: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
  },
  notesTitle: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    color: P.forest,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: P.stone,
    lineHeight: 18,
  },
})