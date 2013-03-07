var express = require('express');
var app = express();

app.configure(function() {
  app.use(express.static(__dirname + '/public'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ secret: 'kiva has lots of secrets' }));
  app.use(app.router);
});

app.get('/', function(req, resp) {
	if(req.session.user == undefined){
		resp.sendfile(__dirname  + '/public/authenticatetokiva.html');
	}
	else{
		resp.sendfile(__dirname  + '/public/checkstuff.html')
	}
});

app.get('/logout', function(req, resp) {
	delete(req.session.user);
	resp.redirect('/');
});

var kivaoAuth = new (require('./kivaoAuth.js')).$();

app.get('/auth/kiva', function(req,resp){
	if(req.session.user == undefined){
		kivaoAuth.getOAuthRequestToken(req,resp);
	}
	else{
		console.log("User Already Logged in")
		resp.sendfile(__dirname  + '/public/checkstuff.html')
	}

});

app.get('/welcome',function(req,resp){
	if(req.session.user == undefined){
		resp.send("Not authorized",401);
		return;
	}
	var user = req.session.user.user_account;
	resp.send({'message': user.first_name + " " + user.last_name})
})

app.get('/balance',function(req,resp){
		if(req.session.user == undefined){
			resp.send("Not authorized",401);
			return;
		}
		console.log(req.session.user.access);
		kivaoAuth.getBalance(req.session.user.access,function(data){
			console.log(data);
			resp.send(data);
		});
})

app.get('/auth/kiva/callback', 
	function (req, resp){
		kivaoAuth.getOAuthAccessToken(req,resp,function(data){
			req.session.user = data;
			resp.sendfile(__dirname  + '/public/checkstuff.html')
		});
	}
);

app.listen(process.env.VCAP_APP_PORT || 3000);
console.log("Listening on port " + (process.env.VCAP_APP_PORT || 3000));
