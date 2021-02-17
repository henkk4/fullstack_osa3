    const express = require('express')
    const morgan = require('morgan')
    const cors = require('cors')

    const app = express()

    app.use(cors())
    app.use(express.json()) 
    app.use(express.static('build'))

    morgan.token('postBody', function (req, res) {
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

    let persons = [
      {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
      },
      {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
      },
      {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
      },
      {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
      }
    ]
    
    app.get('/api/persons', (req, res) => {
      res.json(persons)
    })

    app.get('/api/persons/:id', (request, response) => {
        const id = Number(request.params.id)
        const person = persons.find(person => person.id === id)
        
        if (person) {
          response.json(person)
        } else {
          response.status(404).end()
        }
      })

    const generateId = () => {
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
    }

    app.post('/api/persons', (request, response) => {
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
        if (!nameIsUnique(body.name)) {
            return response.status(400).json({ 
              error: 'name must be unique' 
            })
        }

        const person = {
          name: body.name,
          number: body.number,
          id: generateId(),
        }
      
        persons = persons.concat(person)
      
        response.json(person)
      })

      app.delete('/api/persons/:id', (request, response) => {
        const id = Number(request.params.id)
        persons = persons.filter(person => person.id !== id)
      
        response.status(204).end()
      })  

    app.get('/info', (req, res) => {
        let info = `<p>phonebook has info for ${persons.length} persons<p>
                    <p>${new Date()}<p>`
        res.send(info)
      })
    
    const PORT = process.env.PORT || 3001
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })