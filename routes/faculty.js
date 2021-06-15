const Joi = require('joi');
const express = require('express');
const mongoose = require('mongoose');
const array = require('joi/lib/types/array');
const router = express.Router();
const path = require('path');

var validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

const Faculty = mongoose.model('Faculty', new mongoose.Schema({ 
    facultyID: {type: Number, required:'this field is required'},
    name:{ type: String, required: 'this field is required', minlength: 3},
    gender: { type: String, required: 'this field is required', lowercase: true, enum: ['male','female'] },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        required: 'this field is required',
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    address : {
        street_address: { type: String, required: 'this field is required' },
        city:  { type: String, required: 'this field is required' },
        country:  { type: String, required: 'this field is required' }
    },
    course_code:  { type: String, required: 'this field is required', minlength: 3 },
    phone_number: { type: Number, required: 'this field is required'}

}));

router.get('/', (req,res) => {
    res.render("faculty/addOrEdit",{
        viewTitle : "Input Student Data"
    });
});

router.get('/list', (req,res) => {
    Faculty.find((err,docs)=>{
        if(!err){
            res.render("faculty/list",{
                list: docs
            });
        }
        else{
            console.log('error in retriving faculty List');
        }
    })
    
});

router.get('/:id', (req,res) => {
    Faculty.findById(req.params.id,(err,doc)=>{
        if(!err){
            res.render("faculty/addOrEdit",{
                viewTitle: "Update Student Record",
                Faculty: doc
            })
        }
    });
});

router.post('/', (req,res)=>{
    if (req.body._id == '')
    insertRecord(req, res);
    else
    updateRecord(req, res);   
});

function insertRecord(req,res){
    var faculty = new Faculty({
        facultyID: req.body.facultyID,
        name: req.body.name,
        gender: req.body.gender,
        email: req.body.email,
        address: {
            street_address: req.body.street_address,
            city: req.body.city,
            country: req.body.country
        },
        course_code: req.body.course_code,
        phone_number: req.body.phone_number
    });
    faculty.save((err,doc)=>{
        if(!err) 
            res.redirect('faculty/list');
        else{
                if(err.name == 'ValidationError'){
                handleValidationError(err,req.body);
                res.render("faculty/addOrEdit",{
                    viewTitle : "Input Student Data",
                    Faculty: req.body
                });
                }
                else
                console.log ('error occured during the posting'+err);
        }
    });
}
function updateRecord(req,res){ 
    console.log('hi');
    Faculty.findOneAndUpdate({_id:req.body._id},req.body,{ new: true, runValidators:true},(err,doc)=>{
        console.log('hi');
        if(!err){
            res.redirect('faculty/list'); }
        else{
            if(err.name == 'ValidationError'){
                handleValidationError(err,req.body);
                res.render("faculty/addOrEdit",{
                    viewTitle: 'Update Student',
                    Faculty: req.body
                });
            }
            else console.log('Error during Record Update:'+ err);
        }
    });
}

router.get('/delete/:id',(req,res)=>{
    Faculty.findByIdAndRemove(req.params.id,(err,doc)=>{
        if(!err){
            res.redirect('../list');
        }
        else{
            console.log('Error in Student delete:'+ err);
        }
    })
});


function validateFaculty(faculty){
    const schema = {
        facultyID: Joi.number(),
        name: Joi.string().min(3).required(),
        gender: Joi.any().valid("male","female"),
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
        address: {
            street_address: Joi.string().required(),
            city: Joi.string().required(),
            country: Joi.string().required()
        },
        course_code: Joi.string().min(3).required(),
        phone_number: Joi.array().items(Joi.number()) 
    };
   return Joi.validate(faculty, schema);
}

function handleValidationError(err,body){
   for(field in err.errors){
       switch(err.errors[field].path){
            case 'facultyID':
               body['facultyIDError'] = err.errors[field].message;
               break;
            case 'name':
                body['nameError'] = err.errors[field].message;
                break;
            case 'gender':
                body['genderError'] = err.errors[field].message;
                break;
            case 'email':
                body['emailError'] = err.errors[field].message;
                break;
            case 'address.street_address':
                body['street_addressError'] = err.errors[field].message;
                break;
            case 'address.city':
                body['cityError'] = err.errors[field].message;
                break;
            case 'address.country':
                body['countryError'] = err.errors[field].message;
                break;
            case 'course_code':
                body['course_codeError'] = err.errors[field].message;
                break;
            case 'phone_number':
                body['phone_numberError'] = err.errors[field].message;
                break;
            default:
                break;


       }
   }
}

module.exports = router