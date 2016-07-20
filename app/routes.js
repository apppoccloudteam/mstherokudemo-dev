module.exports = function(app) {
	
	var pg = require('pg');
	pg.defaults.ssl = true;
	var db = require('../config/db');
	var TABLE_NAMES = {
		'ACCOUNT' : 'salesforce.account',
		'LEAD'    : 'salesforce.lead',
		'PUBLIC_users'  : 'public.users',
		'PUBLIC_userdetails'  : 'public.user_details'
	}
	
	app.get('/api/v1/getuserinfo', function(req, res) {
		var results = [];
		if (req.session.applicationID || req.param('token')) {
			var applicationID = req.session.applicationID || req.param('token');
			pg.connect(process.env.DATABASE_URL || db.postgres_sql, function(err, client, done) {
			// Handle connection errors
			if(err) {
			  done();
			  console.log(err);
			  return res.status(500).json({ success: false, data: err});
			}
					
			// SQL Query > Select Data
			var query = client.query("SELECT * FROM salesforce.lead WHERE sfid = '"+applicationID+"'");

			// Stream results back one row at a time
			query.on('row', function(row) {
				if(req.session.roleid){
					row.roleid = req.session.roleid;
				}
				results.push(row);
			});

			// After all data is returned, close connection and return results
			query.on('end', function() {
				done();
					if(results.length > 0){
						return res.json(results);
					}
				});
			});
		}
	   else {
		return res.json({ name: '' });
	  }
	});
	
	app.get('/api/v1/getstudentpendinglist', function(req, res) {
		var results = [];
		// Get a Postgres client from the connection pool
			pg.connect(process.env.DATABASE_URL || db.postgres_sql, function(err, client, done) {
			// Handle connection errors
			if(err) {
			  done();
			  console.log(err);
			  return res.status(500).json({ success: false, data: err});
			}
					
			// SQL Query > Select Data
			var query = client.query("SELECT u.*,l.firstname,l.lastname,l.company,l.phone,l.email,u.lead_id FROM users u, salesforce.lead l WHERE (l.id = u.lead_id AND u.is_active = '0') ORDER BY u.user_id DESC");

			// Stream results back one row at a time
			query.on('row', function(row) {
				results.push(row);
			});

				// After all data is returned, close connection and return results
				query.on('end', function() {
				done();
					if(results.length > 0){
						 return res.json(results);
					}
				});
			});
	});
	
	app.get('/api/v1/updatestudent', function(req, res) {
		var results = [];
		if (req.param('student_id')) {
			var studentID = req.param('student_id');
			pg.connect(process.env.DATABASE_URL || db.postgres_sql, function(err, client, done) {
			// Handle connection errors
			if(err) {
			  done();
			  console.log(err);
			  return res.status(500).json({ success: false, data: err});
			}
					
			// SQL Query > Select Data
			var query = client.query("UPDATE users SET sf_id = (SELECT sfid FROM salesforce.lead WHERE id = '"+studentID+"'), is_active = 1 WHERE lead_id = '"+studentID+"'", function(err, result) {
				if(err) {done();
			  console.log(err);}
			  else {
				  console.log("update result = ", result);
					results.push({success: true});
			  }
				
			});
		
			// After all data is returned, close connection and return results
			query.on('end', function() {
				done();
					if(results.length > 0){
						return res.json(results);
					}
				});
			});
		}
	   else {
		return res.json({ name: '' });
	  }
	});
	
	
	
	app.get('/api/v1/getstudentlist', function(req, res) {
		var results = [];
		// Get a Postgres client from the connection pool
			pg.connect(process.env.DATABASE_URL || db.postgres_sql, function(err, client, done) {
			// Handle connection errors
			if(err) {
			  done();
			  console.log(err);
			  return res.status(500).json({ success: false, data: err});
			}
					
			// SQL Query > Select Data
			var query = client.query("SELECT u.*,l.*,l.phone as phoneNumber FROM users u, salesforce.lead l WHERE (l.sfid = u.sf_id AND u.role_id = 2 AND u.is_active = '1') ORDER BY u.user_id DESC");

			// Stream results back one row at a time
			query.on('row', function(row) {
				results.push(row);
			});

				// After all data is returned, close connection and return results
				query.on('end', function() {
				done();
					if(results.length > 0){
						 return res.json(results);
					}
				});
			});
	});
	
	app.get('/api/v1/logout', function(req, res) {
		req.session = null;
		return res.json({});
	});
	

	// server routes ===========================================================
	// handle things like api calls
	// authentication routes

	// frontend routes =========================================================
	// route to handle all angular requests
	app.get('*', function(req, res) {
		var params = req.params[0];
		res.sendfile('./public/index.html');
	});
	
	
	
	app.post('/api/v1/login', function(req, res) {
		var results = [];
		 if(!req.body.hasOwnProperty('userName')) {
			res.statusCode = 400;
			return res.json({ error: 'Invalid message' });
		}else{
			// Get a Postgres client from the connection pool
			pg.connect(process.env.DATABASE_URL || db.postgres_sql, function(err, client, done) {
			// Handle connection errors
			if(err) {
			  done();
			  console.log(err);
			  return res.status(500).json({ success: false, data: err});
			}
					
			// SQL Query > Select Data
			var query = client.query("SELECT u.*,l.firstname FROM users u, salesforce.lead l WHERE (u.username = '"+req.body.userName+"' AND u.password_salt ='"+req.body.password+"')");

			// Stream results back one row at a time
			query.on('row', function(row) {
				results.push(row);
			});

				// After all data is returned, close connection and return results
				query.on('end', function() {
				done();
					if(results.length > 0){
						 req.session.name = results[0].username;
						 req.session.id = results[0].user_id;
						 req.session.roleid = results[0].role_id;
						 req.session.applicationID = results[0].sf_id;
						 return res.json(results);
					}
				});
			});
		}
		
	});
	
	
	app.post('/api/v1/addnewstudent', function(req, res) {
			var results = [];
			// Get a Postgres client from the connection pool
			pg.connect(process.env.DATABASE_URL || db.postgres_sql, function(err, client, done) {
			// Handle connection errors
			if(err) {
			  done();
			  console.log(err);
			  return res.status(500).json({ success: false, data: err});
			}
			
			
			var studentInfo = req.body;
		
			studentInfo.name = studentInfo.firstname + ' ' + studentInfo.lastname;
			
			// SQL Query > Select Data
			var queryText = 'INSERT INTO salesforce.lead(phone, firstname, company, name, lastname, email) VALUES($1,$2,$3,$4,$5,$6) RETURNING id';
			var query = client.query(queryText, [studentInfo.phone, studentInfo.firstname, studentInfo.company, studentInfo.name,studentInfo.lastname,studentInfo.email], function(err, result) {
			 if(err) {done();
			  console.log(err);}
			  else {
				var newlyCreatedSfId = result.rows[0].id;
				results.push(newlyCreatedSfId);
			  }
			});
			
			// After all data is returned, close connection and return results
			query.on('end', function() {
			done();
				  if(results.length > 0){
					 if(addStudentToPostGres(results,req, res)){ }
					 return res.json(results);
				  }
				   
			});
		});
	});

	var addStudentToPostGres = function(f_results,req,res){

			var results = [];
			
			pg.connect(process.env.DATABASE_URL || db.postgres_sql, function(err, client, done) {
			// Handle connection errors
			if(err) {
			  done();
			  console.log(err);
			  return res.status(500).json({ success: false, data: err});
			}
			
			// SQL Query > Select Data
			
			var token = Math.floor(Math.random() * 16) + 5;
			
			var queryText = 'INSERT INTO users(username, sf_id, email, password_salt, role_id, is_active,lead_id) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING user_id';
			console.log(queryText, [req.body.userName,token,req.body.email,req.body.password, 2,0,f_results[0]]);
			var query = client.query(queryText, [req.body.userName,token,req.body.email,req.body.password, 2,0,f_results[0]], function(err, result) {
			 if(err) {done();
			  console.log(err);}
			  else {
				  console.log("else");
				var newlyCreatedUserId = result.rows[0].user_id;
				results.push(newlyCreatedUserId);
			  }
			});
			
			// After all data is returned, close connection and return results
			query.on('end', function() {
			done();
				   console.log("after insert = ", results);
				   return (results.length > 0) ? true : false;
			});
		});
		
	}
	
	
	app.post('/api/v1/savestudentinformation', function(req, res) {
			var results = [];
			var token = req.body.sfid;
			 if(!checkSalesforceIdExists(token)){
					// Get a Postgres client from the connection pool
					pg.connect(process.env.DATABASE_URL || db.postgres_sql, function(err, client, done) {
					// Handle connection errors
					if(err) {
					  done();
					  console.log(err);
					  return res.status(500).json({ success: false, data: err});
					}
					
					// SQL Query > Select Data
					var queryText = 'INSERT INTO users(username, sf_id, email, password_salt, role_id, is_active) VALUES($1,$2,$3,$4,$5,$6) RETURNING user_id';
					var query = client.query(queryText, [req.body.userName, token, req.body.email,req.body.password, 2,1], function(err, result) {
					 if(err) {}
					  else {
						var newlyCreatedUserId = result.rows[0].user_id;
						results.push(newlyCreatedUserId);
					  }
					});
					
					// After all data is returned, close connection and return results
					query.on('end', function() {
					done();
						if(results.length > 0){
						   req.session.name = req.body.userName;
						   req.session.id = results[0].newlyCreatedUserId;
						   req.session.roleid = results[0].role_id;
						   req.session.applicationID = token;
						   return res.json(results);
						}
					});
				});
			 }else{
				 res.statusCode = 400;
				return res.json({ error: 'Invalid message' });
			 }
			
	});
	
	var checkSalesforceIdExists = function(token){
			var results = [];
			pg.connect(process.env.DATABASE_URL || db.postgres_sql, function(err, client, done) {
			// Handle connection errors
			if(err) {
			  done();
			  console.log(err);
			  return res.status(500).json({ success: false, data: err});
			}
			
			var query = client.query("SELECT user_id FROM users WHERE sf_id='"+token+"'");
			// Stream results back one row at a time
			query.on('row', function(row) {
				results.push(row);
			});
			
			// After all data is returned, close connection and return results
			query.on('end', function() {
				done();
				return (results.length > 0) ? true : false;
			});
		});
	}


};