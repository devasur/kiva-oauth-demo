exports.$ = function(app_id, client_id, client_secret, _scopes, _callbackURL){
  this.version = "1.0";
  this.signatureMethod = "HMAC-SHA1";
  this.oauth = require('oauth');
  this.appid = app_id;
  this.clientid=client_id;
  this.clientsecret = client_secret;
  this.scopes = _scopes;
  this.callbackURL = _callbackURL;
  this.authurl = "https://www.kiva.org/oauth/authorize?" +
                                            "scope=" + this.scopes.toString() + 
                                            "&response_type=code" + 
                                            "&oauth_callback=" + this.callbackURL + 
                                            "&client_id=" + this.clientid;

  this.requesttokenurl = "https://api.kivaws.org/oauth/request_token";
  this.accesstokenurl = "https://api.kivaws.org/oauth/access_token";
  
  this._getProtectedResource =
  function ( access, url, callback){
    var oa = this.getNewOauth();
    oa.getProtectedResource(
        url, 
        "GET", 
        access.access_token, 
        access.access_token_secret,
        function (error, data, response) {
          callback(data);
        });

  }

  this.getNewOauth = function(){
    return        new this.oauth.OAuth(
                      this.requesttokenurl,
                      this.accesstokenurl,
                      this.clientid,
                      this.clientsecret,
                      this.version,
                      this.callbackURL,
                      this.signatureMethod);

  }

};


exports.$.prototype.getLender = function (access, callback)
{
  this._getProtectedResource(access, "https://api.kivaws.org/v1/my/lender.json",function(data){
    callback(data);
  });
};


exports.$.prototype.getEmail = function (access, callback)
{
  this._getProtectedResource(access, "https://api.kivaws.org/v1/my/email.json",function(data){
    callback(data);
  });
};

exports.$.prototype.getBalance = function (access, callback)
{
  this._getProtectedResource(access, "https://api.kivaws.org/v1/my/balance.json",function(data){
    callback(data);
  });
};

exports.$.prototype.getAccount = function (access, callback)
{
  this._getProtectedResource(access, "https://api.kivaws.org/v1/my/account.json",function(data){
    callback(data);
  });
};

exports.$.prototype.getOAuthRequestToken = 
  function(req,resp){
    var oa = this.getNewOauth();
    var kivaUrl = this.authurl;
    oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
        if (error) {
          console.log(error);
          resp.send(error.data, 500);
        } else {
          req.session.oa = oa;
          req.session.oauth_token = oauth_token;
          req.session.oauth_token_secret = oauth_token_secret;
           kivaUrl += ("&oauth_token=" + oauth_token + "&state=" + req.sessionID);
          resp.redirect(kivaUrl);
        }
     });
  };


exports.$.prototype.getOAuthAccessToken = 
  function(req,resp, callback){
  var oa = this.getNewOauth();
  var kivaoauth = this;
  oa.getOAuthAccessToken(
    req.session.oauth_token, 
    req.session.oauth_token_secret, 
    req.param('oauth_verifier'), 
    function(error, oauth_access_token, oauth_access_token_secret, results) {

      if(error) {
          console.log(error);
          resp.send(error.data, error.statusCode)
      }
      else {
        var access = {"access_token":oauth_access_token,"access_token_secret":oauth_access_token_secret};
        kivaoauth.getAccount(access,function(data){
          var account = data;
          kivaoauth.getEmail(access,function(data){
            var email = data;
            callback({"access":access,"account":account,"email":email});
          })
        })
      }
  });
};
