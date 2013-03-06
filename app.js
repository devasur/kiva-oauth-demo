var express = require('express');
var app = express();

app.configure(function() {
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ secret: 'kiva has lots of secrets' }));
  app.use(app.router);
});

app.get('/', function(req, resp) {
	resp.sendfile('authenticatetokiva.html');
});

var _ = require('./demoapp.js');
var kivaoAuth = new (require('./kivaoAuth.js')).$(_.appid,_.clientid,_.clientsecret,_.scopes,_.callbackURL);
app.get('/auth/kiva', function(req,resp){
	kivaoAuth.getOAuthRequestToken(req,resp);
});
app.get('/auth/kiva/callback', 
	function (req, resp){
		kivaoAuth.getOAuthAccessToken(req,resp,function(data){
			resp.send(data);
		});
	}
);

app.listen(process.env.VCAP_APP_PORT || 3000);
console.log("Listening on port " + (process.env.VCAP_APP_PORT || 3000));
