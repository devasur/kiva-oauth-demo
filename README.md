Demo for Kiva oAuth
===================

This application demonstrates how to use node-oauth to authorize access for protected APIs on Kiva.  The target application is a demo app registered on Kiva for Demo purpose only.  It has a dummy callback url (http://test.bonigopalan.com:3000/auth/kiva/callback) that you need to spoof by editing hosts file.  Basic authorization flow is demonstrated and I will be adding some more buttons to show how to access individual protected resource APIs published by Kiva.

http://build.kiva.org/docs/data/protected_resources

Pre Requisites
============
-You need Node and npm installed and configured.  

-You need to add an entry in the local hosts file to spoof localhost (127.0.0.1) as test.bonigopalan.com.  In windows usually this file is under C:/Windows/System32/drivers/etc/hosts.  In Linux it is usually under /etc/hosts.  This entry is required because in my code I am using a pre registered demo app on Kiva end.  For oAuth to work correctly you need to match the callback url as it is configured on the Kiva End.

http://www.howtogeek.com/howto/27350/beginner-geek-how-to-edit-your-hosts-file/


Instalation
===========
1. cd server<br>
2. npm install<br>
3. node app.js<br>

Navigate to http://test.bonigopalan.com:3000 (This is infact your localhost, and we are spofing it through the fake DNS entry in the hosts file).  Click on 'Authenticate with Kiva' button.

To USE it with your app
=======================
- Register your application with Kiva : https://build.kiva.org/apps
- Replace the appid, clientid, clientsecret and callbackurl in demoapp.js with your own values from the registration dashboard.
- Edit the exports.scopes array in demoapp.js to match the scopes your appliction needs.
- In the current flow, /auth/kiva will trigger the authorization routine and on success you will get a callback with some important user account information as a JSON array at route /auth/kiva/callback.  The demo app just pushes the data to the browser.  You can decide whatever you want to do with this data.  May be you want to save the access_token and access_secret into a secure location for querying kiva later?


Important
=========
As of initial publish it is in early beta stages and not very well tested.  Please feel free to report back bugs.  I will be more than happy to plug those.

