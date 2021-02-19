const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/person')
    
const app = express()

app.use(cors())
app.use(express.json()) 
app.use(express.static('build'))


morgan.token('postBody', function (req) {
    return JSON.stringify(req.body)
})

app.use(morgan(function (tokens, req, res) {
    if (tokens.method(req, res) === 'POST') {
        return [
            tokens.method(req, res),
            tokens.url(req, res),
            tokens.status(req, res),
            tokens.res(req, res, 'content-length'), '-',
            tokens['response-time'](req, res), 'ms',
            tokens.postBody(req, res)
        ].join(' ')
    }
    else {
        return [
            tokens.method(req, res),
            tokens.url(req, res),
            tokens.status(req, res),
            tokens.res(req, res, 'content-length'), '-',
            tokens['response-time'](req, res), 'ms',
        ].join(' ')
    }
}))
    
// Get all persons
app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
      
})

// Get one person
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            }
            else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

/*const generateId = () => {
        let range = persons.length * 10
        let newId = Math.floor(Math.random() * Math.floor(range))
        const ids = persons.map(person => person.id)
        if (ids.find(oneId => oneId === newId)) {
            newId = generateId()
        }
        return newId
    }
    const nameIsUnique = (name) => {
        let unique = true
        const names = persons.map(person => person.name)
        if (names.find(oneName => oneName === name)) {
            unique = false
        }
        return unique
    }*/

// Add new person
app.post('/api/persons', (request, response, next) => {
    const body = request.body
      
    if (!body.name) {
        return response.status(400).json({ 
            error: 'name is missing' 
        })
    }
    if (!body.number) {
        return response.status(400).json({ 
            error: 'number is missing' 
        })
    }
    /*if (!nameIsUnique(body.name)) {
            return response.status(400).json({ 
              error: 'name must be unique' 
            })
        }*/

    const person = new Person({
        name: body.name,
        number: body.number
    })
      
    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
        .catch(error => next(error))
})

// Change number of person
app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(req.params.id, person, { new: true })
        .then(updatedPerson => {
            res.json(updatedPerson)
        })
        .catch(error => next(error))
})

// Delete person
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(() => {
            response.status(204).end()
        })
        .catch(error => next(error))
})  

// Info
app.get('/info', (req, res, next) => {
    let numberOfPersons = 0
    Person.find({}).then(persons => {
        numberOfPersons = persons.length
        let info = `<p>phonebook has info for ${numberOfPersons} persons<p>
                    <p>${new Date()}<p>`
        res.send(info)
    })
        .catch(error => next(error))
})

////////////////////
const errorHandler = (error, request, response, next) => {
    console.error(error.message)
      
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }
    else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
      
    next(error)
}
app.use(errorHandler)
////////////////////
    
// eslint-disable-next-line no-undef
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})