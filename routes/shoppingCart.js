const express =require('express')
const router=express.Router()

const CartServices=require('../services/CartServices')

router.get('/',async(req,res)=>{
    let cartServices =new CartServices(req.session.user.id)
    const allItems = await cartServices.getAll()
    res.render('shoppingCart/index',{
        'allItems':allItems.toJSON()
    })
})
 
router.get('/:product_id/add',async (req,res)=>{
    let cartServices=new CartServices(req.session.user.id)
    await cartServices.addToCart(req.params.product_id)
    req.flash('success_messages','Product has been added to cart')
    res.redirect('back')
})

router.get('/:product_id/remove', async(req,res)=>{
    let cart = new CartServices(req.session.user.id);
    await cart.remove(req.params.product_id);
    req.flash("success_messages", "Item has been removed");
    res.redirect('/shoppingCart');
})

router.post('/:product_id/quantity/update',async (req,res)=>{
    let cart = new CartServices(req.session.user.id)
    await cart.setQuantity(req.params.product_id,req.body.newQuantity)
    req.flash("success_messages", "Quantity updated")
    res.redirect('/shoppingCart');


})

module.exports=router