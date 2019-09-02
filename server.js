with (require ('camarche'))
with (require ('./types'))
so ((_=_=>
satisfy (module
) (
server_ (routes => routes
	.post ('/signup', impure ((ctx, next) =>
		pinpoint (({ email, password, user }) =>
		go
		.then (_ =>
			user_by_email_ ({ email }) )
		.then (panic_on ([ [ _x => not (equals (undefined) (_x)), 'User with this email already exists!' ] ]))
		.then (_ => 
			create_user ({ email, password, user }) )
		.then (id => 
			create_client (id) )
		) (
		ctx .request .body ) .then (response => {
			;ctx .body = { response } } ) ) )
	.post ('/login', impure ((ctx, next) =>
		pinpoint (({ email, password }) =>
		go
		.then (_ =>
			user_by_credentials_ ({ email, password }) )
		.then (panic_on ([ [ equals (undefined), 'Email and password does not match!' ] ]))
		.then (_user => 
			create_client (user_id_ (_user)) )
		) (
		ctx .request .body ) .then (response => {
			;ctx .body = { response } } ) ) )
	.get ('/client/user', impure ((ctx, next) =>
		pinpoint (({ client }) =>
		go
		.then (_ => {
			if (not (client_id_ (client))) {
				;panic ('invalid session') } } )
		.then (_ => 
			id_user_ (client_id_ (client)) )
		) (
		ctx .query ) .then (response => {
			;ctx .body = { response } } ) ) )
	.post ('/client/user', impure ((ctx, next) => 
		pinpoint (({ client, user }) =>
		go
		.then (_ => {
			if (not (client_id_ (client))) {
				;panic ('invalid session') } } )
		.then (_ => {
			;update_user (client_id_ (client)) (user) } )
		) (
		ctx .request .body ) .then (response => {
			;ctx .body = { response } } ) ) )
	.get ('/client/step-stat', impure ((ctx, next) =>
		pinpoint (({ client }) =>
		go
		.then (_ => {
			if (not (client_id_ (client))) {
				;panic ('invalid session') } } )
		.then (_ => 
			id_steps_ (client_id_ (client)) )
		) (
		ctx .query ) .then (response => {
			;ctx .body = { response } } ) ) )
	.post ('/client/step-stat', impure ((ctx, next) => 
		pinpoint (({ client, step_stat }) =>
		go
		.then (_ => {
			if (not (client_id_ (client))) {
				;panic ('invalid session') } } )
		.then (_ => 
			merge_stat (client_id_ (client)) (step_stats) ) // TODO: merge by max
		) (
		ctx .request .body ) .then (response => {
			;ctx .body = { response } } ) ) )
	.get ('/client/team', impure ((ctx, next) =>
		pinpoint (({ client }) =>
		go
		.then (_ => {
			if (not (client_id_ (client))) {
				;panic ('invalid session') } } )
		.then (_ => 
			team_by_user_ (client_user_ (client)) )
		) (
		ctx .query ) .then (response => {
			;ctx .body = { response } } ) ) )
	.get ('/client/invite', impure ((ctx, next) => 
		pinpoint (({ client }) =>
		go
		.then (_ => {
			if (not (client_id_ (client))) {
				;panic ('invalid session') } } )
		.then (_ => {
			;id_invites_ (client_id_ (client)) } )
		) (
		ctx .query ) .then (response => {
			;ctx .body = { response } } ) ) )
	.post ('/client/invite', impure ((ctx, next) => 
		pinpoint (({ client, email }) =>
		go
		.then (_ => {
			if (not (client_id_ (client))) {
				;panic ('invalid session') } } )
		.then (_ => {
			if (not (user_by_email_ (email))) {
				;panic ('User with this email does not exist!') } } )
		.then (_ => {
			if (team_by_user_ (user_by_email_ (email))) {
				;panic ('User with this email already has a team!') } } )
		.then (_ => {
			;invite_ (client_id_ (client)) (email) } )
		) (
		ctx .request .body ) .then (response => {
			;ctx .body = { response } } ) ) )
	.post ('/client/accept', impure ((ctx, next) => 
		pinpoint (({ client, email }) =>
		go
		.then (_ => {
			if (not (client_id_ (client))) {
				;panic ('invalid session') } } )
		.then (_ => {
			if (not (user_by_email_ (email))) {
				;panic ('User with this email does not exist!') } } )
		.then (_ => {
			if (not (R .contains (user_id_ (user_by_email_ (email))) (id_invites_ (client_id_ (client))))) {
				;panic ('User did not invite you to his team!') } } )
		.then (_ => {
			;accept_ (client_id_ (client)) (email) } )
		) (
		ctx .request .body ) .then (response => {
			;ctx .body = { response } } ) ) )
	) ),

where


, create_user = ({ email, password, user: _user }) => {
	var { role, first_name, last_name, gender, age, height, weight, faculty, department } = _user
	var id = uuid ()
	;users [id] =
		user
		( id, faculty, department, category, gender, first_name, last_name, age, height, weight )
	;credentials [id] = { email, password }
	return id }
, create_steps = id => {
	;step_stats [id] = step_stat ([], [], []) }


, merge_stat = _id => _step_stat => {
	;step_stats [_id] = pinpoint
		( L .modify (as (step_stat) .by_hours, as_in (step_sample)) (R .mergeWith (R .max) (pinpoint (as (step_stat) .by_hours, as_in (step_sample)) (_step_stat)))
		, L .modify (as (step_stat) .by_days, as_in (step_sample)) (R .mergeWith (R .max) (pinpoint (as (step_stat) .by_days, as_in (step_sample)) (_step_stat)))
		, L .modify (as (step_stat) .by_months, as_in (step_sample)) (R .mergeWith (R .max) (pinpoint (as (step_stat) .by_months, as_in (step_sample)) (_step_stat)))
		) (id_steps_ (_id) ) }
, update_user = id => _user => {
	;users [id] = L .modify (L .values) ((val, key) => _user [key] || val) (users [id]) }
, invite_ = id => _email => {
	var invited_id = user_by_email_ (_email)
	;invites [invited_id] = pinpoint (L .valueOr ([]), ([ ... invites ]) => [ ... invites, id ]) (invites [invited_id]) }
, accept_ = id => _email => {
	var inviter_id = user_by_email_ (_email)
	;invites [id] = []
	;teams [inviter_id] = [ ... (teams [inviter_id] || [ inviter_id ]), id ] }


, hour_ = _date => + (new Date (_date)) .setMinutes (0, 0, 0)
, day_ = _date => + (new Date (_date)) .setHours (0, 0, 0, 0)
, month_ = _date => + (new Date ((new Date (_date)) .setDate (1))) .setHours (0, 0, 0, 0)


, user_by_credentials_ = ({ email, password }) =>
	pinpoint (
	pinpoint
	( L .entries, L .when (([ _, _credentials ]) => equals (_credentials) ({ email, password }))
	, ([ _id, _ ]) => _id
	) (credentials )
	|| L .zero
	) (users )
, user_by_email_ = ({ email }) =>
	pinpoint (
	pinpoint
	( L .entries, L .when (([ _, { email: _email } ]) => equals (_email) (email))
	, ([ _id, _ ]) => _id
	) (credentials )
	|| L .zero
	) (users )
, team_by_user_ = _user =>
	pinpoint
	( user_id_ (_user) || K ()
	, L .valueOr (
		team (_user, [], []) )
	) (
	teams )

, id_user_ = id => users [id]
, id_steps_ = id => 
	pinpoint
	( id
	, L .valueOr (
		step_stat ([], [], []) )
	) (
	step_stats )

, id_invites_ = id =>
	pinpoints
	( L .values
	, L .when (pinpoint
		( as (team) .invitations
		, L .any (pinpoint (as (user) .id, equals (id))) (L .elems) ) )
	, as (team) .captain
	, as (user) .id
	) (team )

, user_id_ = pinpoint (as (user) .id)


, create_client = _id => {
	var _client = uuid ()
	while (clients [_client]) {;_client = uuid ()}
	;clients [_client] = { id: _id }
	return _client }
, client_id_ = client => clients [client] .id
, client_user_ = client => id_user_ (client_id_ (client))




, server_ = routes =>
	require ('koa-qs') (new (require ('koa')))
		.use (require ('koa-compress') ())
		.use (require ('koa-cors') ())
		.use (impure ((ctx, next) =>
			go .then (next)
			.catch ((err) => {
				;console .error (err)
				
				;ctx .type = 'application/json'
				;ctx .status = /*err .code || */500
				;ctx .body = { error: err .reason || err .message }
				if (debug) {
					;ctx .body .stack = err .stack } }) ))
		.use (require ('koa-morgan') ('combined'))
		.use (require ('koa-bodyparser') ({ strict : false }))
		.use (require ('koa-json') ())
		.use (routes (require ('koa-router') ()) .routes ())



, load = name => {
	try {
		return require ('./' + name + '.json') }
	catch (_) {
		return {} } }
, save = name => data => {
	;require ('fs') .writeFileSync ('./' + name + '.json', JSON .stringify (data)) }



, uuid = _ =>
	'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx' .replace (/[xy]/g, c => 
	suppose (
	( r = Math.random() * 16 | 0
	) =>
	(c == 'x' ? r : (r & 0x3 | 0x8)) .toString (16) ) )



, debug = true

, clients = {}
, users = load ('users')
, credentials = load ('credentials')
, teams = load ('teams')
, step_stats = load ('step-stats')
, trophies = load ('trophies')

, $__persistence = jinx (_ => {
	;setInterval (_ => {
		;save ('users') (users)
		;save ('credentials') (credentials)
		;save ('teams') (teams)
		;save ('step-stats') (step_stats)
		;save ('trophies') (trophies) }
	, 5 * 60 * 1000)
	} )

	)=>_)
