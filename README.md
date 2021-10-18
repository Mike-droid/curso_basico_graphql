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

```graphql
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

```graphql
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

### Repaso - Creando el tipo Estudiante

Agregamos al schema.graphql:

```graphql
type Course {
    _id: ID!
    title: String!
    teacher: String
    description: String!
    topic: String
}

type Student {
    _id: ID!
    name: String!
    email: String!
}

type Query {
    "Devuelve todos los cursos"
    getCourses: [Course]
    "Devuelve un curso"
    getCourse(id: ID!): Course
    "Devuelve todos los estudiantes"
    getStudents: [Student]
    "Devuelve un estudiante"
    getStudent(id: ID!): Student
}

input CourseInput {
    title: String!
    teacher: String
    description: String!
    topic: String
}

input CourseEditInput {
    title: String
    teacher: String
    description: String
    topic: String
}

input StudentInput {
    name: String!
    email: String!
}

input StudentEditInput {
    name: String
    email: String
}

type Mutation {
    "Crea un curso"
    createCourse(input: CourseInput!): Course
    "Edita un curso"
    editCourse(_id: ID!, input: CourseEditInput): Course
    "Elimina un curso"
    deleteCourse(_id: ID!): String
    "Crea un estudiante"
    createStudent(input: StudentInput!): Student
    "Edita un estudiante"
    editStudent(_id: ID!, input: StudentEditInput): Student
    "Elimina un estudiante"
    deleteStudent(_id: ID!): String
}

```

Modificamos queries.js:

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
    },
    getStudents: async () => {
        let db
        let students = []
        try {
            db = await connectDb()
            students = await db.collection('students').find().toArray() //*Devuelve todos los cursos
        } catch (error) {
            console.console.error(error);
        }
        return students
    },
    getStudent: async (root, { id }) => {
        let db
        let student
        try {
            db = await connectDb()
            student = await db.collection('students').findOne({ _id: ObjectId(id) })
        } catch (error) {
            console.console.error(error);
        }
        return Student
    }
}
```

Modificamos mutations.js:

```javascript
const connectDb = require('./db')
const { ObjectId } = require('mongodb')

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
    },
    createStudent: async (root, { input }) => {
        let db
        let student
        try {
            db = await connectDb()
            student = await db.collection('students').insertOne(input)
            input._id = student.insertedId
        } catch (error) {
            console.error(error)
        }
        return input
    },
    editCourse: async (root, { _id, input }) => {
        let db
        let course
        try {
            db = await connectDb()
            await db.collection('courses').updateOne({ _id: ObjectId(_id) }, { $set: input })
            course = await db.collection('courses').findOne({ _id: ObjectId(_id) })
        } catch (error) {
            console.error(error)
        }
        return course
    },
    editStudent: async (root, { _id, input }) => {
        let db
        let student
        try {
            db = await connectDb()
            await db.collection('students').updateOne({ _id: ObjectId(_id) }, { $set: input })
            student = await db.collection('students').findOne({ _id: ObjectId(_id) })
        } catch (error) {
            console.error(error)
        }
        return student
    },
    deleteCourse: async (root, { _id }) => {
        let db
        let course
        try {
            db = await connectDb()
            course = await db.collection('courses').findOne({ _id: ObjectId(_id) })
            await db.collection('courses').deleteOne({ _id: ObjectId(_id) })
        } catch (error) {
            console.error(error)
        }
        return `Curso ${_id} eliminado correctamente`
    },
    deleteStudent: async (root, { _id }) => {
        let db
        let student
        try {
            db = await connectDb()
            student = await db.collection('students').findOne({ _id: ObjectId(_id) })
            await db.collection('students').deleteOne({ _id: ObjectId(_id) })
        } catch (error) {
            console.error(error)
        }
        return `Estudiante ${_id} eliminado correctamente`
    }
}

```

### Nested Types

Modificamos el schema:

```graphql
type Course {
    _id: ID!
    title: String!
    teacher: String
    description: String!
    topic: String
    people: [Student]
}

type Mutation {
    "Agrega una persona a un curso"
    addPeople(courseID: ID!, personID: ID!): Course
}
```

Añadimos la función a mutations.js:

```javascript
addPeople: async (root, { courseID, personID }) => {
    let db
    let person
    let course
    try {
        db = await connectDb()
        course = await db.collection('courses').findOne({ _id: ObjectId(courseID) })
        person = await db.collection('students').findOne({ _id: ObjectId(personID) })
        if (!course || !person) {
            throw new Error('La persona o el curso no existe')
        }
        await db.collection('courses').updateOne({ _id: ObjectId(courseID) }, { $addToSet: {people: personID } })
    } catch (error) {
        console.error(error)
    }
    return course
    }
```

Y ahora podemos insertar IDs de estudiantes a los cursos:

```graphql
mutation {
  addPeople(courseID:"61679d9674f13179ec79bbc4", personID:"6167a46f1479b7347a98b23c"){
    _id
    title
  }
}
```

### Resolver de tipos

Creamos el archivo types.js:

```javascript
const connectDb = require('./db')
const { ObjectId } = require('mongodb')

module.exports = {
    Course: {
        people: async ({ people }) => {
            let db
            let peopleData
            let ids
            try {
                db = await connectDb()
                ids = people ? people.map(id => ObjectId(id)) : []
                peopleData = ids.length > 0 ? await db.collection('students').find({ _id: { $in: ids } }).toArray() : []
            } catch (error) {
                console.error(error)
            }
            return peopleData
        }
    }
}
```

Y modificamos resolvers.js:

```javascript
const queries = require('./queries')
const mutations = require('./mutations')
const types = require('./types')

module.exports = {
    Query: queries,
    Mutation: mutations,
    ...types
}

```

Ahora podemos hacer consultas más complejas que nos regresen resultados más interesantes, por ejemplo:

```graphql
query {
  getCourses{
    _id
    title
    teacher
    description
    topic
    people{
      _id
      name
      email
    }
  }
}
```

En mi caso me regresó:

```json
{
  "data": {
    "getCourses": [
      {
        "_id": "61664f8ded307fc554c71901",
        "title": "My title 3",
        "teacher": "My teacher 3",
        "description": "My description 3",
        "topic": "Programming",
        "people": []
      },
      {
        "_id": "61664f8ded307fc554c718ff",
        "title": "New cool title",
        "teacher": "My teacher",
        "description": "My description",
        "topic": "Programming",
        "people": []
      },
      {
        "_id": "61679d9674f13179ec79bbc4",
        "title": "Curso #4",
        "teacher": "",
        "description": "Descripción 4",
        "topic": "Diseño",
        "people": [
          {
            "_id": "6167a46f1479b7347a98b23c",
            "name": "Miguel Reyes",
            "email": "miguel.reyes@gmail.com"
          }
        ]
      }
    ]
  }
}
```

### Errores

Las inconsistencias en los esquemas son errores que debemos de tener cuidado de evitar. Nos impideran manejar la información de manera correcta.

*NO es buena practica* devolverle errores técnicos a los usuarios. Tienen que ser errores amigables 🦄.

Creamos 'lib/errorHandler.js':

```javascript
function errorHandler (error) {
    console.log(error)
    throw new Error('Fallo en la operación del servidor');
}

module.exports = errorHandler;
```

Y los usamos en todos los archivos donde usábamos `console.error(error)`

`const errorHandler = require('./errorHandler')`

## Conceptos avanzados

### Alias y fragments

En GraphQL Podemos hacer varias consultas al mismo tiempo, por ejemplo:

```graphql
query{
  AllCourses: getCourses{
    _id
    title
  }
  Course1: getCourse(id:"61664f8ded307fc554c718ff"){
    _id
    title
    description
  }
  Course2: getCourse(id:"61664f8ded307fc554c71901"){
    teacher
    description
  }
}
```

Con los fragments podemos crear queries que mandamos a llamar y así simplificamos el código de las mismas, por ejemplo:

```graphql
query {
  AllCourses: getCourses{
    ...CourseFields
  }
}

fragment CourseFields on Course {
  _id
  title
  description
  people {
    _id
    name
  }
}
```

### Variables

Podemos usar variables que harán a nuestras consultas más realistas y escalables:

```graphql
mutation AddPersonToCourse($course: ID!, $person: ID!){
  addPeople(courseID: $course, personID: $person){
    _id
    title
  }
}
```

Las variables las debemos pasar como un JSON:

```json
{
  "course": "61664f8ded307fc554c71901",
  "person": "6168f16a995ad2d4ee462d88"
}
```

Otro ejemplo:

```graphql
query GetCourse($course: ID!) {
  getCourse(id: $course) {
    _id
    title
    people {
      _id
      name
    }
  }
}

```

Y el valor de la variable:

```json
{
  "course": "61664f8ded307fc554c71901"
}
```

### Enums

Podemos crear nuestros propios tipos de datos, por ejemplo:

```graphql
"Valida los tipos de nivel"
enum Level {
    principiante
    intermedio
    avanzado
}

type Course {
    _id: ID!
    title: String!
    teacher: String
    description: String!
    topic: String
    people: [Student]
    level: Level
}

input CourseInput {
    title: String!
    teacher: String
    description: String!
    topic: String
    level: Level
}
```

Y después podemos hacer algo como:

```graphql
mutation CreateNewCourse($input: CourseInput!) {
  createCourse(input: $input){
    _id
    title
  }
}
```

Y las variables:

```json
{
  "input": {
    "title": "Curso de Marketing",
    "teacher": "Ximena Ruíz",
    "description": "Curso para hacer los mejores browniies y venderlos",
    "topic": "Digital Marketing",
    "level": "intermedio"
  }
}
```

### Interfaces - Tipo Monitor

Editamos el schema para los monitores:

```graphql
"Valida los tipos de nivel"
enum Level {
    principiante
    intermedio
    avanzado
}

type Course {
    _id: ID!
    title: String!
    teacher: String
    description: String!
    topic: String
    people: [Student]
    level: Level
}

interface Person {
    _id: ID!
    name: String!
    email: String!
}

type Student implements Person {
    _id: ID!
    name: String!
    email: String!
    avatar: String
}

type Monitor implements Person {
    _id: ID!
    name: String!
    email: String!
    phone: String
}

type Query {
    "Devuelve todos los cursos"
    getCourses: [Course]
    "Devuelve un curso"
    getCourse(id: ID!): Course
    "Devuelve todos los estudiantes"
    getPeople: [Person]
    "Devuelve un estudiante"
    getPerson(id: ID!): Person
}

input CourseInput {
    title: String!
    teacher: String
    description: String!
    topic: String
    level: Level
}

input CourseEditInput {
    title: String
    teacher: String
    description: String
    topic: String
}

input PersonInput {
    name: String!
    email: String!
    phone: String
    avatar: String
}

input PersonEditInput {
    name: String
    email: String
    phone: String
    avatar: String
}

type Mutation {
    "Crea un curso"
    createCourse(input: CourseInput!): Course
    "Edita un curso"
    editCourse(_id: ID!, input: CourseEditInput): Course
    "Elimina un curso"
    deleteCourse(_id: ID!): String
    "Crea una persona"
    createPerson(input: PersonInput!): Person
    "Edita una persona"
    editPerson(_id: ID!, input: PersonEditInput): Person
    "Elimina un estudiante"
    deleteStudent(_id: ID!): String
    "Agrega una persona a un curso"
    addPeople(courseID: ID!, personID: ID!): Course
}

```

Agregamos Person a los types:

```javascript
Person : {
    __resolveType: (person, context, info) => {
        if (person.phone) {
            return 'Monitor'
        }
        return 'Student'
    }
}
```

Y podemos hacer cosas como:

```graphql
mutation createNewMonitor($monitorInput: PersonInput!){
  createPerson(input: $monitorInput) {
    _id
    name
  }
}
```

Usando variables:

```json
{
  "monitorInput": {
    "name": "Monitor 1",
    "email": "monitor1@gmail",
    "phone": "1234567890"
  }
}
```

### Directivas

Podemos agregar valores booleanos a nuestras queries lo cual hace que esto sea más interesante y complejo:

```graphql
query getPeopleData($monitor: Boolean!){
  getPeople{
    _id
    name
    email
    ... on Monitor @include(if: $monitor) {
      phone
    }
  }
}
```

Si usamos la variable:

```json
{
  "monitor": true
}
```

Obtendremos un resultado como este:

```json
{
  "data": {
    "getPeople": [
      {
        "_id": "616a29af02eacddc155c993f",
        "name": "Monitor 1",
        "email": "monitor1@gmail",
        "phone": "1234567890"
      }
    ]
  }
}
```

Sin embargo, con la variable en false:

```json
{
  "monitor": false
}
```

```json
{
  "data": {
    "getPeople": [
      {
        "_id": "616a29af02eacddc155c993f",
        "name": "Monitor 1",
        "email": "monitor1@gmail"
      }
    ]
  }
}
```

Nuestro resultado no contiene el campo phone porque el valor es false.

También podemos agregar una directiva al schema, por ejemlplo `@deprecated`. Esta sirve para indicar que este campo ya *NO* estará en uso, incluso el mismo GraphQL te lo dice cuando ustas un campo con esta directiva.

### Unions

Unions permite hacer lo mismo que interfaces pero de una manera más extrema.

Agregamos una union a nuestro schema:

```graphql
union GlobalSearch = Course | Student | Monitor

type Query {
    "Devuelve todos los cursos"
    getCourses: [Course]
    "Devuelve un curso"
    getCourse(id: ID!): Course
    "Devuelve todos los estudiantes"
    getPeople: [Person]
    "Devuelve un estudiante"
    getPerson(id: ID!): Person
    "Ejecuta una búsqueda global"
    searchItems(keyword: String!): [GlobalSearch]
}
```

Agregamos en types.js:

```javascript
GlobalSearch: {
    __resolveType: (item, context, info) => {
        if (item.title){
            return 'Course'
        }
        if (item.phone) {
            return 'Monitor'
        }
        return 'Student'
    }
}
```

Agregamos en queries.js:

```javascript
searchItems: async (root, { keyword }) => {
    let db
    let items
    let courses
    let people
    try {
        db = await connectDb()
        courses = await db.collection('courses').find({ $text: { $search: keyword } }).toArray()
        people = await db.collection('students').find({ $text: { $search: keyword } }).toArray()
        items = [...courses, ...people]
    } catch (error) {
        errorHandler(error);
    }
    return items
}
```

Antes de continuar, debemos crear índices en MongoDB:

`db.courses.createIndex({ "$**": "text" })` & `db.students.createIndex({ "$**": "text" })`

Y ahora podemos hacer por ejemplo esta querie:

```graphql
{
    searchItems(keyword: "programming") {
    __typename
    ... on Course {
          title
          description
          topic
        }
    ... on Monitor {
          name
          phone
        }
    ... on Student {
          name
          email
        }
    }
}
```

Y como el keyword que (al menos yo escogí) es 'programming', regresa un resultado:

```json
{
  "data": {
    "searchItems": [
      {
        "__typename": "Course",
        "title": "New cool title",
        "description": "My description",
        "topic": "Programming"
      },
      {
        "__typename": "Course",
        "title": "My title 3",
        "description": "My description 3",
        "topic": "Programming"
      }
    ]
  }
}
```

## Consumiendo el API

### Preparando API para producción

Debemos hacer `npm i cors` para que nuestra API pueda ser consumida desde cualquier lado.

Para hacer que esté listo nuestro entorno en producción hacemos lo siguiente:

En index.js:

```javascript
const cors = require("cors");

const isDev = process.env.NODE_ENV.trimRight() !== "production"
//* Hacemos trimRight porque el NODE_ENV viene con un espacio al final, en package.json

app.use(cors());

app.use('/api', graphqlHTTP({
    schema,
    rootValue: resolvers,
    graphiql: isDev
}));

```

En el package.json:

```json
{
    "scripts": {
        "start": "SET NODE_ENV=production & node index"
    }
}
```

### HTTP requests

Desde VS Code podemos hacer estas peticiones con la extensión ThunderClient.

### Clientes de GraphQL

El cliente más usado es [Apollo](https://www.apollographql.com/). [Apollo en NPM](https://www.npmjs.com/package/apollo-client).

### Consumiendo el API desde un frontend simple
