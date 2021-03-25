// import in caolan forms
const forms = require("forms");
// create some shortcuts
const fields = forms.fields;
const validators = forms.validators;
const widget = widgets = require('forms').widgets;


var bootstrapField = function (name, object) {
    if (!Array.isArray(object.widget.classes)) { object.widget.classes = []; }

    if (object.widget.classes.indexOf('form-control') === -1) {
        object.widget.classes.push('form-control');
    }

    var validationclass = object.value && !object.error ? 'is-valid' : '';
    validationclass = object.error ? 'is-invalid' : validationclass;
    if (validationclass) {
        object.widget.classes.push(validationclass);
    }

    var label = object.labelHTML(name);
    var error = object.error ? '<div class="invalid-feedback">' + object.error + '</div>' : '';

    var widget = object.widget.toHTML(name, object);
    return '<div class="form-group">' + label + widget + error + '</div>';
};

const createProductForm = (categories,tags) => {
    return forms.create({
        'title':fields.string({
            required:true,
            errorAfterField:true,
            cssClasses:{
                label:['form-label']
            }
        }),
        'height': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            'validators':[validators.integer()]
        }),
        'width': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            'validators':[validators.integer()]
        }),
        'cost': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            'validators':[validators.integer()]
        }),

        'description': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'stock': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            'validators':[validators.integer()]
        }),
        'date': fields.date({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget:widget.date()
        }),

        'category_id': fields.string({
            label:'Category',
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.select(),
            choices: categories
        }),
        'tags':fields.string({
            label:'Tags',
            required:true,
            errorAfterField:true,
            cssClasses:{
                label:['form-label']
            },
            widget:forms.widgets.multipleSelect(),
            //choices is set to all tags from the 'tags' table
            choices:tags
        }),
        // 'image_url':fields.string({
        //     required:true,
        //     errorAfterField:true,
        //     widgets:widgets.hidden()

        // })
            
        
    })
};

module.exports = { createProductForm, bootstrapField };