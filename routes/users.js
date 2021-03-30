const express = require("express");
const router = express.Router();
const crypto = require('crypto')

const getHashedPassword=(password)=>{
    const sha256=crypto.createHash('sha256')
    const hash=sha256.update(password).digest('base64')
    return hash
}

// import in the User model
const { User } = require('../models');

const { createRegistrationForm, bootstrapField, createLoginForm } = require('../forms');

router.get('/register', (req, res) => {
    // display the registration form
    const registerForm = createRegistrationForm();
    res.render('users/register', {
        'form': registerForm.toHTML(bootstrapField)
    })
})

router.post('/register', (req, res) => {
    const registerForm = createRegistrationForm();
    registerForm.handle(req, {
        success: async (form) => {
            let {confirm_password,...userData}=form.data
            userData.password=getHashedPassword(userData.password)
            const newUser=new User(userData)

            // const newUser = new User({
            //     'username': form.data.username,
            //     'password': getHashedPassword(form.data.password),
            //     'email': form.data.email
            // });
            await newUser.save();
            req.flash("success_messages", "User signed up successfully!");
            res.redirect('/users/login')
        },
        'error': (form) => {
            res.render('users/register', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/login', (req, res) => {
    const loginForm = createLoginForm()
    res.render('users/login', {
        'form': loginForm.toHTML(bootstrapField)
    })
})

router.post('/login', async (req, res) => {
    const loginForm = createLoginForm()
    loginForm.handle(req, {
        'success': async (form) => {
            let user = await User.where({
                'email': form.data.email
            }).fetch({
                require:true
            });
            console.log(user)
            if (!user) {
                req.flash('error_messages', 'Sorry, email does not exist')
                res.redirect('/users/login')
            } else {
                if (user.get('password') === getHashedPassword(form.data.password)) {
                    req.session.user = {
                        id: user.get('id'),
                        username: user.get('username'),
                        email: user.get('email')
                    }
                    req.flash('success_messages', 'Welcome Back,' + user.get('username'))
                    res.redirect('/users/profile')
                } else {
                    req.flash('error_messages', 'Sorry, password is invalid')
                    res.redirect('/users/login')
                }
            }
        }, 'error': async (form) => {
            req.flash('error_messages', 'There are problems logging in, please fill in the form again')
            res.render('users/login', {
                'form': loginForm.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/profile',(req,res)=>{
    const user=req.session.user
    if (!user){
        req.flash('error_messages', 'You are not authorized to view this page')
        res.redirect('/users/login')
    }else{
        res.render('users/profile',{
            'user':user
        })
    }
})

router.get('/logout',(req,res)=>{
    req.session.user=null;
    req.flash('success_messages','Goodbye')
    res.redirect('/users/login')
})

module.exports = router;

