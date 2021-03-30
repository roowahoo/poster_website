const express = require('express');
const router = express.Router();

const CartServices = require('../services/cartServices')
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

router.get('/checkout', async (req, res) => {
    //1. create line items--tell stripe what customer is paying for
    const cartService = new CartServices(req.session.user.id)
    let allCartItems = await cartService.getAll()

    let lineItems = []
    let meta = []
    for (let cartItem of allCartItems) {
        const lineItem = {
            'name': cartItem.related('products').get('title'),
            'amount': cartItem.related('products').get('cost'),
            'quantity': cartItem.get('quantity'),
            'currency': 'SGD'
        }
        if (cartItem.related('products').get('image_url')) {
            lineItem.images = [cartItem.related('products').get('image_url')]
        }
        lineItems.push(lineItem)
        meta.push({
            'product_id': cartItem.get('product_id'),
            'quantity': cartItem.get('quantity')
        })
    }


    //2. using stripe,create payment
    let metaData = JSON.stringify(meta);
    const payment = {
        payment_method_types: ['card'],
        line_items: lineItems,
        success_url: process.env.STRIPE_SUCCESS_URL + '?sessionId={CHECKOUT_SESSION_ID}',
        cancel_url: process.env.STRIPE_ERROR_URL,
        metadata: {
            'orders': metaData
        }
    }
    //3. register payment
    let stripeSession = await Stripe.checkout.sessions.create(payment)
    res.render('checkout/checkout', {
        'sessionId': stripeSession.id, // Get the ID of the session
        'publishableKey': process.env.STRIPE_PUBLISHABLE_KEY
    })
})

module.exports = router;