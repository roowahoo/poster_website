const bookshelf = require('../bookshelf')

const Product = bookshelf.model('Product', {
    tableName:'products',
    category(){
        return this.belongsTo('Category')
    },
    tags(){
        return this.belongsToMany('Tag')
    }
});

const Category = bookshelf.model('Category',{
    tableName:'categories',
    products(){
        return this.hasMany('Product')
    }
})

const Tag =bookshelf.model('Tag',{
    tableName:'tags',
    products(){
        return this.belongsToMany('Product')
    }
})

const User=bookshelf.model('User',{
    tableName:'users'
})

const CartItem = bookshelf.model('CartItem',{
    tableName: 'cart_items',
    products(){
        return this.belongsTo('Product')
    },

    users(){
        return this.belongsTo('User')
    }
})


module.exports = { Product,Category,Tag, User,CartItem };