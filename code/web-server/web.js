import fs            from 'fs'
import path          from 'path'
import http          from 'http'
import https         from 'https'
import os            from 'os'
import url           from 'url'
import socket_io     from 'socket.io'
import log           from './log'
import configuration from '../configuration'

import koa         from 'koa'
import session     from 'koa-session'
// https://github.com/Chilledheart/koa-session-redis
// import cors        from 'kcors'
// import csrf        from 'koa-csrf'
// import body_parser from 'koa-body-parsers'
import compress    from 'koa-compress'
import statics     from 'koa-static-cache'
import koa_logger  from 'koa-bunyan'
import koa_proxy   from 'koa-proxy'
import mount       from 'koa-mount'

// https://github.com/chentsulin/koa-graphql

// https://github.com/koa-modules/locale

const web = koa()

web.use(koa_logger(log,
{
	// which level you want to use for logging?
	// default is info
	level: 'debug',
	// this is optional. Here you can provide request time in ms,
	// and all requests longer than specified time will have level 'warn'
	timeLimit: 100
}))

// хз, нужно ли сжатие в node.js: мб лучше поставить впереди nginx'ы, 
// и ими сжимать, чтобы не нагружать процесс node.js
web.use(compress())

// serve static files
web.use(mount('/assets', statics(path.join(Root_folder, 'build', 'assets'), 
{
	maxAge  : 365 * 24 * 60 * 60,
	gzip    : true,
	dynamic : true
})))

// if it's not a static file url:

// Proxy /api requests to API server
web.use(mount('/api', koa_proxy({ host: `http://${configuration.api_server.http.host}:${configuration.api_server.http.port}` })))

// Proxy /images requests to Image server
web.use(mount('/upload_image', koa_proxy({ host: `http://${configuration.image_server.http.host}:${configuration.image_server.http.port}` })))

// Proxy all the rest requests to Webpage rendering server
web.use(koa_proxy({ host: `http://${configuration.webpage_server.http.host}:${configuration.webpage_server.http.port}` }))

// // log all errors
// web.on('error', function(error, context)
// {
// 	log.error(error, context)
// })

// // websocket server
// const websocket = socket_io.listen(http_web_server)
// // don't serve client scripts
// websocket.serveClient(false)

// websocket.on('connection', socket =>
// {
// 	socket.emit('news', { message: `'Hello World!' from server` })
// 	socket.on('something', data =>
// 	{
// 		log.info(data)
// 	})
// })

// http server
const http_web_server = http.createServer()

// enable Koa for handling http requests
http_web_server.on('request', web.callback())

// copy-pasted from 
// https://github.com/koajs/koala/blob/master/lib/app.js
//
// "Expect: 100-continue" is something related to http request body parsing
// http://crypto.pp.ua/2011/02/mexanizm-expectcontinue/

// const koa_callback = web.callback()
// http_web_server.on('request', koa_callback)
// http_web_server.on('checkContinue', function(request, response)
// {
// 	// requests with `Expect: 100-continue`
// 	request.checkContinue = true
// 	koa_callback(request, response)
// })

// поднять http сервер
http_web_server.listen(configuration.webserver.http.port, error =>
{
	if (error)
	{
		return log.error(error)
	}

	log.info(`Web server is listening`)
	log.info(`Now go to http://${configuration.webserver.http.host}:${configuration.webserver.http.port}`)
})

export default web