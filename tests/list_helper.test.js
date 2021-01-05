const listHelper = require('../utils/list_helper')

const listWithOneBlog = [
    {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
    }
]

const preMadeBlogsList = [ 
    { 
        _id: "5a422a851b54a676234d17f7", 
        title: "React patterns", 
        author: "Michael Chan", 
        url: "https://reactpatterns.com/", 
        likes: 7,
         __v: 0 
    }, 
    { 
        _id: "5a422aa71b54a676234d17f8", 
        title: "Go To Statement Considered Harmful", 
        author: "Edsger W. Dijkstra", 
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html", 
        likes: 5, 
        __v: 0 
    }, 
    { 
        _id: "5a422b3a1b54a676234d17f9", 
        title: "Canonical string reduction", 
        author: "Edsger W. Dijkstra", 
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html", 
        likes: 12, 
        __v: 0 
    }, 
    { 
        _id: "5a422b891b54a676234d17fa", 
        title: "First class tests", 
        author: "Robert C. Martin", 
        url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll", 
        likes: 10, 
        __v: 0 
    }, 
    { 
        _id: "5a422ba71b54a676234d17fb", 
        title: "TDD harms architecture", 
        author: "Robert C. Martin", 
        url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html", 
        likes: 0, 
        __v: 0 
    }, 
    { 
        _id: "5a422bc61b54a676234d17fc", 
        title: "Type wars", 
        author: "Robert C. Martin", 
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html", 
        likes: 2, 
        __v: 0 
    }
]

const listWithMultipleBlogs = [
    {
        title: "Blog A",
        author: "Author A",
        url: "www.blogA.com",
        likes: 10,
        id: "5ff48184b7744a442801a14f"
    },
    {
        title: "Blog B",
        author: "Author B",
        url: "www.blogB.com",
        likes: 20,
        id: "5ff48194b7744a442801a150"
    },
    {
        title: "Blog C",
        author: "Author C",
        url: "www.blogC.com",
        likes: 30,
        id: "5ff481a0b7744a442801a151"
    }
]

const emptyBlogList = []

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

describe('total likes', () => {

    test('when list has only one blog, equals the likes of that', () => {
        const result = listHelper.totalLikes(listWithOneBlog)
        expect(result).toBe(5)
    })

    test('when list has several pre made blogs', () => {
        const result = listHelper.totalLikes(preMadeBlogsList)
        expect(result).toBe(36)
    })

    test('db list with multiple blogs', () => {
        const result = listHelper.totalLikes(listWithMultipleBlogs)
        expect(result).toBe(60)
    })

    test('empty list', () => {
        const result = listHelper.totalLikes(emptyBlogList)
        expect(result).toBe(0)
    })
})

describe('favorite blog', () => {
    const moreThanOneFavorite = [
        {
            title: "Blog A",
            author: "Author A",
            url: "www.blogA.com",
            likes: 10,
            id: "5ff48184b7744a442801a14f"
        },
        {
            title: "Blog B",
            author: "Author B",
            url: "www.blogB.com",
            likes: 20,
            id: "5ff48194b7744a442801a150"
        },
        {
            title: "Blog C",
            author: "Author C",
            url: "www.blogC.com",
            likes: 20,
            id: "5ff481a0b7744a442801a151"
        }
    ]

    test('when list has only one blog', () => {
        const result = listHelper.favoriteBlog(listWithOneBlog)
        const answer = {
            title: 'Go To Statement Considered Harmful',
            author: 'Edsger W. Dijkstra',
            likes: 5
        }
        expect(result).toEqual(answer)
    })

    test('when list has several pre made blogs', () => {
        const result = listHelper.favoriteBlog(preMadeBlogsList)
        const answer = {
            title: "Canonical string reduction",
            author: "Edsger W. Dijkstra",
            likes: 12
        }
        expect(result).toEqual(answer)
    })

    test('db list with multiple blogs', () => {
        const result = listHelper.favoriteBlog(listWithMultipleBlogs)
        const answer = {
            title: "Blog C",
            author: "Author C",
            likes: 30,
        }
        expect(result).toEqual(answer)
    })

    test('empty list', () => {
        const result = listHelper.favoriteBlog(emptyBlogList)
        expect(result).toBe(null)
    })

    test('more than one favorite', () => {
        const result = listHelper.favoriteBlog(moreThanOneFavorite)
        const answer = {
            title: "Blog B",
            author: "Author B",
            likes: 20,
        }
        expect(result).toEqual(answer)
    })
})

describe('most blogs', () => {
    test('when list has only one blog', () => {
        const result = listHelper.mostBlogs(listWithOneBlog)
        const answer = {
            author: 'Edsger W. Dijkstra',
            blogs: 1
        }
        expect(result).toEqual(answer)
    })

    test('when list has several pre made blogs', () => {
        const result = listHelper.mostBlogs(preMadeBlogsList)
        const answer = {
            author: "Robert C. Martin",
            blogs: 3
        }
        expect(result).toEqual(answer)
    })

    test('db list with multiple blogs', () => {
        const result = listHelper.mostBlogs(listWithMultipleBlogs)
        const answer = {
            author: "Author A",
            blogs: 1,
        }
        expect(result).toEqual(answer)
    })

    test('empty list', () => {
        const result = listHelper.mostBlogs(emptyBlogList)
        expect(result).toBe(null)
    })
})

describe('most likes', () => {
    test('when list has only one blog', () => {
        const result = listHelper.mostLikes(listWithOneBlog)
        const answer = {
            author: 'Edsger W. Dijkstra',
            likes: 5
        }
        expect(result).toEqual(answer)
    })

    test('when list has several pre made blogs', () => {
        const result = listHelper.mostLikes(preMadeBlogsList)
        const answer = {
            author: 'Edsger W. Dijkstra',
            likes: 17
        }
        expect(result).toEqual(answer)
    })

    test('db list with multiple blogs', () => {
        const result = listHelper.mostLikes(listWithMultipleBlogs)
        const answer = {
            author: "Author C",
            likes: 30,
        }
        expect(result).toEqual(answer)
    })

    test('empty list', () => {
        const result = listHelper.mostLikes(emptyBlogList)
        expect(result).toBe(null)
    })
})