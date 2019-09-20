with (require ('camarche'))
with (require ('./types'))
with (require ('./aux'))
so ((_=_=>
satisfy (module
) (
serve_
( post_ ('/signup') (({ _email, _password, _user }) =>
	go
	.then (_ => {
		if (L_ .isDefined (user_by_email_ (_email))) {
			;panic ('User with this email already exists!') } } )
	.then (_ => 
		create_user ({ _email, _password, _user }) )
	.then (_id => 
		create_client (_id) ) ),
, post_ ('/login') (({ _email, _password }) =>
	go
	.then (_ =>
		user_by_login_ ({ _email, _password }) )
	.then (by (match (
		case_ (L_ .isDefined) (_user => 
			create_client (user_id_ (_user)) ),
		case_ (K) (_ => {
			;panic ('Email and password does not match!') } ) ) ) ) )
, get_ ('/email') (({ _client, _id }) =>
	go
	.then (_ => {
		if (not (client_id_ (_client))) {
			;panic ('Your session has expired!') } } )
	.then (_ => 
		id_email_ (_id) ) )
, get_ ('/user') (({ _client, _id }) =>
	go
	.then (_ => {
		if (not (client_id_ (_client))) {
			;panic ('Your session has expired!') } } )
	.then (_ => 
		id_user_ (_id) ) )
, get_ ('/team') (({ _client, _id }) =>
	go
	.then (_ => {
		if (not (client_id_ (_client))) {
			;panic ('Your session has expired!') } } )
	.then (_ => 
		id_team_ (_id) ) )
, get_ ('/user-ranking') (({ _client, _offset }) =>
	go
	.then (_ => {
		if (not (client_id_ (_client))) {
			;panic ('Your session has expired!') } } )
	.then (_ => 
		user_ranking_by_offset_ (+_offset) ) )
, get_ ('/team-ranking') (({ _client, _offset }) =>
	go
	.then (_ => {
		if (not (client_id_ (_client))) {
			;panic ('Your session has expired!') } } )
	.then (_ => 
		team_ranking_by_offset_ (+_offset) ) )
, get_ ('/client/user') (({ _client }) =>
	go
	.then (_ => {
		if (not (client_id_ (_client))) {
			;panic ('Your session has expired!') } } )
	.then (_ => 
		id_user_ (client_id_ (_client)) ) )
, post_ ('/client/user') (({ _client, _user }) =>
	go
	.then (_ => {
		if (not (client_id_ (_client))) {
			;panic ('Your session has expired!') } } )
	.then (_ => {
		;update_user (client_id_ (_client)) (_user) } ) )
, get_ ('/client/team') (({ _client }) =>
	go
	.then (_ => {
		if (not (client_id_ (_client))) {
			;panic ('Your session has expired!') } } )
	.then (_ => 
		team_by_user_ (client_user_ (_client)) ) )
, post_ ('/client/team/rename') (({ _client, _name }) =>
	go
	.then (_ => {
		if (not (client_id_ (_client))) {
			;panic ('Your session has expired!') } } )
	.then (_ => {
		var _id = user_id_ (client_user_ (_client))
		if (not (L_ .isDefined (id_captain_team (_id)) || R .endsWith ('hku.hk') (id_email_ (_id)))) {
			;panic ('You do not own a team!') } } )
	.then (_ => {
		;rename_team_ (user_id_ (client_user_ (_client))) (_name) } ) )
, get_ ('/client/step-stat') (({ _client }) =>
	go
	.then (_ => {
		if (not (client_id_ (_client))) {
			;panic ('Your session has expired!') } } )
	.then (_ => 
		id_presumed_step_stats_ (client_id_ (_client)) ) )
, post_ ('/client/step-stat') (({ _client, _step_stat }) =>
	go
	.then (_ => {
		if (not (client_id_ (_client))) {
			;panic ('Your session has expired!') } } )
	.then (_ => {
		;merge_stat (client_id_ (_client)) (_step_stat) } ) )
, get_ ('/client/invite') (({ _client }) =>
	go
	.then (_ => {
		if (not (client_id_ (_client))) {
			;panic ('Your session has expired!') } } )
	.then (_ => 
		id_inviters_ (client_id_ (_client)) ) )
, post_ ('/client/invite') (({ _client, _email }) =>
	go
	.then (_ => {
		if (not (client_id_ (_client))) {
			;panic ('Your session has expired!') } } )
	.then (_ => {
		if (email_in_team_yes (_email)) {
			;panic ('User with this email is already in a team!') } } )
	//.then (_ => {
	//	if (not (user_by_email_ (_email))) {
	//		;panic ('User with this email does not exist!') } } )
	//.then (_ => {
	//	if (L_ .isDefined (id_captain_team (id_by_email_ (_email)))) {
	//		;panic ('User with this email already has a team!') } } )
	.then (_ => {
		;invite_ (client_id_ (_client)) (_email) } ) )
, post_ ('/client/uninvite') (({ _client, _email }) =>
	suppose (
	( _id = user_id_ (client_user_ (_client))
	) =>
	go
	.then (_ => {
		if (not (client_id_ (_client))) {
			;panic ('Your session has expired!') } } )
	.then (_ => {
		if (not (L_ .isDefined (id_captain_team (_id)) || R .endsWith ('hku.hk') (id_email_ (_id)))) {
			;panic ('You do not own a team!') } } )
	.then (_ => {
		if (not (R .contains (_email) (team_invitations_ (id_presumed_team (_id))))) {
			;panic ('This user has not been invited to your team!') } } )
	.then (_ => {
		;uninvite_ (client_id_ (_client)) (_email) } ) ) )
, post_ ('/client/reject') (({ _client, _email }) =>
	go
	.then (_ => {
		if (not (client_id_ (_client))) {
			;panic ('Your session has expired!') } } )
	.then (_ => {
		if (not (user_by_email_ (_email))) {
			;panic ('User with this email does not exist!') } } )
	.then (_ => {
		if (not (R .contains (id_by_email_ (_email)) (id_inviters_ (client_id_ (_client))))) {
			;panic ('User did not invite you to his team!') } } )
	.then (_ => {
		;reject_ (client_id_ (_client)) (_email) } ) )
, post_ ('/client/accept') (({ _client, _email }) =>
	go
	.then (_ => {
		if (not (client_id_ (_client))) {
			;panic ('Your session has expired!') } } )
	.then (_ => {
		if (not (user_by_email_ (_email))) {
			;panic ('User with this email does not exist!') } } )
	.then (_ => {
		if (not (R .contains (id_by_email_ (_email)) (id_inviters_ (client_id_ (_client))))) {
			;panic ('User did not invite you to his team!') } } )
	.then (_ => {
		;accept_ (client_id_ (_client)) (_email) } ) )
, post_ ('/client/remove') (({ _client, _email }) =>
	go
	.then (_ => {
		if (not (client_id_ (_client))) {
			;panic ('Your session has expired!') } } )
	.then (_ => {
		;remove_ (client_id_ (_client)) (_email) } ) ) ) ),

where


// TODO: graphql
, id_by_email_ = _email =>
	pinpoint
	( L .entries, L .when (pinpoint (([ _, _credential ]) => pinpoint (as (credential) .email) (_credential), equals (_email)))
	, ([ _id, _ ]) => _id
	) (credentials )
, id_credential_ = lift_defined (_id =>
	pinpoint (
	_id
	) (credentials ) )
, id_user_ = lift_defined (_id => 
	pinpoint (
	_id
	) (users ) )
, id_step_stats_ = lift_defined (_id => 
	pinpoint (
	_id
	) (step_stats ) )
, id_captain_team = lift_defined (_id =>
	pinpoint (
	_id
	) (teams ) )
, id_member_team = lift_defined (_id =>
	pinpoint
	( L .values
	, L .when (L .any (equals (_id)) ([ as (team) .members, L .elems, as (mention) .id ])) 
	) (teams ) )
, id_invitations_teams = lift_defined (_id =>
	pinpoints
	( L .values
	, L .when (pinpoint
		( as (team) .invitations
		, L .any (equals (id_email_ (_id))) (L .elems) ) )
	) (teams ) )
, user_by_login_ = ({ _email, _password }) =>
	pinpoint
	( L .entries, L .when (([ _, _credential ]) => equals (_credential) (credential (_email, _password)))
	, ([ _id, _ ]) => _id
	, id_user_
	) (credentials )
, user_ranking_by_offset_ = _offset => 
	pinpoints (
	L .limit (10) (L .offset (_offset) (
		[ pinpoints (L .values, L .pick (
			{ name: _user => L .join (' ') ([ L .elems, L .when (I)]) ([ pinpoint (as (user) .first_name) (_user), pinpoint (as (user) .last_name) (_user) ]) || 'Unnamed'
			, step_count: L .sum ([ as (user) .id, id_presumed_step_stats_, as (step_stat) .by_months, L .elems, map_v_as_value, as (step_sample) .steps ]) } ) )
		, R .sortBy (({ step_count }) => -step_count)
		, L .entries
		, ([ index, { name, step_count } ]) => (
			{ rank: +index + 1
			, name, step_count } ) ] ) )
	) (users )
, team_ranking_by_offset_ = _offset => 
	pinpoints (
	L .limit (10) (L .offset (_offset) (
		[ pinpoints (L .values, L .when (pinpoint (L .count (as_users), equals (5))), L .pick (
			{ name: [ as (team) .name, L .valueOr ('Unnamed') ]
			, step_count: L .sum ([ as_users, as (mention) .id, id_presumed_step_stats_, as (step_stat) .by_months, L .elems, map_v_as_value, as (step_sample) .steps ]) } ) )
		, R .sortBy (({ step_count }) => -step_count)
		, L .entries
		, ([ index, { name, step_count } ]) => (
			{ rank: +index + 1
			, name, step_count } ) ] ) )
	) (teams )


, create_client = _id => {
	var _client = uuid ()
	while (clients [_client]) {;_client = uuid ()}
	;clients [_client] = _id
	return _client }
, create_user = ({ _email, _password, _user }) => {
	var { faculty, department, category, gender, first_name, last_name, age, height, weight } = pinpoint (as_in (user)) (_user)
	var _id = uuid ()
	;users [_id] =
		user
		( _id, faculty, department, category, gender, first_name, last_name, age, height, weight )
	;credentials [_id] = credential (_email, _password)
	return _id }
, merge_stat = _id => _step_stat => {
	;step_stats [_id] = step_stats_merge_ (_step_stat) (id_presumed_step_stats_ (_id) ) }
, update_user = _id => _unbound_user => {
	;users [_id] = L .modify ([ as_in (user), L .values ]) ((val, key) => pinpoint ([ as_in (user), key, L .valueOr (val) ]) (_unbound_user)) (id_user_ (_id)) }
, remove_ = _id => _email => {
	;teams [_id] = L .modify (as (team) .members) (L .remove ([ L .elems, L .when (pinpoint (as (mention) .id, id_email_, equals (_email))) ])) (id_team_ (_id)) }
, invite_ = _id => _email => {
	;teams [_id] = L .modify (as (team) .invitations) (L .set (L .appendTo) (_email)) (id_team_ (_id)) }
, accept_ = _id => _email => {
	;teams [id_by_email_ (_email)] = pinpoint
		( L .remove ([ as (team) .invitations, L .elems, L .when (equals (id_email_ (_id))) ])
		, L .set ([ as (team) .members, L .appendTo ]) (mention .link (_id))
		) (team_by_email_ (_email) )
	;delete teams [_id]
	;T (id_inviters_ (_id)) (R .forEach (_id => {
		;reject_ (_id) (id_email_ (_id)) } ) ) }
, reject_ = _id => _email => {
	;teams [id_by_email_ (_email)] = L .remove ([ as (team) .invitations, L .elems, L .when (equals (id_email_ (_id))) ]) (team_by_email_ (_email)) }
, uninvite_ = _id => _email => {
	;teams [_id] = L .remove ([ as (team) .invitations, L .elems, L .when (equals (_email)) ]) (id_presumed_team (_id)) }
, rename_team_ = _id => _name => {
	;teams [_id] = L .set (as (team) .name) (_name) (id_presumed_team (_id)) }



, id_email_ = _id =>
	pinpoint (
	id_credential_, as (credential) .email
	) (_id )
, id_team_ = _id =>
	pinpoint (
	L .choice
	( id_captain_team
	, id_member_team )
	) (_id )
, id_presumed_team = _id =>
	pinpoint (
	id_team_, L .valueOr (team (_id, 'Unnamed', mention .link (_id), [], []))
	) (_id )
, id_presumed_step_stats_ = _id => 
	pinpoint (
	id_step_stats_, L .valueOr (step_stat ([], [], []))
	) (_id )
, id_inviters_ = _id =>
	pinpoints (
	id_invitations_teams, L .elems, as (team) .id
	) (_id )
, user_by_email_ = _email =>
	id_user_ (id_by_email_ (_email))
, team_by_user_ = _user =>
	id_team_ (user_id_ (_user))
, team_by_email_ = _email =>
	id_team_ (id_by_email_ (_email))
, email_by_user_ = _user =>
	id_email_ (user_id_ (_user))





, client_id_ = _client => pinpoint (_client) (clients)
, client_user_ = _client => id_user_ (client_id_ (_client))
, user_id_ = pinpoint (as (user) .id)
, team_id_ = pinpoint (as (team) .id)
, team_invitations_ = pinpoint (as (team) .invitations)
, email_in_team_yes = _email =>
	not (equals (L .count (as_users) (team_by_email_ (_email))) (1))





, as_users = l_sum ([ [ as (team) .captain ], [ as (team) .members, L .elems ] ])

, user_name_ = by (_user =>
	pinpoint
	( pinpoints (l_sum ([ as (user) .first_name, as (user) .last_name ]))
	, L .join (' ') ([ L .elems, L .when (I) ])
	, L .valueOr ('Unnamed') ) )

, hour_ = _date => + (new Date (_date)) .setMinutes (0, 0, 0)
, day_ = _date => + (new Date (_date)) .setHours (0, 0, 0, 0)
, month_ = _date => + (new Date ((new Date (_date)) .setDate (1))) .setHours (0, 0, 0, 0)

, step_stats_merge_ = a => b =>
	pinpoint
	( L .modify ([ as (step_stat) .by_hours, un (L .keyed) ]) (step_sample_merge_ (pinpoint (as (step_stat) .by_hours, un (L .keyed)) (b)))
	, L .modify ([ as (step_stat) .by_days, un (L .keyed) ]) (step_sample_merge_ (pinpoint (as (step_stat) .by_days, un (L .keyed)) (b)))
	, L .modify ([ as (step_stat) .by_months, un (L .keyed) ]) (step_sample_merge_ (pinpoint (as (step_stat) .by_months, un (L .keyed)) (b)))
	) (a )
, step_sample_merge_ = a => b =>
	R .mergeWith ((_sample_1, _sample_2) => 
		pinpoint 
		( un (as_in (step_sample))
		) (R .mergeWith (R .max
			) (pinpoint (as_in (step_sample)) (_sample_1)
			) (pinpoint (as_in (step_sample)) (_sample_2) ) )
	) (a) (b )




// why is this not in aux

, uuid = _ =>
	'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx' .replace (/[xy]/g, c => 
	suppose (
	( r = Math.random() * 16 | 0
	) =>
	(c == 'x' ? r : (r & 0x3 | 0x8)) .toString (16) ) )


, map_v_as_key = L .first
, map_v_as_value = L .last

, invariant_on_ = fn => x => equals (x) (fn (x))



// server utils 

, get_ = path => flow =>  [ 'get', path, impure ((ctx, next) =>
	pinpoint (
	flow
	) (
	deserialize (ctx .query) ) .then (serialize) .then (response => {
		;ctx .body = { response } } ) ) ]
, post_ = path => flow => [ 'post', path, impure ((ctx, next) =>
	pinpoint (
	flow
	) (
	deserialize (ctx .request .body) ) .then (serialize) .then (response => {
		;ctx .body = { response } } ) ) ]
, serve_ = (... paths) =>
	server_ (_routes =>
		L .foldl ((_route, [ method, path, middleware ]) => 
			_route [method] (path, middleware)
		) (_routes) (L .elems) (paths ) )
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





// persistence

, load = name => {
	try {
		return { ... deserialize (require ('./' + name + '.json')) } }
	catch (_) {
		return {} } }
, save = name => data => {
	;require ('fs') .writeFileSync ('./' + name + '.json', JSON .stringify (serialize (data))) }





// config

, debug = true

, clients = {}
, users = load ('users')
, credentials = load ('credentials')
, teams = load ('teams')
, step_stats = load ('step-stats')
, trophies = load ('trophies')


// features

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
