const express = require("express");
const router = express.Router();

// #1 import in the Product model
const {Product, Category} = require('../models')

// import in the Forms
const { bootstrapField, createProductForm } = require('../forms');

router.get('/', async (req,res)=>{
    // #2 - fetch all the products (ie, SELECT * from products)
    // The withRelated key allows us to specify the name of the relationship on the model to load. In this case, we want to load the category relationship.
    //The name of the relationship is the name of the function that returns a relationship in the model.
    let products = await Product.collection().fetch({
        withRelated:['category']
    });
    // console.log(products)
    res.render('products/index', {
        'posters': products.toJSON() // #3 - convert collection to JSON
    })
})

module.exports = router;

router.get('/create', async (req, res) => {
    const allCategories = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')]
    });

    

    const productForm = createProductForm(allCategories);
    res.render('products/create',{
        'form': productForm.toHTML(bootstrapField)
    })
})

router.post('/create', async(req,res)=>{
    const productForm = createProductForm();
    productForm.handle(req, {
        'success': async (form) => {
            const product = new Product();
            product.set('title',form.data.title);
            product.set('height', form.data.height);
            product.set('width', form.data.width);
            product.set('cost', form.data.cost);
            product.set('description', form.data.description);
            product.set('stock', form.data.stock);
            product.set('date', form.data.date);
            product.set('category_id', form.data.category_id);
            await product.save();
            res.redirect('/products');
        },
        'error': async (form) => {
            res.render('products/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:product_id/update', async (req, res) => {
    // fetch all the categories
    const allCategories = await Category.fetchAll().map((category)=>{
        return [category.get('id'), category.get('name')];
    })

    // retrieve the product
    const productId = req.params.product_id
    const product = await Product.where({
        'id': productId
    }).fetch({
        required: true
    });

    
    const productForm = createProductForm(allCategories);

    // fill in the existing values
    productForm.fields.title.value=product.get('title');
    productForm.fields.height.value = product.get('height');
    productForm.fields.width.value=product.get('width');
    productForm.fields.cost.value = product.get('cost');
    productForm.fields.description.value = product.get('description');
    productForm.fields.stock.value=product.get('stock');
    productForm.fields.date.value=product.get('date');
    productForm.fields.category_id.value = product.get('category_id');

    res.render('products/update', {
        'form': productForm.toHTML(bootstrapField),
        'product': product.toJSON()
    })

})

router.post('/:product_id/update', async (req, res) => {

    // fetch the product that we want to update
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        required: true
    });

    const productForm = createProductForm();
    productForm.handle(req, {
        'success': async (form) => {
            const product = new Product();
            product.set('title',form.data.title);
            product.set('height', form.data.height);
            product.set('width', form.data.width);
            product.set('cost', form.data.cost);
            product.set('description', form.data.description);
            product.set('stock', form.data.stock);
            product.set('date', form.data.date);
            product.set('category_id', form.data.category_id);
    

            await product.save();
            res.redirect('/products');
        },
        'error': async (form) => {
            res.render('products/update', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })

})

router.get('/:product_id/delete', async (req,res)=>{
    const product=await Product.where({
        'id':req.params.product_id
    }).fetch({
        required:true
    });
    res.render('products/delete',{
        'product':product
    })
})

router.post('/:product_id/delete', async(req,res)=>{
    // fetch the product that we want to delete
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        required: true
    });
    await product.destroy();
    res.redirect('/products')
})




