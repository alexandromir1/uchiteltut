import React from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // ДОБАВЬТЕ ЭТОТ ИМПОРТ
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import JobDetail from './pages/JobDetail';
import TeacherProfile from './pages/TeacherProfile';
import SchoolProfile from './pages/SchoolProfile';
import './App.css';

const API_URL = 'https://uchiteltut.onrender.com/graphql';

const httpLink = createHttpLink({
  uri: API_URL,
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider> {/* ДОБАВЬТЕ ЭТУ ОБЕРТКУ */}
        <Router basename={process.env.PUBLIC_URL}>
          <div className="App">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/job/:id" element={<JobDetail />} />
              <Route path="/profile/teacher" element={<TeacherProfile />} />
              <Route path="/profile/school" element={<SchoolProfile />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider> {/* ЗАКРОЙТЕ ОБЕРТКУ */}
    </ApolloProvider>
  );
}

export default App;