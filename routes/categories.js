const express = require('express');
const router = express.Router();
const Category = require('../models/category');

// Reusable function to check whether user is authenticated
function IsLoggedIn(req, res, next){
    if (req.isAuthenticated()){
        return next();  // continue processing request
    }
    res.redirect("/login");
}

// Reusable function to check whether the logged-in user is admin (REDACTED)
function IsAdminLoggedIn(req, res, next){
    if (req.isAuthenticated() && req.user.username === REDACTED){
        return next();  // continue processing request
    }
    res.redirect("/login");
}

// GET handlers for /categories/
router.get('/', (req, res, next) => {
    Category.find()
    .then((categories) => {

        res.render("categories/index", {
            title: "Available categories",
            dataset: categories, 
            user: req.user
        });
    })
    .catch((err) => {
            console.log(err);
            res.send("An error occured");
    });
});

// GET handler for /categories/add
router.get('/add', IsAdminLoggedIn, (req, res, next) => {
    res.render('categories/add', {title: 'Add a new Category', user: req.user}); 
});

// POST handler for /categories/add
router.post('/add', IsAdminLoggedIn, (req, res, next) => {

    const newCategory = {
        name: req.body.name
    };

    Category.create(newCategory)
    .then(() => {
        res.redirect('/categories');
    })
    .catch((err) => {
        console.log(err);
        res.send("An error occurred while creating the category.");
    })
    
});

// export the router object
module.exports = router;