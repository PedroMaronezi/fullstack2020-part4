const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const _ = require('lodash')
const bcrypt = require('bcrypt')

const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()

    const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
})

describe('GET requests to /api/blogs', () => {
    test('Blogs are returned as JSON', async () => {
        await api
          .get('/api/blogs')
          .expect(200)
          .expect('Content-Type', /application\/json/)
      })

    test(`There are ${helper.initialBlogs.length} blogs`, async () => {
        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })

    test('Verify the existence of the property id', async () => {
        const response = await api.get('/api/blogs')
        const blogs = response.body
        blogs.forEach(blog => {
            expect(blog.id).toBeDefined()
        })
    })
})

describe('POST requests to /api/blogs', () => {
    test('Adding a new blog', async () => {
        const userCredential = {
            username: "root",
            password: "sekret"
        }

        const userLogin = await api.post('/api/login').send(userCredential)
        const userInfo = JSON.parse(userLogin.text)

        const newBlog = {
            title: 'adding a new blog to the database',
            author: 'Tester',
            url: 'www.test.com',
            like: 0
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .set('Authorization', `Bearer ${userInfo.token}`)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const response = await api.get('/api/blogs')
        const titles = response.body.map(r => r.title)
        expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
        expect(titles).toContain('adding a new blog to the database')

        const i = _.findIndex(response.body, (blog) => blog.title === newBlog.title)
        expect(response.body[i].user.username).toBe(userCredential.username)
    })

    test('Adding a new blog with the likes property missing', async () => {
        const userCredential = {
            username: "root",
            password: "sekret"
        }

        const userLogin = await api.post('/api/login').send(userCredential)
        const userInfo = JSON.parse(userLogin.text)

        const newBlog = {
            title: 'blog without likes',
            author: 'Tester',
            url: 'www.testnolikes.com'
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .set('Authorization', `Bearer ${userInfo.token}`)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const response = await api.get('/api/blogs')
        const i = _.findIndex(response.body, (blog) => blog.title === newBlog.title)
        expect(response.body[i].likes).toBe(0)
        expect(response.body[i].user.username).toBe(userCredential.username)
    })

    test('Add a new blog without title and url', async () => {
        const userCredential = {
            username: "root",
            password: "sekret"
        }

        const userLogin = await api.post('/api/login').send(userCredential)
        const userInfo = JSON.parse(userLogin.text)

        const newBlog = {
            author: 'Tester NoTtileUrl',
            likes: 10
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .set('Authorization', `Bearer ${userInfo.token}`)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })

    test('If a token is not provided, the blog is not added', async () => {
        const userCredential = {
            username: "root",
            password: "sekret"
        }
        const userLogin = await api.post('/api/login').send(userCredential)
        const userInfo = JSON.parse(userLogin.text)

        const newBlog = {
            title: 'New blog',
            author: 'New author',
            url: 'www.newblog.com',
            likes: 18
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401)

        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })    
})

describe('DELETE requests', () => {
    test('Delete an existing blog', async () => {
        //let response = await api.get('/api/blogs')
        //const blogToDelete = response.body[0]

        const userCredential = {
            username: "root",
            password: "sekret"
        }

        const userLogin = await api.post('/api/login').send(userCredential)
        const userInfo = JSON.parse(userLogin.text)

        let blogToDelete = {
            title: 'blog to be deleted',
            author: 'Deleter',
            url: 'www.delete.com',
            like: 0
        }

        await api
            .post('/api/blogs/')
            .send(blogToDelete)
            .set('Authorization', `Bearer ${userInfo.token}`)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        let response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
        const i = _.findIndex(response.body, (blog) => blog.title === blogToDelete.title)
        blogToDelete = response.body[i]

        await api 
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', `Bearer ${userInfo.token}`)
            .expect(204)

        response = await helper.blogsInDb()
        expect(response).toHaveLength(helper.initialBlogs.length)

        const titles = response.map(blog => blog.title)
        expect(titles).not.toContain(blogToDelete.title)
    })
})

describe('UPDATE requests', () => {
    test('Update likes of an existing blog', async () => {
        let response = await helper.blogsInDb()
        const blogToUpdate = response[0]
        const newLikes = 100

        const updatedBlog = {...blogToUpdate, likes: newLikes}

        await api
            .put(`/api/blogs/${updatedBlog.id}`)
            .send(updatedBlog)
            .expect(200)

        response = await helper.blogsInDb()
        expect(response).toHaveLength(helper.initialBlogs.length)
        expect(response[0].likes).toBe(newLikes)
    })

    test('Fails updating an existing blog without title and url', async () => {
        let response = await helper.blogsInDb()
        const blogToUpdate = response[0]
        const newLikes = 100
        const updatedBlog = {
            author: blogToUpdate.author,
            likes: newLikes
        }

        await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(updatedBlog)
            .expect(400)
        
        response = await helper.blogsInDb()
        expect(response).toHaveLength(helper.initialBlogs.length)
        expect(response[0]).toEqual(blogToUpdate)
    })
})

afterAll(() => {
  mongoose.connection.close()
})