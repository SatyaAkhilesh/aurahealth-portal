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
  blue: '#2563EB',
  blueDark: '#1D4ED8',
  blueLight: '#DBEAFE',
  sky: '#E0F2FE',
  skyDark: '#0369A1',
  green: '#16A34A',
  greenLight: '#DCFCE7',
  amber: '#D97706',
  amberLight: '#FEF3C7',
  red: '#DC2626',
  redLight: '#FEE2E2',
  background: '#F8FAFC',
  white: '#FFFFFF',
  heading: '#0F172A',
  text: '#64748B',
  border: '#E2E8F0',
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

  const refillSoonCount = prescriptions.filter((p) => isRefillSoon(p.refill_on)).length
  const activeCount = prescriptions.filter((p) => (p.status || 'active') === 'active').length

  if (loading) return <LoadingSpinner message="Loading prescriptions..." />

  return (
    <ScrollView style={s.root} contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
      <View style={s.hero}>
        <Text style={s.eye}>PRESCRIPTIONS</Text>
        <Text style={s.title}>Medication Overview</Text>
        <Text style={s.sub}>Track medications, refill timing, and prescription details.</Text>
      </View>

      <View style={s.statsGrid}>
        <View style={[s.statCard, { borderLeftColor: P.blue }]}>
          <View style={[s.statIconBox, { backgroundColor: P.blueLight }]}>
            <Text style={s.statIcon}>💊</Text>
          </View>
          <Text style={s.statValue}>{prescriptions.length}</Text>
          <Text style={s.statLabel}>Total Prescriptions</Text>
          <Text style={s.statSub}>All medications</Text>
        </View>

        <View style={[s.statCard, { borderLeftColor: P.amber }]}>
          <View style={[s.statIconBox, { backgroundColor: P.amberLight }]}>
            <Text style={s.statIcon}>⏰</Text>
          </View>
          <Text style={s.statValue}>{refillSoonCount}</Text>
          <Text style={s.statLabel}>Refills Due Soon</Text>
          <Text style={s.statSub}>Next 7 days</Text>
        </View>

        <View style={[s.statCard, { borderLeftColor: P.green }]}>
          <View style={[s.statIconBox, { backgroundColor: P.greenLight }]}>
            <Text style={s.statIcon}>✅</Text>
          </View>
          <Text style={s.statValue}>{activeCount}</Text>
          <Text style={s.statLabel}>Active Medications</Text>
          <Text style={s.statSub}>Currently active</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
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
              <View style={s.rowTop}>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle}>{pres.medication}</Text>
                  <Text style={s.cardSub}>
                    {pres.dosage} · Qty: {pres.quantity}
                  </Text>
                </View>

                <View style={s.rightBadges}>
                  {soon && (
                    <View style={s.alertBadge}>
                      <Text style={s.alertBadgeTxt}>Refill Soon</Text>
                    </View>
                  )}
                  <View style={[s.statusBadge, status === 'active' ? s.statusActive : s.statusInactive]}>
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
              </View>

              <View style={s.metaRow}>
                <View style={s.infoPill}>
                  <Text style={s.infoPillTxt}>Refill on {pres.refill_on}</Text>
                </View>
                <View style={s.scheduleBadge}>
                  <Text style={s.scheduleBadgeTxt}>{pres.refill_schedule}</Text>
                </View>
              </View>

              {!!pres.notes && (
                <View style={s.notesBox}>
                  <Text style={s.notesTitle}>Doctor&apos;s notes</Text>
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
  filterRow: {
    gap: 10,
    paddingBottom: 12,
    marginBottom: 4,
  },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: P.white,
    borderWidth: 1,
    borderColor: P.border,
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
    color: P.white,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    flexWrap: 'wrap',
  },
  rightBadges: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
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
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 10,
  },
  infoPill: {
    backgroundColor: P.sky,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  infoPillTxt: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    color: P.skyDark,
  },
  scheduleBadge: {
    backgroundColor: P.blueLight,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  scheduleBadgeTxt: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    color: P.blueDark,
    textTransform: 'capitalize',
  },
  statusBadge: {
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusActive: {
    backgroundColor: P.greenLight,
  },
  statusInactive: {
    backgroundColor: '#F1F5F9',
  },
  statusBadgeTxt: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    textTransform: 'capitalize',
  },
  statusActiveTxt: {
    color: P.green,
  },
  statusInactiveTxt: {
    color: P.text,
  },
  alertBadge: {
    backgroundColor: P.amberLight,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  alertBadgeTxt: {
    color: P.amber,
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
  },
  notesBox: {
    marginTop: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: P.border,
  },
  notesTitle: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    color: P.heading,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: P.text,
    lineHeight: 18,
  },
})