const express = require("express");
const router = express.Router();
const { checkIfAuthenticated } = require('../middlewares');

// #1 import in the Product model
const {Product, Category, Tag} = require('../models')

// import in the Forms
const { bootstrapField, createProductForm } = require('../forms');

//import DAL
const productDataLayer=require('../dal/product')

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

    const allCategories=await productDataLayer.getAllCategories()
    const allTags=await productDataLayer.getAlltags()
    // const allCategories = await Category.fetchAll().map((category) => {
    //     return [category.get('id'), category.get('name')]
    // });

    // const allTags = await Tag.fetchAll().map((tag)=>{
    //     return[tag.get('id'),tag.get('name')]
    // })
    

    const productForm = createProductForm(allCategories,allTags);
    res.render('products/create',{
        'form': productForm.toHTML(bootstrapField),
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESETS
    })
})

router.post('/create',  async(req,res)=>{
    const allCategories = await productDataLayer.getAllCategories()

    const allTags = await productDataLayer.getAlltags()

    const productForm = createProductForm(allCategories,allTags);

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
            req.flash('success_messages',  `New Product ${newProduct.get('title')} has been created`)
            res.redirect('/products');
        },
        'error': async (form) => {
            req.flash('error_messages','Please correct all errors and try again')
            res.render('products/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:product_id/update', async (req, res) => {
    // fetch all the categories
    const allCategories = await productDataLayer.getAllCategories()
    const allTags=await productDataLayer.getAlltags()

    // retrieve the product
    const productToEdit=await productDataLayer.getProductById(req.params.product_id)

    // //retrieve product(old version)
    // const productId = req.params.product_id
    // const productToEdit = await Product.where({
    //     'id': productId
    // }).fetch({
    //     require: true,
    //     withRelated:['tags']
    // });

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
    productForm.fields.image_url.value=productToEdit.get('image_url')

    res.render('products/update', {
        'form': productForm.toHTML(bootstrapField),
        'product': productToEdit.toJSON(),
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESETS
    })

})

router.post('/:product_id/update', async (req, res) => {

    // fetch the product that we want to update
    const productToEdit = await productDataLayer.getProductById(req.params.product_id)
    const productJSON=productToEdit.toJSON()
    const existingTagsId=productJSON.tags.map(t => t.id)

    //process the form
    const productForm = createProductForm();
    productForm.handle(req, {
        'success': async (form) => {
            let {tags,...productData}=form.data
            productToEdit.set(productData)
            productToEdit.save();
            let newTagsId = tags.split(",")
            productToEdit.tags().detach(existingTagsId);
            productToEdit.tags().attach(newTagsId);
            req.flash('success_messages', "Product has been updated")
            res.redirect('/products')
        },
        'error': async (form) => {
            res.render('products/update', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })

})

router.get('/:product_id/delete', async (req,res)=>{
    const productToDelete=await productDataLayer.getProductById(req.params.product_id)
    console.log(productToDelete.toJSON())
    res.render('products/delete',{
        'product':productToDelete
    })
})

router.post('/:product_id/delete', async(req,res)=>{
    // fetch the product that we want to delete
    const productToDelete=await productDataLayer.getProductById(req.params.product_id)
    await productToDelete.destroy();
    res.redirect('/products')
})




