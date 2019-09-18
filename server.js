with (require ('camarche'))
with (require ('./types'))
with (require ('./aux'))
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
		deserialize (ctx .request .body) ) .then (serialize) .then (response => {
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
		deserialize (ctx .request .body) ) .then (serialize) .then (response => {
			;ctx .body = { response } } ) ) )
	.get ('/email', impure ((ctx, next) =>
		pinpoint (({ client, id }) =>
		go
		.then (_ => {
			if (not (client_id_ (client))) {
				;panic ('invalid session') } } )
		.then (_ => 
			id_email_ (id) )
		) (
		deserialize (ctx .query) ) .then (serialize) .then (response => {
			;ctx .body = { response } } ) ) )
	.get ('/user', impure ((ctx, next) => 
		pinpoint (({ client, id }) =>
		go
		.then (_ => {
			if (not (client_id_ (client))) {
				;panic ('invalid session') } } )
		.then (_ => 
			id_user_ (id) )
		) (
		deserialize (ctx .query) ) .then (serialize) .then (response => {
			;ctx .body = { response } } ) ) )
	.get ('/team', impure ((ctx, next) => 
		pinpoint (({ client, id }) =>
		go
		.then (_ => {
			if (not (client_id_ (client))) {
				;panic ('invalid session') } } )
		.then (_ => 
			id_team_ (id) )
		) (
		deserialize (ctx .query) ) .then (serialize) .then (response => {
			;ctx .body = { response } } ) ) )
	.get ('/user-ranking', impure ((ctx, next) => 
		pinpoint (({ client, offset }) =>
		go
		.then (_ => {
			if (not (client_id_ (client))) {
				;panic ('invalid session') } } )
		.then (_ => 
			user_ranking_by_offset_ (+offset) )
		) (
		deserialize (ctx .query) ) .then (serialize) .then (response => {
			;ctx .body = { response } } ) ) )
	.get ('/team-ranking', impure ((ctx, next) => 
		pinpoint (({ client, offset }) =>
		go
		.then (_ => {
			if (not (client_id_ (client))) {
				;panic ('invalid session') } } )
		.then (_ => 
			team_ranking_by_offset_ (+offset) )
		) (
		deserialize (ctx .query) ) .then (serialize) .then (response => {
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
		deserialize (ctx .query) ) .then (serialize) .then (response => {
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
		deserialize (ctx .request .body) ) .then (serialize) .then (response => {
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
		deserialize (ctx .query) ) .then (serialize) .then (response => {
			;ctx .body = { response } } ) ) )
	.post ('/client/team/name', impure ((ctx, next) =>
		pinpoint (({ client, name }) =>
		go
		.then (_ => {
			if (not (client_id_ (client))) {
				;panic ('invalid session') } } )
		.then (_ => {
			if (L_ .isDefined (id_in_team_ (user_id_ (client_user_ (client))))) {
				;panic ('You do not own a team!') } } )
		.then (_ => {
			if (not (R .endsWith ('hku.hk') (id_email_ (user_id_ (client_user_ (client)))))) {
				;panic ('You do not own a team!') } } )
		.then (_ => {
			name_team_ (team_by_user_ (client_user_ (client))) (name) } )
		) (
		deserialize (ctx .request .body) ) .then (serialize) .then (response => {
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
		deserialize (ctx .query) ) .then (serialize) .then (response => {
			;ctx .body = { response } } ) ) )
	.post ('/client/step-stat', impure ((ctx, next) => 
		pinpoint (({ client, step_stat }) =>
		go
		.then (_ => {
			if (not (client_id_ (client))) {
				;panic ('invalid session') } } )
		.then (_ => 
			merge_stat (client_id_ (client)) (step_stat) )
		) (
		deserialize (ctx .request .body) ) .then (serialize) .then (response => {
			;ctx .body = { response } } ) ) )
	.get ('/client/invite', impure ((ctx, next) => 
		pinpoint (({ client }) =>
		go
		.then (_ => {
			if (not (client_id_ (client))) {
				;panic ('invalid session') } } )
		.then (_ => 
			invite_ids (client_id_ (client)) )
		) (
		deserialize (ctx .query) ) .then (serialize) .then (response => {
			;ctx .body = { response } } ) ) )
	.post ('/client/invite', impure ((ctx, next) => 
		pinpoint (({ client, email }) =>
		go
		.then (_ => {
			if (not (client_id_ (client))) {
				;panic ('invalid session') } } )
		.then (_ => {
			if (email_in_team_yes (email)) {
				;panic ('User with this email is already in a team!') } } )
		//.then (_ => {
		//	if (not (user_by_email_ (email))) {
		//		;panic ('User with this email does not exist!') } } )
		//.then (_ => {
		//	if (invariant_on_ (pinpoint (team_by_user_, as (team) .captain)) (user_by_email_ (email))) {
		//		;panic ('User with this email already has a team!') } } )
		.then (_ => {
			;invite_ (client_id_ (client)) (email) } )
		) (
		deserialize (ctx .request .body) ) .then (serialize) .then (response => {
			;ctx .body = { response } } ) ) )
	.post ('/client/accept', impure ((ctx, next) => 
		pinpoint (({ client, email }) =>
		go
		.then (_ => {
			if (not (client_id_ (client))) {
				;panic ('invalid session') } } )
		.then (_ => {
			if (not (user_by_email_ ({ email }))) {
				;panic ('User with this email does not exist!') } } )
		.then (_ => {
			if (not (R .contains (user_id_ (user_by_email_ ({ email }))) (invite_ids (client_id_ (client))))) {
				;panic ('User did not invite you to his team!') } } )
		.then (_ => {
			;accept_ (client_id_ (client)) (email) } )
		) (
		deserialize (ctx .request .body) ) .then (serialize) .then (response => {
			;ctx .body = { response } } ) ) )
	.post ('/client/reject', impure ((ctx, next) => 
		pinpoint (({ client, email }) =>
		go
		.then (_ => {
			if (not (client_id_ (client))) {
				;panic ('invalid session') } } )
		.then (_ => {
			if (not (user_by_email_ ({ email }))) {
				;panic ('User with this email does not exist!') } } )
		.then (_ => {
			if (not (R .contains (user_id_ (user_by_email_ ({ email }))) (invite_ids (client_id_ (client))))) {
				;panic ('User did not invite you to his team!') } } )
		.then (_ => {
			;reject_ (client_id_ (client)) (email) } )
		) (
		deserialize (ctx .request .body) ) .then (serialize) .then (response => {
			;ctx .body = { response } } ) ) )
	.post ('/client/uninvite', impure ((ctx, next) => 
		pinpoint (({ client, email }) =>
		go
		.then (_ => {
			if (not (client_id_ (client))) {
				;panic ('invalid session') } } )
		.then (_ => {
			if (email_in_team_yes (id_email_ (user_id_ (client_user_ (client))))) {
				;panic ('You do not own a team!') } } )
		.then (_ => {
			if (not (R .endsWith ('hku.hk') (id_email_ (user_id_ (client_user_ (client)))))) {
				;panic ('You do not own a team!') } } )
		.then (_ => {
			if (not (R .contains (email) (team_invitations (id_team_ (user_id_ (client_user_ (client))))))) {
				;panice ('This user has not been invited to your team!') } } )
		.then (_ => {
			;uninvite_ (client_id_ (client)) (email) } )
		) (
		deserialize (ctx .request .body) ) .then (serialize) .then (response => {
			;ctx .body = { response } } ) ) )
	.post ('/client/remove', impure ((ctx, next) => 
		pinpoint (({ client, email }) =>
		go
		.then (_ => {
			if (not (client_id_ (client))) {
				;panic ('invalid session') } } )
		.then (_ => {
			;remove_ (client_id_ (client)) (email) } )
		) (
		deserialize (ctx .request .body) ) .then (serialize) .then (response => {
			;ctx .body = { response } } ) ) )
	) ),

where


, create_user = ({ email, password, user: _user }) => {
	var { faculty, department, category, gender, first_name, last_name, age, height, weight } = pinpoint (as_in (user)) (_user)
	var id = uuid ()
	;users [id] =
		user
		( id, faculty, department, category, gender, first_name, last_name, age, height, weight )
	;credentials [id] = credential (email, password)
	return id }
, create_steps = id => {
	;step_stats [id] = step_stat ([], [], []) }


, merge_stat = _id => _step_stat => {
	;step_stats [_id] = pinpoint
		( L .modify ([ as (step_stat) .by_hours, un (L .keyed) ]) (_merge_step_sample (pinpoint (as (step_stat) .by_hours, un (L .keyed)) (_step_stat)))
		, L .modify ([ as (step_stat) .by_days, un (L .keyed) ]) (_merge_step_sample (pinpoint (as (step_stat) .by_days, un (L .keyed)) (_step_stat)))
		, L .modify ([ as (step_stat) .by_months, un (L .keyed) ]) (_merge_step_sample (pinpoint (as (step_stat) .by_months, un (L .keyed)) (_step_stat)))
		) (id_steps_ (_id) ) }
, update_user = id => _user => {
	;users [id] = L .modify ([ as_in (user), L .values ]) ((val, key) => pinpoint ([ as_in (user), key, L .valueOr (val) ]) (_user)) (id_user_ (id)) }
, remove_ = id => _email => {
	;teams [id] = L .modify (as (team) .members) (L .remove ([ L .elems, L .when (pinpoint (as (mention) .id, id_email_, equals (_email))) ])) (id_team_ (id)) }
, invite_ = id => _email => {
	;teams [id] = L .modify (as (team) .invitations) (L .set (L .appendTo) (_email)) (id_team_ (id)) }
, accept_ = id => _email => {
	;teams [id_by_email_ (_email)] = pinpoint
		( L .remove ([ as (team) .invitations, L .elems, L .when (equals (id_email_ (id))) ])
		, L .set ([ as (team) .members, L .appendTo ]) (mention .link (id))
		) (team_by_email_ (_email) )
	;delete teams [id]
	;T (invite_ids (id)) (R .forEach (_id => {
		;reject_ (id) (id_email_ (_id)) } ) ) }
, reject_ = id => _email => {
	;teams [id_by_email_ (_email)] = pinpoint
		( L .remove ([ as (team) .invitations, L .elems, L .when (equals (id_email_ (id))) ])
		) (team_by_email_ (_email) ) }
, uninvite_ = id => _email => {
	;teams [id] = pinpoint
		( L .remove ([ as (team) .invitations, L .elems, L .when (equals (_email)) ])
		) (id_team_ (id)) }
, name_team_ = _team => _name => {
	;teams [team_id_ (_team)] = pinpoint (
		L .set (as (team) .name) (_name)
		) (_team ) }

, _merge_step_sample = R .mergeWith ((_sample_1, _sample_2) => pinpoint (un (as_in (step_sample))) (R .mergeWith (R .max) (pinpoint (as_in (step_sample)) (_sample_1)) (pinpoint (as_in (step_sample)) (_sample_2))))

, hour_ = _date => + (new Date (_date)) .setMinutes (0, 0, 0)
, day_ = _date => + (new Date (_date)) .setHours (0, 0, 0, 0)
, month_ = _date => + (new Date ((new Date (_date)) .setDate (1))) .setHours (0, 0, 0, 0)


, id_by_email_ = _email =>
	pinpoint
	( L .entries, L .when (pinpoint (([ _, _credential ]) => pinpoint (as (credential) .email) (_credential), equals (_email)))
	, ([ _id, _ ]) => _id
	) (credentials )
, user_by_credentials_ = ({ email, password }) =>
	pinpoint
	( L .entries, L .when (([ _, _credential ]) => equals (_credential) (credential (email, password)))
	, ([ _id, _ ]) => _id
	, id_user_
	) (credentials )
, user_by_email_ = ({ email }) =>
	id_user_ (id_by_email_ (email))
, team_by_user_ = _user =>
	pinpoint (user_id_, L .when (I), id_team_) (_user)
, team_by_email_ = _email =>
	id_team_ (id_by_email_ (_email))
, email_by_user_ = _user =>
	email_by_id_ (user_id_ (_user))
, email_by_id_ = _id =>
	pinpoint
	( _id || K (), as (credential) .email
	) (credentials )

, id_user_ = id => 
	pinpoint
	( id || K ()
	) (users )
, id_own_team_ = id =>
	pinpoint 
	( id || K ()
	) (teams )
, id_in_team_ = id =>
	pinpoint (
	L .values
	, L .when (L .any (equals (id)) ([ as (team) .members, L .elems, as (mention) .id ])) 
	) (teams )
, id_team_ = id =>
	pinpoint
	( pinpoint (L .choice
		( id || K ()
		, [ L .values, L .when (L .any (equals (id))
			([ as (team) .members, L .elems, as (mention) .id ]) ) ] ) )
	, L .valueOr (
		team (id, 'Unnamed', mention .link (id), [], []) )
	) (teams )
, id_steps_ = id => 
	pinpoint
	( id || K ()
	, L .valueOr (
		step_stat ([], [], []) )
	) (step_stats )

, invite_ids = id =>
	pinpoints
	( L .values
	, L .when (pinpoint
		( as (team) .invitations
		, L .any (equals (email_by_id_ (id))) (L .elems) ) )
	, as (team) .id
	) (teams )
, team_invitations = pinpoint (as (team) .invitations)

, id_email_ = id =>
	pinpoint
	( id || K (), as (credential) .email
	) (credentials )

, user_id_ = pinpoint (as (user) .id)
, team_id_ = pinpoint (as (team) .id)

, email_in_team_yes = _email =>
	not (equals (L .count (as_users) (team_by_email_ (_email))) (1))


, create_client = _id => {
	var _client = uuid ()
	while (clients [_client]) {;_client = uuid ()}
	;clients [_client] = { id: _id }
	return _client }
, client_id_ = _client => pinpoint (_client, 'id') (clients)
, client_user_ = _client => id_user_ (client_id_ (_client))


, as_users = l_sum ([ [ as (team) .captain ], [ as (team) .members, L .elems ] ])

, user_ranking_by_offset_ = _offset => 
	pinpoints (
	L .limit (10) (L .offset (_offset) (
		[ pinpoints (L .values, L .pick (
			{ name: _user => L .join (' ') ([ L .elems, L .when (I)]) ([ pinpoint (as (user) .first_name) (_user), pinpoint (as (user) .last_name) (_user) ]) || 'Unnamed'
			, step_count: L .sum ([ as (user) .id, id_steps_, as (step_stat) .by_months, L .elems, map_v_as_value, as (step_sample) .steps ]) } ) )
		, R .sortBy (pinpoint ('step_count', R .negate))
		, L .indexed
		, L .elems
		, ([ index, { name, step_count } ]) => ({ rank: index + 1, name, step_count }) ] ) )
	) (users )

, team_ranking_by_offset_ = _offset => 
	pinpoints (
	L .limit (10) (L .offset (_offset) (
		[ pinpoints (L .values, L .when (pinpoint (L .count (as_users), equals (5))), L .pick (
			{ name: [ as (team) .name, L .valueOr ('Unnamed') ]
			, step_count: L .sum ([ as_users, as (mention) .id, id_steps_, as (step_stat) .by_months, L .elems, map_v_as_value, as (step_sample) .steps ]) } ) )
		, R .sortBy (pinpoint ('step_count', R .negate))
		, L .indexed
		, L .elems
		, ([ index, { name, step_count } ]) => ({ rank: index + 1, name, step_count }) ] ) )
	) (teams )





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
		return { ... deserialize (require ('./' + name + '.json')) } }
	catch (_) {
		return {} } }
, save = name => data => {
	;require ('fs') .writeFileSync ('./' + name + '.json', JSON .stringify (serialize (data))) }



, uuid = _ =>
	'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx' .replace (/[xy]/g, c => 
	suppose (
	( r = Math.random() * 16 | 0
	) =>
	(c == 'x' ? r : (r & 0x3 | 0x8)) .toString (16) ) )


, map_v_as_key = L .first
, map_v_as_value = L .last

, invariant_on_ = fn => x => equals (x) (fn (x))


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
