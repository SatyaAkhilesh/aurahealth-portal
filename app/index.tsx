import { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native'
import { useRouter, type Href } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { supabase } from '@/lib/supabase'
import Input from '@/components/Input'
import Button from '@/components/Button'
import Card from '@/components/Card'

const PATIENT_SESSION_KEY = 'aurahealth_patient_session'

const P = {
  teal: '#0F8DA8',
  tealDark: '#0C6F86',
  tealLight: '#E6F7FA',
  cream: '#FAF7F2',
  forest: '#18382C',
  stone: '#7C7A70',
}

export default function PatientLoginPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    const raw = await AsyncStorage.getItem(PATIENT_SESSION_KEY)

    if (raw) {
      router.replace('/portal' as Href)
      return
    }

    setChecking(false)
  }

  const handleLogin = async () => {
    setError('')

    if (!form.email.trim() || !form.password.trim()) {
      setError('Email and password are required')
      return
    }

    setLoading(true)

    const { data, error: queryError } = await supabase
      .from('patients')
      .select('id, name, email, created_at, password')
      .eq('email', form.email.trim().toLowerCase())
      .single()

    if (queryError || !data) {
      setError('Invalid credentials')
      setLoading(false)
      return
    }

    if (data.password !== form.password) {
      setError('Invalid credentials')
      setLoading(false)
      return
    }

    await AsyncStorage.setItem(
      PATIENT_SESSION_KEY,
      JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email,
        created_at: data.created_at,
      })
    )

    router.replace('/portal' as Href)
    setLoading(false)
  }

  if (checking) return null

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={s.hero}>
        <Text style={s.eye}>PATIENT PORTAL</Text>
        <Text style={s.title}>
          Your Health,
          {'\n'}
          at a Glance
        </Text>
        <Text style={s.sub}>
          View upcoming appointments, medication refills, and your health details.
        </Text>
      </View>

      <Card style={s.card}>
        <Text style={s.cardTitle}>Sign In</Text>
        <Text style={s.cardSub}>Use your patient email and password</Text>

        <Input
          label="Email"
          value={form.email}
          onChangeText={(text) => setForm({ ...form, email: text })}
          placeholder="mark@some-email-provider.net"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Password"
          value={form.password}
          onChangeText={(text) => setForm({ ...form, password: text })}
          placeholder="Password123!"
          secureTextEntry
          autoCapitalize="none"
        />

        {!!error && <Text style={s.error}>⚠ {error}</Text>}

        <Button title="Sign In" onPress={handleLogin} loading={loading} />

        <View style={s.demoBox}>
          <Text style={s.demoTitle}>Demo Credentials</Text>
          <Text style={s.demoText}>mark@some-email-provider.net / Password123!</Text>
          <Text style={s.demoText}>lisa@some-email-provider.net / Password123!</Text>
        </View>

        <TouchableOpacity activeOpacity={0.7}>
          <Text style={s.portalOnly}>Patient access only</Text>
        </TouchableOpacity>
      </Card>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: P.cream,
    justifyContent: 'center',
    padding: 24,
  },
  hero: {
    marginBottom: 24,
  },
  eye: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    letterSpacing: 2,
    color: P.teal,
    marginBottom: 6,
  },
  title: {
    fontSize: 30,
    lineHeight: 38,
    fontFamily: 'Nunito_800ExtraBold',
    color: P.forest,
  },
  sub: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'Nunito_400Regular',
    color: P.stone,
    maxWidth: 520,
  },
  card: {
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  cardTitle: {
    fontSize: 22,
    fontFamily: 'Nunito_800ExtraBold',
    color: P.forest,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: P.stone,
    marginBottom: 18,
  },
  error: {
    color: '#B8402A',
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    marginBottom: 12,
  },
  demoBox: {
    marginTop: 16,
    backgroundColor: P.tealLight,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CBEAF0',
  },
  demoTitle: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: P.tealDark,
    marginBottom: 6,
  },
  demoText: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: P.tealDark,
    marginBottom: 2,
  },
  portalOnly: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: P.teal,
  },
})