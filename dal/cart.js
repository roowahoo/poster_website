const {CartItem} = require('../models')

const getAllItems=async(userId)=>{
    return await CartItem.collection().where({
        'user_id':userId
    }).fetch({
        require:false,
        withRelated:['products','products.category']
    })
}

const getCartItemByUserAndProduct = async (userId, productId) => {
    const cartItem = await CartItem.where({
            'user_id': userId,
            'product_id': productId
        }).fetch({
            require: false,
            withRelated:['products', 'products.category']
        })
    return cartItem;
}

module.exports = {
    getCartItemByUserAndProduct,getAllItems
}