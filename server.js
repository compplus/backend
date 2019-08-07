var { R, suppose, equals } = require ('camarche/core')
var { go, impure, trace, trace_as } = require ('camarche/effects')

var debug = true












var users = {}
var unconfirmed_users = {}
var trophies = {}
var teams = {}


var create_team = user =>  {
	var leader = user .ID
	var members = [ user .ID ]
	var { name } = user. username
	var invited = []
	var id = uuid ()
	var team = { id, name, leader, members, invited, totalStep }
	;teams = { ... teams, [ id ]: team } }
	
var create_unconfirmed_user = unconfirmed_user => {
	var { confirmation_code, username, role, email, password, first_name, last_name, gender, age, height, weight, faculty, department } = unconfirmed_user
	var unconfirmed_user =
	{ username, role, email, password, first_name, last_name, gender, age, height, weight, faculty, department
	, stats: [] }
	;unconfirmed_users [ confirmation_code ] = unconfirmed_user }
var create_user = user => {
	var { username, role, email, password, first_name, last_name, gender, age, height, weight, faculty, department } = user
	var id = uuid ()
	;users = { ... users, [ id ]: { id, username, role, email, password, first_name, last_name, gender, age, height, weight, faculty, department } } }
var create_stat = user => stat => {
	var { timestamp, distance, calories, steps } = stat
	stat = { timestamp, distance, calories, steps }
	;user .stats = [ ... user .stats, stat ] }


var confirm_user = confirmation_code => {
	;unconfirmed_users = R .dissoc (confirmation_code) (unconfirmed_users)
	;create_user ({ username, role, email, password, first_name, last_name, gender, age, height, weight, faculty, department })
	return { username, role, email, password, first_name, last_name, gender, age, height, weight, faculty, department } }
var invite_email = team => email => {
	;team .invited = [ ... team .invited, emails ] }
// function to calculate the total step of the team
// var calc_total_step = teamID => {
// 	var totalStep = 0
// 	teams[teamID].members .forEach(function(userID){
// 		totalStep+=users[userID] .stats .steps

//TODO
//var kick_user = 
			
		

//find the user's team 	
var user_team_ = user => {
	var userID = user .id
	return R .find (team => R .includes (userID) (team .members)) (R .values (teams)) }
var find_user = ({ username, password }) =>
	R .find (({ _username, _password }) => R .and (equals (username) (_username)) (equals (password) (_password))
	) (
	R .values (users) )
var find_stats = user => 
	user .stats
//find the team's stats
var find_team = team => {
	var { members, invited, totalStep } = team 
	return { members, invited, totalStep }
	}
//find the user's ID from username
var find_id = username => 
	return (R .find ( id => equals ( username )) ( users[id] .username )).id



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
			var confirmation_code = uuid ()
			;create_unconfirmed_user ({ confirmation_code, username, role, email, password, first_name, last_name, gender, age, height, weight, faculty, department })
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
			//make a new team if there is no existing team for the user
			if (equals (user_team_ (user)) (undefined)) {
				;create_team (user) }
			var team = user_team_ (user)
			//update invited list
			;R .forEach (invite_email (team)) (emails)
			return client } )
		.then (_client => ({ ok: true, client: _client }))
		.catch (expect_ok)
		.then (respond (ctx)) ) )
	//TODO: change to use team ids
	.post ('/accept', impure ((ctx, next) =>
		go
		.then (_ => {
			var { client, ID } = ctx .request .body
			var user = client_user_ (client)
			//delete from original team
			if (user_team_ (user)) {
				;user_team_ (user) .members = R .without (user .id, user_team_ (user). members) }
			//add to new team
			teams[ID] .members = [ ... teams[ID] .members, user .id ]
			//delete from invited list
			teams[ID] .invited = R .without (user .email, teams[ID] .invited)
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
	//TODO
// 	.post ('/team', impure ((ctx,next) =>
// 		go
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
					;user_team_ (user) .members = R .without ( ID_List , user_team_ (user). members )}}
			return client } )
		.then (_client => ({ ok: true, client: _client }))
		.catch (expect_ok)
		.then (respond (ctx)) ) )
	
	)
