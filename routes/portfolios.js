// Import express and create a router object
const express = require('express');
const { Error } = require('mongoose');
const router = express.Router();
const Portfolio = require('../models/portfolio');
const Category = require('../models/category');
// Import multer to handle file upload
const multer = require('multer');

// Configure multer for file upload
const storage = multer.memoryStorage(); // Store uploaded file in memory as a buffer
const upload = multer({ storage: storage });

// Reusable function to check whether user is authenticated
function IsLoggedIn(req, res, next){
    if (req.isAuthenticated()){
        return next();  // continue processing request
    }
    res.redirect("/login");
}

// Reusable function to check whether the user is the author to edit/ delete his portfolio
function IsAuthor(req, res, next){
    const portfolioId = req.params._id;

    Portfolio.findById(portfolioId)
        .then((portfolio) => {
            if (req.isAuthenticated() && req.user.username === portfolio.author) {
                return next(); // continue processing request
            }
            res.redirect("/login");
        })
        .catch((err) => {
            console.log(err);
            res.redirect("/login");
        });
}

// configure the router object
// GET handler for /portfolios/
router.get('/', (req, res, next) => {

    Portfolio.find()
    .then((portfolios) => {

        res.render("portfolios/index", {
            title: "Portfolios hub",
            dataset: portfolios,
            user: req.user
        });
    })
    .catch((err) => {
            console.log(err);
            res.send("An error occured");
    });
});

router.get('/add', IsLoggedIn, (req, res, next) => {

    Category.find().sort({name: 1})
    .then((categories) => {
        res.render("portfolios/add", {title: "Add a New Portfolio", categories: categories, user: req.user});
    })
    .catch((err) => {
        console.log(err)
    })
})

// POST handler for /portfolios/add > this happens when pressed the save button
router.post('/add', IsLoggedIn, upload.single('picture'), (req, res, next) => {
    // Use mongoose Portfolio model to create a new portfolio in db with the info from the form
    // Get the uploaded picture file from the request
    const picture = req.file;

    const newPortfolio = {
        name: req.body.name,
        publishDate: Date.now(),
        category: req.body.category,
        description: req.body.description,
        author: req.user.username, 
        picture: {
            data: picture.buffer,
            contentType: picture.mimetype
        }
    };

    Portfolio.create(newPortfolio)
    .then (() => {
        res.redirect('/portfolios');
    }) 
    .catch((err) => {
            console.log(err);
            res.send("An error occurred while creating the portfolio.");
    })
});

// GET handler for /portfolios/edit/_id
router.get('/edit/:_id', IsLoggedIn, IsAuthor, (req, res, next) => {
    const _id = req.params._id

    Portfolio.findById({_id})
    .then((portfolio) => {

        Category.find().sort({name: 1})
        .then((categories) => {
            res.render('portfolios/edit', {
                title: 'Edit a Portfolio', 
                portfolio: portfolio,
                categories: categories, 
                user: req.user, 
            });
        })
        .catch((err) => {
            console.log(err)
        })
    })
    .catch((err) => {
        console.log(err);
    })
})

// GET handler for /portfolios/delete/_:id
router.get('/delete/:_id', IsLoggedIn, IsAuthor, (req, res, next) => {

    const _id= req.params._id

    Portfolio.deleteOne({_id})
    .then(
        res.redirect('/portfolios')
    )
    .catch((err => {
        console.log(err);
    }))
})

// POST handler for /portfolios/edit/:_id
router.post('/edit/:_id', IsLoggedIn, IsAuthor, upload.single('picture'), (req, res, next) => {

    const _id = req.params._id;

    // Get the uploaded picture file from the request
    const picture = req.file;

    const UpdatedPortfolio = {
        name: req.body.name, 
        publishDate: Date.now(),
        category: req.body.category,
        author: req.user.username, 
        description: req.body.description,
    }

    // Check if picture is available and update the portfolio object accordingly
    if (picture) {
        UpdatedPortfolio.picture = {
            data: picture.buffer,
            contentType: picture.mimetype
        };
    }

    Portfolio.findOneAndUpdate({_id}, UpdatedPortfolio)
    .then(() => {
        res.redirect('/portfolios')
    })
    .catch((err) => {
        console.log(err)
    })
})

// export the router object
module.exports = router;