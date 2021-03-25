const express = require("express");
const router = express.Router();

// #1 import in the Product model
const {Product, Category, Tag} = require('../models')

// import in the Forms
const { bootstrapField, createProductForm } = require('../forms');

router.get('/', async (req,res)=>{
    // #2 - fetch all the products (ie, SELECT * from products)
    // The withRelated key allows us to specify the name of the relationship on the model to load. In this case, we want to load the category relationship.
    //The name of the relationship is the name of the function that returns a relationship in the model.
    let products = await Product.collection().fetch({
        withRelated:['category','tags']
    });
    console.log(products.toJSON())
    res.render('products/index', {
        'posters': products.toJSON() // #3 - convert collection to JSON
    })
})

module.exports = router;

router.get('/create', async (req, res) => {
    const allCategories = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')]
    });

    const allTags = await Tag.fetchAll().map((tag)=>{
        return[tag.get('id'),tag.get('name')]
    })
    

    const productForm = createProductForm(allCategories,allTags);
    res.render('products/create',{
        'form': productForm.toHTML(bootstrapField),
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESETS
    })
})

router.post('/create', async(req,res)=>{
    const allCategories = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')]
    });

    const allTags = await (await Tag.fetchAll()).map((tag)=>{
        return[tag.get('id'),tag.get('name')]
    })

    const productForm = createProductForm();

    productForm.handle(req, {
        'success': async (form) => {
            let {tags,...productData}=form.data
            const newProduct = new Product();
            newProduct.set(productData)
            // product.set('title',form.data.title);
            // product.set('height', form.data.height);
            // product.set('width', form.data.width);
            // product.set('cost', form.data.cost);
            // product.set('description', form.data.description);
            // product.set('stock', form.data.stock);
            // product.set('date', form.data.date);
            // product.set('category_id', form.data.category_id);
            // product.set('tags',form.data.tags)
            await newProduct.save();
            //check if there are tags selected
            if (tags) {
                await newProduct.tags().attach(tags.split(","))
            }
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

    const allTags=await Tag.fetchAll().map((tag)=>{
        return[tag.get('id'),tag.get('name')]
    })

    // retrieve the product
    const productId = req.params.product_id
    const productToEdit = await Product.where({
        'id': productId
    }).fetch({
        required: true,
        withRelated:['tags']
    });

    // console.log(productToEdit)
    const productJSON = productToEdit.toJSON();
    console.log(productJSON)
    const selectedTagIds = productJSON.tags.map(t => t.id);

    
    const productForm = createProductForm(allCategories,allTags);

    // fill in the existing values
    productForm.fields.title.value=productToEdit.get('title');
    productForm.fields.height.value = productToEdit.get('height');
    productForm.fields.width.value=productToEdit.get('width');
    productForm.fields.cost.value = productToEdit.get('cost');
    productForm.fields.description.value = productToEdit.get('description');
    productForm.fields.stock.value=productToEdit.get('stock');
    productForm.fields.date.value=productToEdit.get('date');
    productForm.fields.category_id.value = productToEdit.get('category_id');
    productForm.fields.tags.value = selectedTagIds;

    res.render('products/update', {
        'form': productForm.toHTML(bootstrapField),
        'product': productToEdit.toJSON()
    })

})

router.post('/:product_id/update', async (req, res) => {

    // fetch the product that we want to update
    const productToEdit = await Product.where({
        'id': req.params.product_id
    }).fetch({
        required: true
    });

    //process the form
    const productForm = createProductForm();
    productForm.handle(req, {
        'success': async (form) => {
            productToEdit.set(form.data)
            productToEdit.save();
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




