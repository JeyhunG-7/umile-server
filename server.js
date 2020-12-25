require('dotenv').config()

const express = require('express')
const app = express()

const http = require('http');
const https = require('https');

// Express middlewares
const bodyParser = require('body-parser');
const cors = require('cors');
app.use(cors(), bodyParser.json());

// Create apollo server for graphql
const fs = require('fs')
const typeDefs = fs.readFileSync('./schema.graphql',{encoding:'utf-8'})
const resolvers = require('./resolvers')
const { ApolloServer, gql } = require('apollo-server-express');
const server = new ApolloServer({ typeDefs, resolvers });
server.applyMiddleware({ app });

const path = require('path');
app.use(express.static('build'));
// Express requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, "/build", "index.html"));
})


// Server 
const port = 8080;
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})