const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const _ = require('lodash')

const bcrypt = require('bcrypt')
const User = require('../models/user')



describe('When there is initially one user in db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })

    test('Users are returned as JSON', async () => {
        await api
            .get('/api/users')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('Fetch all users in database', async () => {
        const response = await api.get('/api/users')
        expect(response.body).toHaveLength(1)
    })

    test('Creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'mluukkai',
            name: 'Matti Luukkainen',
            password: 'salainen',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })

    test('Creation fails for a user with an existing username', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: usersAtStart[0].username,
            name: 'Tester Man',
            password: 'test',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('Creation fails if username is not defined', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            name: 'Tester Man',
            password: 'test',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)

        const names = usersAtEnd.map(u => u.name)
        expect(names).not.toContain('Tester Man')
    })

    test('Creation fails if username is less than 3 characters long', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'te',
            name: 'Tester Man',
            password: 'test',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).not.toContain(newUser.username)
    })

    test('Creation fails if password is not given', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'tester',
            name: 'Tester Man'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).not.toContain(newUser.username)
    })

    test('Creation fails if password has less than 3 characters', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'tester',
            name: 'Tester Man',
            password: 'ab',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).not.toContain(newUser.username)
    })
})


afterAll(() => {
    mongoose.connection.close()
})