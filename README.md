# Curso básico de GraphQL

## Introducción

### Prerequisitos

Saber Node y MongoDB.

### ¿Qué es GraphQL?

[Documental de GraphQL](https://www.youtube.com/watch?v=783ccP__No8)

GraphQL es un nuevo paradigma para intercambiar información. Esta tecnología fue creada por Facebook en el 2015 y resuelve algunas limitaciones que tiene REST.

## Conceptos básicos

### Schema y types

La base de una API en GraphQL es el *schema*. Este es un documento que describe detalladamente todos los tipos de información que va a tener el API, cada uno especificando qué tipo de campo es.

Hacemos `npm init -y` y `npm i graphql`.

Archivo index.js:

```javascript
const { graphql, buildSchema } = require("graphql");

//definiendo el esquema
const schema = buildSchema(`
    type Query {
        hello: String
    }
`)

//Ejecutar el query hello
graphql(schema, '{ hello }').then((data) => {
    console.log(data)
})
```

### Queries y Resolvers

Una query me permite ejecutar un request a la API para obtener información. Debemos indicar qué campos son los que queremos.

[Mejores prácticas con Resolvers en GraphQL](https://medium.com/paypal-tech/graphql-resolvers-best-practices-cd36fdbcef55)

index.js:

```javascript
const { graphql, buildSchema } = require("graphql");

//*Definiendo el esquema
const schema = buildSchema(`
    type Query {
        hello: String
        pokemon: String
    }
`)
//*Lo arriba es: Tipo -> Query. Nombre de query -> Hello. Dato que retorna -> String

//* Configurar los resolvers para que la query sí regrese información
const resolvers = {
    hello: () => { return "Hello World!" },
    pokemon: () => { return "Pikachu" }
}

//*Ejecutar el query hello
graphql(schema, '{ hello, pokemon }', resolvers).then((data) => {
    console.log(data)
})
```

### Sirviendo el API en la web

Instalamos `npm i express express-graphql nodemon dotenv`

index.js:

```javascript
const { graphql, buildSchema } = require("graphql");
const express = require("express");
const { graphqlHTTP } = require("express-graphql");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

//*Definiendo el esquema
const schema = buildSchema(`
    type Query {
        hello: String
        pokemon: String
    }
`)
//*Lo arriba es: Tipo -> Query. Nombre de query -> Hello. Dato que retorna -> String

//* Configurar los resolvers para que la query sí regrese información
const resolvers = {
    hello: () => { return "Hello World!" },
    pokemon: () => { return "Pikachu" }
}

app.use('/api', graphqlHTTP({
    schema,
    rootValue: resolvers,
    graphiql: true
}));

app.listen(port, () => {
    console.log(`Server running on port ${port}/api`);
});

```

package.json:

```JSON
"dev": "nodemon -e js, graphql index"
```

### Custom Types

Creamos la carpeta 'lib' y dentro de ella:

resolvers.js:

```javascript
const courses = [
    {
        _id: 'anyid',
        title: 'My title',
        teacher: 'My teacher',
        description: 'My description',
        topic: 'Programming',
    },
    {
        _id: 'anyid',
        title: 'My title 2',
        teacher: 'My teacher 2',
        description: 'My description2',
        topic: 'Programming 2',
    },
    {
        _id: 'anyid',
        title: 'My title 3',
        teacher: 'My teacher 3',
        description: 'My description 3',
        topic: 'Programming 3',
    },
]

module.exports = {
    getCourses: () => { return courses }
}

```

Y también schema.graphql:

```graphql
type Course {
    _id: ID
    title: String
    teacher: String
    description: String
    topic: String
}

type Query {
    "Devuelve todos los cursos"
    getCourses: [Course]
}
```

Mejoramos index.js:

```javascript
const { buildSchema } = require("graphql");
const express = require("express");
const { graphqlHTTP } = require("express-graphql");
require('dotenv').config();
const { readFileSync } = require("fs");
const { join } = require("path");
const resolvers = require("./lib/resolvers");

const app = express();
const port = process.env.PORT || 3000;

//*Definiendo el esquema
const schema = buildSchema(readFileSync(join(__dirname, "lib", "schema.graphql"), "utf-8"));
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

```

### Argumentos

Instalamos `npm i graphql-tools`

index.js:

```javascript
const { makeExecutableSchema } = require("graphql-tools");
const express = require("express");
const { graphqlHTTP } = require("express-graphql");
require('dotenv').config();
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

```

resolvers.js:

```javascript
const courses = [
    {
        _id: '1',
        title: 'My title',
        teacher: 'My teacher',
        description: 'My description',
        topic: 'Programming',
    },
    {
        _id: '2',
        title: 'My title 2',
        teacher: 'My teacher 2',
        description: 'My description 2',
        topic: 'Programming 2',
    },
    {
        _id: '3',
        title: 'My title 3',
        teacher: 'My teacher 3',
        description: 'My description 3',
        topic: 'Programming 3',
    },
]

module.exports = {
    Query: {
        getCourses: () => { return courses },
        getCourse: (root, args) => {
            const course = courses.find(course => course._id === args.id)
            return course
        }
    },
}

```

Y podemos hacer un query como el siguiente:

```graphql
{
    getCourse(id: "2"){
        title
        description
    }
}
```

### Configuración de base de datos

lib/db.js:

```javascript
const { MongoClient } = require('mongodb');

const {
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    DB_PORT,
    DB_NAME
} = process.env;

const mongoUrl = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

let conection;

async function connectDB() {
    if (conection) {
        return conection;
    }
    let client;
    try {
        client = await MongoClient.connect(mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        conection = client.db(DB_NAME);
    } catch (error) {
        console.error('Could not connect to DB 😪', mongoUrl , error);
        process.exit(1);
    }
    return conection;
}

module.exports = connectDB;
```

### Integrando una base de datos

Conectamos nuestra DB con MongoDB Atlas e insertamos información:

```javascript
db.getCollection('courses').find(
    {
        title: 'My title',
        teacher: 'My teacher',
        description: 'My description',
        topic: 'Programming',
    },
    {
        title: 'My title 2',
        teacher: 'My teacher 2',
        description: 'My description 2',
        topic: 'Programming 2',
    },
    {
        title: 'My title 3',
        teacher: 'My teacher 3',
        description: 'My description 3',
        topic: 'Programming 3',
    }
)```

URL correcto en Node.js:

```javascript
const { MongoClient } = require('mongodb');

const {
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    DB_HOST,
} = process.env;

const mongoUrl = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`;
```

### Mutations e Inputs

Las mutations sirven para insertar información.

Insertamos en schema.graphql:

```grapqhl
input CourseInput {
    title: String!
    teacher: String
    description: String!
    topic: String
}

type Mutation {
    "Crea un curso"
    createCourse(input: CourseInput!): Course
}

```

Creamos 'lib/mutations.js':

```javascript
const connectDb = require('./db')

module.exports = {
    createCourse: async (root, { input }) => {
        const defaults = {
            teacher: '',
            topic: '',
        }
        const newCourse = Object.assign(defaults, input)
        let db
        let course
        try {
            db = await connectDb()
            course = await db.collection('courses').insertOne(newCourse)
            newCourse._id = course.insertedId
        } catch (error) {
            console.error(error)
        }
        return newCourse
    }
}
```

Creamos 'lib/queries.js':

```javascript
const connectDb = require('./db')
const { ObjectId } = require('mongodb')

module.exports = {
    getCourses: async () => {
        let db
        let courses = []
        try {
            db = await connectDb()
            courses = await db.collection('courses').find().toArray() //*Devuelve todos los cursos
        } catch (error) {
            console.console.error(error);
        }
        return courses
    },
    getCourse: async (root, { id }) => {
        let db
        let course
        try {
            db = await connectDb()
            course = await db.collection('courses').findOne({ _id: ObjectId(id) })
        } catch (error) {
            console.console.error(error);
        }
        return course
    }
}
```

Modificamos resolvers.js:

```javascript
const queries = require('./queries')
const mutations = require('./mutations')

module.exports = {
    Query: queries,
    Mutation: mutations
}

```

Y si hacemos por ejemplo:

```grapqhl
mutation {
  createCourse(input: {
    title: "Curso #4"
    description: "Descripción 4"
    topic: "Diseño"
  }) {
    _id
    title
    description
  }
}
```

Obtendremos de regreso la información que creamos:

```json
{
  "data": {
    "createCourse": {
      "_id": "61679d9674f13179ec79bbc4",
      "title": "Curso #4",
      "description": "Descripción 4"
    }
  }
}
```
