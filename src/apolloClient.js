import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const client = new ApolloClient({
  link: new HttpLink({
    uri: "http://localhost:5000/graphql", // ⚠️ адрес твоего сервера Apollo
  }),
  cache: new InMemoryCache(),
});

export default client;
