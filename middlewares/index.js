const checkIfAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next()
    } else {
        req.flash("error_messages", "You need to sign in to access this page");
        res.redirect('/users/login');
    }
}

module.exports = {
    checkIfAuthenticated
}

// The next function is provided by Express and we call it when we want Express to move on to the next middleware.
// If there is no more middleware left, then the route will be executed.