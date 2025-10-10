// client/src/App.jsx
import React from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import JobDetail from './pages/JobDetail';
import TeacherProfile from './pages/TeacherProfile';
import SchoolProfile from './pages/SchoolProfile';

import './App.css';

const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://uchiteltut.onrender.com/graphql'
  : 'http://localhost:5000/graphql';

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
    </ApolloProvider>
  );
}

export default App;