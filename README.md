# How to

From your browser, go to your instagram account and open the developer tools on the network tab.
Filter requests by "XHR" and "friend"
Click on "followers" and examine the request, grab the user id, session id, crsftoken, and all X-xx headers.

Add all these variables to a .env file at the root of the project (replace the values from the .env.tpl)

