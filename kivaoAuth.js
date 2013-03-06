
var kivaOauth = "https://www.kiva.org/oauth";
var requesttokenurl = "https://api.kivaws.org/oauth/request_token";
var accesstokenurl = "https://api.kivaws.org/oauth/access_token";


exports.$ = function(app_id, client_id, client_secret, _scopes, _callbackURL){
  var _ = require('./myapp.js');
  this.oauth = require('oauth');
  this.version = "1.0";
  this.signatureMethod = "HMAC-SHA1";  
  this.appid = _.appid;
  this.clientid=_.clientid;
  this.clientsecret = _.clientsecret;
  this.scopes = _.scopes;
  this.callbackURL = _.callbackURL;
  this.authurl = kivaOauth + "/authorize?" +
                        "scope=" + this.scopes.toString() + 
                        "&response_type=code" + 
                        "&oauth_callback=" + this.callbackURL + 
                        "&client_id=" + this.clientid;

  
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
                      requesttokenurl,
                      accesstokenurl,
                      this.clientid,
                      this.clientsecret,
                      this.version,
                      this.callbackURL,
                      this.signatureMethod);

  }

};


var kivaApi = "https://api.kivaws.org/v1";

exports.$.prototype.getLender = function (access, callback)
{
  this._getProtectedResource(access, kivaApi + "/my/lender.json",function(data){
    callback(data);
  });
};


exports.$.prototype.getEmail = function (access, callback)
{
  this._getProtectedResource(access, kivaApi + "/my/email.json",function(data){
    callback(data);
  });
};

exports.$.prototype.getBalance = function (access, callback)
{
  this._getProtectedResource(access, kivaApi + "/my/balance.json",function(data){
    callback(data);
  });
};

exports.$.prototype.getAccount = function (access, callback)
{
  this._getProtectedResource(access, kivaApi + "/my/account.json",function(data){
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
