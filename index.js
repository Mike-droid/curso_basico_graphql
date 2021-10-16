require('dotenv').config();
const { makeExecutableSchema } = require("graphql-tools");
const express = require("express");
const cors = require("cors");
const { graphqlHTTP } = require("express-graphql");
const { readFileSync } = require("fs");
const { join } = require("path");
const resolvers = require("./lib/resolvers");

const app = express();
const port = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV.trimRight() !== "production"
//* Hacemos trimRight porque el NODE_ENV viene con un espacio al final, en package.json

//*Definiendo el esquema
const typeDefs = readFileSync(join(__dirname, "lib", "schema.graphql"), "utf-8");
const schema = makeExecutableSchema({ typeDefs, resolvers });
//* Nos traemos el schema desde donde se encuentra

//* Configurar los resolvers para que la query sí regrese información

app.use(cors());

app.use('/api', graphqlHTTP({
    schema,
    rootValue: resolvers,
    graphiql: isDev
}));

app.listen(port, () => {
    console.log(`Server running on port ${port}/api`);
});
