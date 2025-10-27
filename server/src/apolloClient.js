import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Определяем URL API в зависимости от среды
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return window.location.origin + '/graphql';
  } else {
    return 'http://localhost:5000/graphql';
  }
};

const API_URL = getApiUrl();

console.log('🔗 Apollo Client connecting to:', API_URL);

const httpLink = createHttpLink({
  uri: API_URL,
  credentials: 'same-origin'
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          jobs: {
            merge(existing = [], incoming) {
              return incoming;
            }
          }
        }
      }
    }
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all'
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all'
    }
  }
});

export default client;