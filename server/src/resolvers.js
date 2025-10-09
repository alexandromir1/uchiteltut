// server/src/resolvers.js
const { getJobs } = require("./excelLoader");
const fs = require("fs");
const path = require("path");

const RESPONSES_FILE = path.join(__dirname, "../data/responses.json");

// Загружаем отклики из файла
function loadResponses() {
  if (!fs.existsSync(RESPONSES_FILE)) return [];
  return JSON.parse(fs.readFileSync(RESPONSES_FILE, "utf8"));
}

// Сохраняем отклики
function saveResponses(responses) {
  fs.writeFileSync(RESPONSES_FILE, JSON.stringify(responses, null, 2), "utf8");
}

const resolvers = {
  Query: {
    jobs: () => getJobs(),
    job: (_, { id }) => getJobs().find((j) => j.id === id),
  },

  Mutation: {
    addResponse: (_, { jobId, name, email, phone, message }) => {
      const responses = loadResponses();
      const newResponse = {
        id: `resp-${Date.now()}`,
        jobId,
        name,
        email,
        phone,
        message,
      };
      responses.push(newResponse);
      saveResponses(responses);
      return newResponse;
    },
  },
};

module.exports = resolvers;
