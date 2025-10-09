// server/src/schema.js
const { gql } = require("apollo-server-express");

module.exports = gql`
  type Job {
    id: ID!
    region: String
    position: String
    school: String
    hours: String
    salary: String
    housing: String
    benefits: String
    contacts: String
    email: String
    duties: String
    support: String
    studentEmployment: String
    openDate: String
  }

  type Response {
    id: ID!
    jobId: ID!
    name: String!
    email: String!
    phone: String
    message: String
  }

  type Query {
    jobs: [Job]
    job(id: ID!): Job
  }

  type Mutation {
    addResponse(
      jobId: ID!
      name: String!
      email: String!
      phone: String
      message: String
    ): Response
  }
`;
