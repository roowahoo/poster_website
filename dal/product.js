const {Category, Tag, Product}=require('../models')
const getAllCategories=async()=>{
    const allCategories = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')]
    });
    return allCategories
}

const getAlltags=async()=>{
    const allTags = await Tag.fetchAll().map((tag)=>{
        return[tag.get('id'),tag.get('name')]
    })
    return allTags
}

const getProductById=async(productId)=>{
    const productToEdit = await Product.where({
        'id': productId
    }).fetch({
        require: true,
        withRelated:['tags']
    });
    return productToEdit

}


module.exports={
    getAllCategories,
    getAlltags,
    getProductById

}