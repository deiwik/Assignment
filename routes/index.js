const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Task = require('../models/task')
const AssignedTask=require('../models/assignedTask')

router.get('/', (req, res, next) => {
	return res.render('index.ejs');
});


router.post('/', (req, res, next) => {
	let personInfo = req.body;

	if (!personInfo.email || !personInfo.username || !personInfo.password || !personInfo.passwordConf) {
		res.send();
	} else {
		if (personInfo.password == personInfo.passwordConf) {

			User.findOne({ email: personInfo.email }, (err, data) => {
				if (!data) {
					let c;
					User.findOne({}, (err, data) => {

						if (data) {
							c = data.unique_id + 1;
						} else {
							c = 1;
						}

						let newPerson = new User({
							unique_id: c,
							email: personInfo.email,
							username: personInfo.username,
							password: personInfo.password,
							passwordConf: personInfo.passwordConf
						});

						newPerson.save((err, Person) => {
							if (err)
								console.log(err);
							else
								console.log('Success');
						});

					}).sort({ _id: -1 }).limit(1);
					res.send({ "Success": "You are regestered,You can login now." });
				} else {
					res.send({ "Success": "Email is already used." });
				}

			});
		} else {
			res.send({ "Success": "password is not matched" });
		}
	}
});

router.get('/login', (req, res, next) => {
	return res.render('login.ejs');
});

router.post('/login', (req, res, next) => {
	User.findOne({ email: req.body.email }, (err, data) => {
		if (data) {

			if (data.password == req.body.password) {
				req.session.userId = data.unique_id;
				res.send({ "Success": "Success!" });
			} else {
				res.send({ "Success": "Wrong password!" });
			}
		} else {
			res.send({ "Success": "This Email Is not regestered!" });
		}
	});
});

router.get('/profile', (req, res, next) => {
	User.findOne({ unique_id: req.session.userId }, async (err, data) => {
		if (!data) {
			res.redirect('/');
		} else {
			
			//All the tasks assocaited with the user
			let tasks,pendingTasks,acceptedTasks;
			await Task.find({
				creater: data._id
			},(err,data)=>{
				tasks=data
			})
			await AssignedTask.find({
				assigned_user:data._id,
				status:0
			},(err,data)=>{
				pendingTasks=data
			})
			await AssignedTask.find({
				assigned_user:data._id,
				status:1
			},(err,data)=>{
				acceptedTasks=data
			})
			
			return res.render('data.ejs', { "name": data.username, "email": data.email , "tasks": tasks,"acceptedTasks":acceptedTasks,"pendingTasks":pendingTasks});
		}
	});
});

router.get('/create_task',(req,res,next) => {
	User.findOne({ unique_id: req.session.userId }, (err, data) => {
		if (!data) {
			res.redirect('/');
		} else {
			return res.render('create_task.ejs', { "name": data.username, "email": data.email });
		}
	});
})

router.post('/create_task',(req,res,next) => {
	User.findOne({ unique_id: req.session.userId }, (err, data) => {
		if (!data) {
			res.redirect('/');
		} else {
			let task=new Task({...req.body,creater:data._id,})
			task.save((err,info)=>{
				if(err){
					console.log(err)
				}
				else{
					console.log('success')
				}
			 })
			res.redirect('/profile')
			// On profile we can show a list of created tasks and list of shared tasks ans list of accepted tasks
		}
	});
})

router.get('/logout', (req, res, next) => {
	if (req.session) {
		// delete session object
		req.session.destroy((err) => {
			if (err) {
				return next(err);
			} else {
				return res.redirect('/');
			}
		});
	}
});

router.get('/forgetpass', (req, res, next) => {
	res.render("forget.ejs");
});

router.post('/forgetpass', (req, res, next) => {
	User.findOne({ email: req.body.email }, (err, data) => {
		if (!data) {
			res.send({ "Success": "This Email Is not regestered!" });
		} else {
			if (req.body.password == req.body.passwordConf) {
				data.password = req.body.password;
				data.passwordConf = req.body.passwordConf;

				data.save((err, Person) => {
					if (err)
						console.log(err);
					else
						console.log('Success');
					res.send({ "Success": "Password changed!" });
				});
			} else {
				res.send({ "Success": "Password does not matched! Both Password should be same." });
			}
		}
	});

});
router.get('/assign_task/:id',(req,res)=>{
	
	res.render("assign_task.ejs",{})
})
router.post('/assign_task/:id',async (req,res)=>{
	const taskId=req.params.id
	const email=req.body.email
	let task;
	let user;
	await User.findOne({email},(err,data)=>{
		user=data
	})
	if(user){
		await Task.findOne({_id:taskId},(err,data)=>{
			task=data
		})
		const assignedTask=new AssignedTask({
			assigned_user:user,
			task,
			status:0
		})
		assignedTask.save((err,info)=>{
			if(err){
				console.log(err)
			}
			else{
				console.log('success')
			}
		})
	}
	else{
		res.send("The email address entered does not belong to any user")
	}
	
})
router.get('/accept_task/:id',async (req,res)=>{
	const taskId=req.params.id
	let checkUser;
	let user;
	console.log(req.session.userId)
	await AssignedTask.findOne({_id:taskId},(err,data)=>{
		checkUser=data.assigned_user
	})
	await User.findOne({unique_id:req.session.userId},(err,data)=>{
		user=data._id
	})
	console.log(user)
	console.log(checkUser)
	if(user==checkUser){
		await AssignedTask.updateOne({task},{
			status:1
		},(err,docs)=>{
			if(err){
				console.log(err)
			}
			else{
				console.log(docs)
			}
		})		
	}
})
router.get('/reject_task/:id',async (req,res)=>{
	const taskId=req.params.id
	let checkUser;
	let user;
	let task;
	await AssignedTask.findOne({_id:taskId},(err,data)=>{
		checkUser=data.assigned_user
	})
	await User.findOne({unique_id:req.session.userId},(err,data)=>{
		user=data
	})
	if(user==checkUser){
		await AssignedTask.updateOne({task},{
			status:2
		},(err,docs)=>{
			if(err){
				console.log(err)
			}
			else{
				console.log(docs)
			}
		})		
	}
	
})

module.exports = router;