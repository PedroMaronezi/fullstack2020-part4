const _ = require('lodash');

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => {
        return sum += blog.likes
    }, 0)
}

const favoriteBlog = (blogs) => {
    const favorite = blogs.reduce((favBlog, blog) => {
        if(blog.likes > favBlog.likes) {
            favBlog = {
                title: blog.title,
                author: blog.author,
                likes: blog.likes
            }
        }
        return favBlog
    }, { likes: -1 })

    return favorite.likes !== -1 ? favorite : null
}

const mostBlogs = (blogs) => {
    if (blogs.length === 0) {
        return null
    }

    const authors = blogs.map(blog => blog.author)
    const nbrBlogs = _.countBy(authors)
    const authorBlogs = _.map(nbrBlogs, (value,key) => {
        return {
            author: key,
            blogs: value
        }
    })
    return _.maxBy(authorBlogs, 'blogs')
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs
}