var server = require ('./server')

var port = process .env .PORT || 8080


;server .listen (port)
;console .log ('Listening at port ' + port + '...')
