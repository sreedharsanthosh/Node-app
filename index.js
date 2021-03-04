const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const multer = require('multer')
const crypto = require('crypto')
const fs = require('fs')

const path = require('path')
const bcrypt = require('bcrypt')

const app = express()

//set staticpath fot images and css
const staticpath = path.join(__dirname + "/public")
app.use(express.static(staticpath))

//connect to the database
const uri = 'mongodb+srv://Kannanunni:Kannanunni@cluster0.btobg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
mongoose.connect(uri ,{ useNewUrlParser: true ,useUnifiedTopology: true})

//check if connected to the database
mongoose.connection.on('error' , (err) => {
	console.log('error while connecting to the database' , err)
})

mongoose.connection.once('open' , () => {
	console.log('connection with the database activated')
})

//set middleware
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

//set view engine
app.set('view engine' , 'ejs')


const storage = multer.diskStorage({
   destination: function (req, file, callback) {
     callback(null, "uploads/");
   },
   filename: function (req, file, callback) {
     crypto.pseudoRandomBytes(16, function (err, raw) {
         callback(null, 'upload' + ".jpg"); 
 });
   },
});


const upload = multer({ storage:storage })

//set Schema
const userSchema = mongoose.Schema({
	name:String,
	password:String
})

const blogSchema = mongoose.Schema({
	Date:String,
	Title:String,
	Image:{
		data:Buffer,
		contentType:String
	}
})

const Users = mongoose.model('Users' , userSchema)

const Blog = mongoose.model('Blogs' , blogSchema)

app.get('/' , (req,res) => {
	res.render('index')
})

app.get('/register' , (req,res) => {
	res.render('register')
})

app.post('/register' , (req,res) => {
	const username = req.body.username;
	const password = req.body.password
	// hash the password
	bcrypt.hash(req.body.password , 10 , (err,hash) =>{
		if(err){
			console.log('error while hashing the password' , err)
		}else{
			req.body.password = hash;

			const newUserData = ({
				name:req.body.username,
				password:req.body.password
			})

			Users.create(newUserData ,(err,user) =>{
				if(err){
					console.log('error while creating the new user' , err)
				}else{
					console.log('new user created succesfully')
					res.redirect('/')
				}
			})
		}
	})

})

app.post('/home' ,(req,res) => {
	const name = req.body.username;
	const password = req.body.password
	Users.findOne({name:req.body.username} , (err,User) => {
		if(err){
			console.log('error while searching for the user' , err)
		}else{
			bcrypt.compare(req.body.password , User.password ,(err,result) => {
				if(err){
					console.log('error while comparing with bcrypt', err)
				}else{
					if(result === true){
						console.log('User found' , User)
						res.render('home' , {name:User.name})
					}else{
						console.log('Incorrect credentials')
					}
				}
			})
		}
	})
})

app.get('/create' , (req,res) => {
	res.render('create')
})

// app.post('/new' , upload.single('image'), (req,res) => {
// 	const date = req.body.date;
// 	const message = req.body.message;
// 	const newBlog = {
// 		Date:req.body.date,
// 		Title:req.body.message,
// 		image: {
// 			data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.body.filename
// 				)),
// 			contentType:'image/png'
// 		}
// 	}

// 	Blog.create(newBlog , (err,items) => {
// 		if(err){
// 			console.log('error while entering the new copy' , err)
// 		}else{
// 			res.redirect('/imgpage')
// 			fs.unlink(__dirname +'/uploads/upload.jpg' , (err) => {
// 				if(err){
// 					console.log('error while deleting the file' , err)
// 				}
// 			})
// 		}
// 	})file
// })


app.post('/new' , upload.single('image') , (req,res,next) => {

        const obj = {
                Date: req.body.date,
                Title: req.body.message,
                Image:{
                        data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.image.filename)),
                        contentType: 'image/png'
                }
        }

        Blog.create(obj , (err,items) => {
                if(err){
                        re.send('error while post method ')
                        console.log('error while post method' , err)
                }else{
                        res.redirect('/imgpage')
                        fs.unlink(__dirname + '/uploads/upload.jpg' , (err) => {
                                console.log('error while deleting file',err)
                        })
                }
        })
})

app.get('/imgpage' , (req,res) => {
	Blog.find({} , (err,items) => {
		if(err){
			console.log('error while fetching data from the database' , err)
		}else{
			res.render('home' , {items :items , name:'sreedhar'})
		}
	})
})

const port = process.env.PORT || 4000;
app.listen(port , console.log(`app is listening on port ${port}`))