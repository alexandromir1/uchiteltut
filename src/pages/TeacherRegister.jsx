// TeacherRegister.jsx
import { useState } from 'react'
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native-web'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'

const TeacherRegister = () => {
  const [form, setForm] = useState({ name: '', subject: '', experience: 0 })
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e && e.preventDefault && e.preventDefault()
    await axios.post(`${BASE_URL}/api/teachers`, form)
    navigate('/teacher/dashboard')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Регистрация учителя</Text>
      <View style={styles.form}>
        <TextInput placeholder="ФИО" style={styles.input} onChangeText={(v) => setForm({ ...form, name: v })} />
        <TextInput placeholder="Предмет" style={styles.input} onChangeText={(v) => setForm({ ...form, subject: v })} />
        <TextInput placeholder="Опыт (лет)" style={styles.input} onChangeText={(v) => setForm({ ...form, experience: Number(v || 0) })} keyboardType="numeric" />
        <TouchableOpacity style={styles.button} onClick={handleSubmit} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Сохранить</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { maxWidth: 560, marginTop: '40px', margin: 'auto', padding: 20, backgroundColor: '#fff', borderRadius: 12 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  form: { display: 'flex', gap: 12 },
  input: { height: 48, borderRadius: 10, borderWidth: 1, borderColor: '#e5e5e5', padding: 12, fontSize: 16 },
  button: { backgroundColor: '#2637A1', height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' }
})

export default TeacherRegister
