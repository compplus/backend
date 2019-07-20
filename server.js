var R = require ('ramda')

var debug = true



var go = Promise .resolve ()
var suppose = fn_form => fn_form ()
var equals = x => y => R .equals (x) (y)
var impure = dirty_f => x => {;dirty_f (x)}
var fixed = fn => x =>
	suppose (
	( y = fn (x)
	) =>
	!! equals (x) (y) ? x
	? fixed (fn) (y) )










var users = []
var trophies = {}

var create_user = user => {
	var { username, role, email, password, first_name, last_name, gender, age, height, weight, faculty, department } = user
	user =
	{ username, role, email, password, first_name, last_name, gender, age, height, weight, faculty, department
	, stats: [] }
	;users = [ ... users, user ] }
var create_stat = user => stat => {
	var { timestamp, distance, calories, steps } = stat
	stat = { timestamp, distance, calories, steps }
	;user .stats = [ ... user .stats, stat ] }


var find_user = ({ username, password }) =>
	R .find (({ _username, _password }) => R .and (equals (username) (_username)) (equals (password) (_password))
	) (
	users )
var find_stats = user => 
	user .stats


var clients = {}

var create_client = ({ username, password }) => {
	var _user = find_user ({ username, password })
	if (_user) {
		var _client = uuid ()
		while (clients [_client]) {;_client = uuid ()}
		;clients [_client] = { user: _user, ok: false }
		return _client } }
var client_user = client => clients [client]

var uuid = _ =>
	'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx' .replace (/[xy]/g, c => 
	suppose (
	( r = Math.random() * 16 | 0
	) =>
	(c == 'x' ? r : (r & 0x3 | 0x8)) .toString (16) ) )



var expect_ok = _error => {
	;console .error (_error)
  
	return { error: 'An unexpected error occured' } }
var respond = _x => {;ctx .body = _x}

var server_ = routes =>
	require ('koa-qs') (new (require ('koa')))
		.use (require ('koa-compress') ())
		.use (require ('koa-cors') ())
		.use (impure ((ctx, next) =>
			next ()
			.catch ((err) => {
				;console .error (err)
				
				;ctx .type = 'application/json'
				;ctx .status = /*err .code || */500
				//;; ctx .message = err .message || 'Internal Server Error'
				;ctx .body = { error : err .message }
				if (debug) {
					;ctx .body .stack = err .stack } }) ))
		.use (require ('koa-morgan') ('combined'))
		.use (require ('koa-bodyparser') ({ strict : false }))
		.use (require ('koa-json') ())
		.use (routes (require ('koa-router') ()) .routes ())


module .exports = server_ (routes => routes
	.post ('/any/signup', impure ((ctx, next) =>
		go
		.then (_ => {
			var { username, role, email, password, first_name, last_name, gender, age, height, weight, faculty, department } = ctx .request .body
			
			;create_user ({ username, role, email, password, first_name, last_name, gender, age, height, weight, faculty, department })
			;return create_client ({ username, password }) })
		.then (_client => ({ ok : true, client : _client }))
		.catch (expect_ok)
		.then (respond) ) )
	.post ('/any/login', impure ((ctx, next) =>
		go
		.then (_ => {
			var { username, password } = ctx .request .body
			
			;return create_client ({ username, password }) })
		.then (_client => ({ ok : _client === undefined, client : _client }))
		.catch (expect_ok)
		.then (respond) ) )
	.get ('/stats', impure ((ctx, next) =>
		go
		.then (_ => {
			var { client } = ctx .query

			return find_stats (client_user (client)) })
		.then (_stats => ({ ok : _stats === undefined, stats : _stats }))
		.catch (expect_ok)
		.then (respond) ) )
	.post ('/stats', impure ((ctx, next) => 
		go
		.then (_ => {
			var { client, timestamp, distance, calories, steps } = ctx .query

			;return create_stat (client_user (client)) ({ timestamp, distance, calories, steps }) })
		.then (_ => ({ ok : true }))
		.catch (expect_ok)
		.then (respond) ) )
	.post ('/update', impure ((ctx, next) =>
		go
		.then (_ => {
			var { username, role, email, password, first_name, last_name, gender, age, height, weight, faculty, department } = ctx .request .body
			
			current_user = find_user ({ username, password }) 
			//delete the user
			users = R.remove(({ user, current_user }) => user === current_user, users)
			//find the info that is updated
			if (username != null) {current_user.username = username}
			if (role != null) {current_user.role = role}
			if (email != null) {current_user.email = email}
			if (password != null) {current_user.password = password}
			if (first_name != null) {current_user.first_name = first_name}
			if (last_name != null) {current_user.last_name = last_name}
			if (gender != null) {current_user.gender = gender}
			if (age != null) {current_user.age = age}
			if (height != null) {current_user.height = height}
			if (weight != null) {current_user.weight = weight}
			if (faculty != null) {current_user.faculty = faculty}
			if (department != null) {current_user.department = department}
			//create the new user with the updated info
			;create_user ({ username, role, email, password, first_name, last_name, gender, age, height, weight, faculty, department })
			;return create_client ({ username, password }) })
		.then (_client => ({ ok : true, client : _client }))
		.catch (expect_ok)
		.then (respond) ) )
)
