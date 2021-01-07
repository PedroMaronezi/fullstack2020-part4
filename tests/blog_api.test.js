const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const _ = require('lodash')

const Blog = require('../models/blog')

beforeEach(async () => {
    await Blog.deleteMany({})

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
        const newBlog = {
            title: 'adding a new blog to the database',
            author: 'Tester',
            url: 'www.test.com',
            like: 0
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const response = await api.get('/api/blogs')
        const titles = response.body.map(r => r.title)
        expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
        expect(titles).toContain('adding a new blog to the database')
    })

    test('Adding a new blog with the likes property missing', async () => {
        const newBlog = {
            title: 'blog without likes',
            author: 'Tester',
            url: 'www.testnolikes.com'
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const response = await api.get('/api/blogs')
        const i = _.findIndex(response.body, (blog) => blog.title === newBlog.title)
        expect(response.body[i].likes).toBe(0)
    })
})

afterAll(() => {
  mongoose.connection.close()
})