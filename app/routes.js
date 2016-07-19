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
		var token = req.param('token');
		//console.log("token = ", token);
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
			var query = client.query("SELECT u.*,l.firstname FROM public.users u, salesforce.lead l WHERE (u.username = '"+req.body.userName+"' AND u.password_salt ='"+req.body.password+"')");

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
						 req.session.applicationID = results[0].sf_id;
						 return res.json(results);
					}
				});
			});
		}
		
	});
	
	app.post('/api/v1/savestudentinformation', function(req, res) {
			var results = [];
			console.log(req.body);
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
					var queryText = 'INSERT INTO public.users(username, sf_id, email, password_salt, role_id, is_active) VALUES($1,$2,$3,$4,$5,$6) RETURNING user_id';
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
			
			
			var query = client.query("SELECT user_id FROM public.users WHERE sf_id='"+token+"'");
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