var express = require('express');
var app = express();
var kivacrypt = require('./kivacrypt.js');

var access_tokens = [];

app.configure(function() {
  app.use(express.static(__dirname + '/public'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ secret: 'kiva has lots of secrets' }));
  app.use(app.router);
});



function isAccessSet(req){
	if(!getUser(req)){
		return false;
	}
	return true;
}

function getUser(req){
	var key = req.cookies._appversion55667654;
	if(!key) return null;
	return access_tokens[kivacrypt.decrypt(key)];
}

function deleteUser(req){
	var key = req.cookies._appversion55667654;
	if(!key) return;
	delete(access_tokens[kivacrypt.decrypt(key)]);
}

app.get('/', function(req, resp) {
	if(!isAccessSet(req)){
		resp.sendfile(__dirname  + '/public/authenticatetokiva.html');
	}
	else{
		resp.sendfile(__dirname  + '/public/checkstuff.html')
	}
});

app.get('/logout', function(req, resp) {
	deleteUser(req);
	resp.redirect('/');
});

var kivaoAuth = new (require('./kivaoAuth.js')).$();

app.get('/auth/kiva', function(req,resp){
	if(!isAccessSet(req)){
		kivaoAuth.getOAuthRequestToken(req,resp);
	}
	else{
		resp.sendfile(__dirname  + '/public/checkstuff.html')
	}

});

app.get('/welcome',function(req,resp){
	if(!isAccessSet(req)){
		resp.send("Not authorized",401);
		return;
	}
	var user = getUser(req).user_account;
	resp.send({'message': user.first_name + " " + user.last_name})
})

app.get('/balance',function(req,resp){
		if(!isAccessSet(req)){
			resp.send("Not authorized",401);
			return;
		}
		//console.log(req.session.user.access);
		kivaoAuth.getBalance(getUser(req).access,function(data){
			//console.log(data);
			resp.send(data);
		});
})

app.get('/auth/kiva/callback', 
	function (req, resp){
		kivaoAuth.getOAuthAccessToken(req,resp,function(data){
			var id = data.user_account.lender_id;
			access_tokens[id] = data;
			var crypted = kivacrypt.encrypt(id);
			resp.cookie('_appversion55667654', crypted, {maxAge: 60 * 60 * 24 * 365 * 1000, httpOnly: true});
			resp.sendfile(__dirname  + '/public/checkstuff.html')
		});
	}
);

app.listen(process.env.VCAP_APP_PORT || 3000);
console.log("Listening on port " + (process.env.VCAP_APP_PORT || 3000));
