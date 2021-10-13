require('dotenv').config();
const { makeExecutableSchema } = require("graphql-tools");
const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { readFileSync } = require("fs");
const { join } = require("path");
const resolvers = require("./lib/resolvers");

const app = express();
const port = process.env.PORT || 3000;

//*Definiendo el esquema
const typeDefs = readFileSync(join(__dirname, "lib", "schema.graphql"), "utf-8");
const schema = makeExecutableSchema({ typeDefs, resolvers });
//* Nos traemos el schema desde donde se encuentra

//* Configurar los resolvers para que la query sí regrese información

app.use('/api', graphqlHTTP({
    schema,
    rootValue: resolvers,
    graphiql: true
}));

app.listen(port, () => {
    console.log(`Server running on port ${port}/api`);
});
