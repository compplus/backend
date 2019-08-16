var { R, suppose, equals } = require ('camarche/core')
var { go, impure, trace, trace_as } = require ('camarche/effects')
let { Pool } = require ('pg')

var debug = true




var pool = new Pool
var nodemailer = require('nodemailer');







var users = {}
var unconfirmed_users = {}
var trophies = {}
var teams = {}


var create_team = user =>  {

	var leader = user .id
	var members = [ user .id ]
	var { name } = user. username
	var invited = []
	var id = uuid ()
	return pool .query ('INSERT INTO "teams" ("id", "name", "leader", "members", "invited")' + 'VALUES ( $1, $2, $3, $4, $5)', [ id, name, leader, members, invited ])
	.then (_ => undefined) }



var create_unconfirmed_user = unconfirmed_user => {
	var { username, role, email, password, first_name, last_name, gender, age, height, weight, faculty, department } = unconfirmed_user
	var confirmation_code = uuid ()
	return pool .query ('INSERT INTO "unconfirmed_users" ("username", "role", "email", "password", "first_name", "last_name", "gender", "age", "height", "weight", "faculty", "department", "confirmation_code")'
		+ 'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)'
		, [ username, role, email, password, first_name, last_name, gender, age, height, weight, faculty, department, confirmation_code ])
		.then (_ => undefined) }


var create_user = user => {
	var { username, role, email, password, first_name, last_name, gender, age, height, weight, faculty, department } = user
	var id = uuid ()

	return pool .query ('INSERT INTO "users" ("username", "role", "email", "password", "first_name", "last_name", "gender", "age", "height", "weight", "faculty", "department", "id")'
	+ 'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)'
	, [ username, role, email, password, first_name, last_name, gender, age, height, weight, faculty, department, id ])
	.then (_ => undefined) }


var create_stat = user => stat => {
	var { timestamp, distance, calories, steps } = stat
	var id = uuid ()
	return pool .query ('INSERT INTO "stats" ("timestamp", "distance", "calories", "steps", "id" )' + 'VALUES ( $1, $2, $3, $4, $5)', [ timestamp, distance, calories, steps, id ])
	.then (_ => undefined) }


var confirm_user = confirmation_code => {

	//need to setup the email of the recipient and url for confirmation
	export const sendEmail = async (email, url) => {
		const transporter = nodemailer.createTransport({
			host: "smtp.ethereal.email",
			port: 587,
			auth: {
				user: process.env.NODEMAILER_EMAIL,
				pass: process.env.NODEMAILER_PASSWORD
			}
		});
	
		const message = {
			from: "compplus@connect.hku.hk>",
			to: `<${email}>`,
			subject: "Compplus - User Confirmation Email",
			html: `<!DOCTYPE html>
							<html>
								<head>
								</head>
								<body>
									<div style="min-width: 300px;">
										<p>Dear {first name},<br><br></p>
										<p>You have successfully registered an account with Compplus. Please click on <a href = "<${url}>">this link</a> to verify your account.<br><br></p>
										<small>Please ignore this email if you did not register an account with Compplus.</small>
									</div>
								</body>
							</html>`
		};
	
		transporter.sendMail(message, (err, info) => {
			if (err) {
				console.log("Error occurred. " + err.message);
			}
			console.log("Message sent: %s", info.messageId);
		});
	};

	return pool .query (
		'WITH the_unconfirmed_user AS ( ' + 
			'DELETE FROM "unconfirmed_users" unconfirmed_user ' +
			'WHERE "confirmation_code" = $1 ' +
			'RETURNING unconfirmed_user .* ) ' +
		', the_user AS ( ' + 
			'INSERT INTO "users" (username, role, email, password, first_name, last_name, gender, age, height, weight, faculty, department) ' +
			'SELECT username, role, email, password, first_name, last_name, gender, age, height, weight, faculty, department FROM the_unconfirmed_user ) ' +
		' SELECT EXISTS (SELECT * FROM the_unconfirmed_user)'
		, [ confirmation_code ] )
		.then (( { rows: [ { exists } ] } ) => exists ) }
	/*
	return pool .query ('SELECT username, role, email, password, first_name, last_name, gender, age, height, weight, faculty, department FROM "unconfirmed_users" WHERE "confirmation_code" = $1' , [ confirmation_code ])
	.then (({ rows: [ { username, role, email, password, first_name, last_name, gender, age, height, weight, faculty, department } ] }) => 
		create_user ({ username, role, email, password, first_name, last_name, gender, age, height, weight, faculty, department }) )
	.then (_ =>
		pool .query ('DELETE FROM "unconfirmed_users" WHERE "confirmation_code" = $1' , [ confirmation_code ]) )
	.then (_ => undefined) }
	*/


var invite_email = team => email => {

	//need to setup the url for confirmation
	export const sendEmail = async (email, url) => {
		const transporter = nodemailer.createTransport({
			host: "smtp.ethereal.email",
			port: 587,
			auth: {
				user: process.env.NODEMAILER_EMAIL,
				pass: process.env.NODEMAILER_PASSWORD
			}
		});
	
		const message = {
			from: "compplus@connect.hku.hk>",
			to: `<${email}>`,
			subject: "Compplus - Team Invitation",
			html: `<!DOCTYPE html>
							<html>
								<head>
								</head>
								<body>
									<div style="min-width: 300px;">
										<p>Dear {first name},<br><br></p>
										<p>You have been invited to be part of {team name}. Please click on <a href = "<${url}>">this link</a> to accept the invitation.<br><br></p>
										<small>Please ignore this email if you did not register an account with Compplus.</small>
									</div>
								</body>
							</html>`
		};
	
		transporter.sendMail(message, (err, info) => {
			if (err) {
				console.log("Error occurred. " + err.message);
			}
			console.log("Message sent: %s", info.messageId);
		});
	};

	id = team .id
	return pool .query ('SELECT 1 FROM "teams" WHERE id = $1' , [ id ])
	.then (({ rows: [ { invited } ] }) => 
		pool .query ('UPDATE "teams" SET "invited" = $1 WHERE id = $2' , [ [ ... invited, email ], id ]) )
	.then (_ => undefined) }

// function to calculate the total step of the team
// var calc_total_step = teamID => {
// 	var totalStep = 0
// 	teams[teamID].members .forEach(function(userID){
// 		totalStep+=users[userID] .stats .steps

//Kist list of users from team
var kick_user = user => ID_List => {
	id = user .id
	return pool .query ('SELECT * FROM "teams" WHERE $1 = ANY("members")' , [ id ])
	.then (({ rows: [ { members } ] }) => 
		//remove the user id from the list of member's id
		members.splice( members.indexOf(id), 1 ),
		//update specific row of teams with the updated list of members
		pool .query ('UPDATE "teams" SET members = $1 WHERE $2 = ANY("members")' , [ members , id ]) )
	.then (_ => undefined) }
			

var user_team_ = user => {
	var id = user .id
	return pool .query ('SELECT * FROM "teams" WHERE $1 = ANY("members")' , [ id ]) }


var find_user = ({ username, password }) => {
	return pool .query ('SELECT * FROM "users" WHERE "username" = $1 AND "password" = $2' , [ username, password ]) }


var find_stats = user => {
	return pool .query ('SELECT * FROM "stats" WHERE "user" = $1' , [ user ]) }


//find the team's stats
var find_team = team => {
	return pool .query ('SELECT members, invited, totalStep FROM "teams" WHERE id = $1' , [ team .id ]) }


//find the user's ID from username
var find_id = username => {
	return pool .query ('SELECT id FROM "users" WHERE "username" = $1' , [ username ]) }



var clients = {}

var fresh_client = ({ username, password }) => {
	var _user = find_user ({ username, password })
	if (_user) {
		var _client = uuid ()
		while (clients [_client]) {;_client = uuid ()}
		;clients [_client] = { user: _user, ok: false }
		return _client } }
var client_user_ = client => clients [client]

var uuid = _ =>
	'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx' .replace (/[xy]/g, c => 
	suppose (
	( r = Math.random() * 16 | 0
	) =>
	(c == 'x' ? r : (r & 0x3 | 0x8)) .toString (16) ) )



var expect_ok = _error => {
	;console .error (_error)
  
	return { error: 'An unexpected error occured' } }
var respond = ctx => _response => {;ctx .body = _response}

var server_ = routes =>
	require ('koa-qs') (new (require ('koa')))
		.use (require ('koa-compress') ())
		.use (require ('koa-cors') ())
		.use (impure ((ctx, next) =>
			next ()
			.catch (err => {
				;console .error (err)
				
				;ctx .type = 'application/json'
				;ctx .status = 500
				//;ctx .message = err .message || 'Internal Server Error'
				;ctx .body = { error: err .message }
				if (debug) {
					;ctx .body .stack = err .stack } } ) ) )
		.use (require ('koa-morgan') ('combined'))
		.use (require ('koa-bodyparser') ({ strict: false }))
		.use (require ('koa-json') ())
		.use (routes (require ('koa-router') ()) .routes ())


module .exports = server_ (routes => routes
	.post ('/any/signup', impure ((ctx, next) =>
		go
		.then (_ => {
			var { username, role, email, password, first_name, last_name, gender, age, height, weight, faculty, department } = ctx .request .body
			;create_unconfirmed_user ({ username, role, email, password, first_name, last_name, gender, age, height, weight, faculty, department })
			//send email
			} )
		.then (_client => ({ ok: true }))
		.catch (expect_ok)
		.then (respond (ctx)) ) )
	.post ('/any/confirmation', impure ((ctx, next) =>
		go
		.then (_ => {
			var { confirmation_code } = ctx .query
			;var { username, password } = confirm_user (confirmation_code)
			;var _client = fresh_client ({ username, password })
			return _client } )
		.then (_client => ({ ok: true, client: _client }))
		.catch (expect_ok)
		.then (respond (ctx)) ) )
	.post ('/any/login', impure ((ctx, next) =>
		go
		.then (_ => {
			var { username, password } = ctx .request .body
			
			;var _client = fresh_client ({ username, password })
			return _client } )
		.then (_client => ({ ok: equals (_client) (undefined), client: _client }))
		.catch (expect_ok)
		.then (respond (ctx)) ) )
	.get ('/stats', impure ((ctx, next) =>
		go
		.then (_ => {
			var { client } = ctx .query

			return find_stats (client_user_ (client)) } )
		.then (_stats => ({ ok: (_stats) (undefined), stats: _stats }))
		.catch (expect_ok)
		.then (respond (ctx)) ) )
	.post ('/stats', impure ((ctx, next) => 
		go
		.then (_ => {
			var { client, timestamp, distance, calories, steps } = ctx .request .body

			;create_stat (client_user_ (client)) ({ timestamp, distance, calories, steps }) } )
		.then (_ => ({ ok: true }))
		.catch (expect_ok)
		.then (respond) ) )
	.post ('/update', impure ((ctx, next) =>
		go
		.then (_ => {
			var client  = ctx .request .body 
			var user= client_user_(client)
			var { username, password } = user
			var current_user = find_user ({ username, password }) 
			users = R .dissoc (current_user .id) (users)

			;current_user = { ... current_user, ... ctx .request .body }

			;create_user ({ username, role, email, password, first_name, last_name, gender, age, height, weight, faculty, department })
			;var _client = fresh_client ({ username, password })
			return _client } )
		.then (_client => ({ ok: true, client: _client }))
		.catch (expect_ok)
		.then (respond (ctx)) ) )
	//makes a team 
//	.post ('/team' , impure ((ctx, next) =>
//		go
//		.then (_ => {
//			var { client, teamname } = ctx .request .body
//			var user = client_user_ (client)
//			
//			//make a new team if the user doesn't have one
//			if (equals (user_team_ (user)) (undefined)) {
//				;create_team (user) ({ name }) }
//			else {
//				//.catch (expect_ok)
//				}
//			return client } )
//		.then (_client => ({ ok: true, client: _client }))
//		.catch (expect_ok)
//		.then (respond (ctx)) ) )
	.post ('/invite', impure ((ctx, next) =>
		go
		.then (_ => {
			var { client, emails } = ctx .request .body
			var user = client_user_ (client)
			//only can invite if the member is less than 5
			if (user_team_ (user) .members .length < 5){
				//make a new team if there is no existing team for the user
				if (equals (user_team_ (user)) (undefined)) {
					;create_team (user) }
				var team = user_team_ (user)
				//update invited list
				;R .forEach (invite_email (team)) (emails)
			} else {
				//print error message (already full)
			}
			return client } )
		.then (_client => ({ ok: true, client: _client }))
		.catch (expect_ok)
		.then (respond (ctx)) ) )
	.post ('/accept', impure ((ctx, next) =>
		go
		.then (_ => {
			var { client, ID } = ctx .request .body
			var user = client_user_ (client)
			//only can accept if the new team has spot(less than 5 members)
			if ( teams[ID] .members .length < 5 ){
				//delete from original team
				if (user_team_ (user)) {
					;kick_user (user)(user .id) }
				//add to new team
				teams[ID] .members = [ ... teams[ID] .members, user .id ]
				//delete from invited list
				teams[ID] .invited = R .without (user .email, teams[ID] .invited)
			} else {
				//print error message (already full)
			}
			return client } )
		.then (_client => ({ ok: true, client: _client }))
		.catch (expect_ok)
		.then (respond (ctx)) ) )
	.get ('/team', impure ((ctx, next) =>
		go
		.then (_ => {
			var { client } = ctx .request .body
			var user = client_user_ (client)
			return find_team (user_team_ (user)) } )
		.then (_stats => ({ ok: (_stats) (undefined), teamStats: _stats }))
		.catch (expect_ok)
		.then (respond (ctx)) ) )
	.post ('/team', impure ((ctx,next) =>
 		go
		.then (_ => {
			var { client, new_leader, new_team_name } = ctx .request .body
			var user = client_user_ (client)
			//only leader can change
			if ( user_team_ (user) .leader == user .ID ){
				user_team_ (user) = { ...user_team_(user), leader: new_leader, name: new_team_name }
				}} )
		.then (_ => ({ ok: true }))
		.catch (expect_ok)
		.then (respond) ) )	  
	//kick members from a team. Only leader can do it.	
	.post ('/kick', impure ((ctx, next) =>
		go
		.then (_ => {
			var { client, ID_List } = ctx .request .body
			var user = client_user_ (client)
			//If the client is the leader
			if ( user_team_ (user) .leader == user .ID ){
				//delete list of IDs from team
				if (user_team_ (user)) {
					;kick_user (user)(ID_List)}}
			return client } )
		.then (_client => ({ ok: true, client: _client }))
		.catch (expect_ok)
		.then (respond (ctx)) ) )
	
	)
