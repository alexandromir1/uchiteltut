// TeacherDashboard.jsx
import { useState } from 'react'
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native-web'
import axios from 'axios'

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'

const TeacherDashboard = () => {
  const [form, setForm] = useState({ subject: '', experience: 0 })
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)

  const search = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${BASE_URL}/api/match-jobs`, { params: { subject: form.subject, experience: form.experience } })
      setJobs(res.data || [])
    } catch (err) {
      console.error(err)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Личный кабинет учителя</Text>
      <View style={styles.form}>
        <TextInput placeholder="Предмет" style={styles.input} value={form.subject} onChangeText={(v) => setForm({ ...form, subject: v })} />
        <TextInput placeholder="Опыт (лет)" style={styles.input} value={String(form.experience)} onChangeText={(v) => setForm({ ...form, experience: Number(v || 0) })} keyboardType="numeric" />
        <TouchableOpacity style={styles.button} onClick={search} onPress={search}>
          <Text style={styles.buttonText}>Найти вакансии</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {loading ? <Text>Поиск...</Text> : jobs.map(job => (
          <View key={job.id} style={styles.card}>
            <Text style={styles.cardTitle}>{job.title}</Text>
            <Text>{job.subject} — {job.minExperience}+ лет</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { maxWidth: 900, marginTop: '40px', margin: 'auto', padding: 20, backgroundColor: '#fff', borderRadius: 12 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  form: { display: 'flex', gap: 12, marginBottom: 16 },
  input: { height: 48, borderRadius: 10, borderWidth: 1, borderColor: '#e5e5e5', padding: 12, fontSize: 16 },
  button: { backgroundColor: '#2637A1', height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  list: { display: 'flex', gap: 12, marginTop: 10 },
  card: { padding: 12, borderRadius: 10, backgroundColor: '#FAFAFF' },
  cardTitle: { fontWeight: '600', marginBottom: 6 }
})

export default TeacherDashboard
