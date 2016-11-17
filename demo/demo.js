function fetchUser() {
  $.ajax({
    url: '/api/user', 
    success: function(result) {
      // load and display user details and start the application!

      console.log('User results: ' + JSON.stringify(result));

     $('#title').text('User Data');
     $('#content').text(JSON.stringify(result, null, 2));

    }
  });
}


$(document).ready(function() {

  // configure Auth0

  var auth0 = new Auth0({
    domain:       'rippleosi.eu.auth0.com',
    clientID:     'Ghi91Wk1PERQjxIN5ili6rssnl4em8In',
    callbackURL:  'http://139.59.187.100/auth0/token',
    responseType: 'code'
  });


  // send /api/user request to middle tier to get things going

  $.ajax({
    url: "/api/initialise", 
    success: function(result) {
      console.log('response from middle tier: ' + JSON.stringify(result));

      if (result.token) {
        // reset the JSESSIONID cookie with the new incoming cookie
        
        document.cookie = "JSESSIONID=" + result.token;
        location.reload();
        return;
      }

      if (result.redirectTo === 'auth0') {
        console.log('running in UAT mode, so now login via auth0');

        auth0.login({
          connections: ['Username-Password-Authentication', 'google-oauth2', 'twitter'],
        });
        return;

      }

      if (result.ok) {
        console.log('Cookie was for a valid session, so fetch the simulated user');
        fetchUser();
      }

    }

  });


  $('#logoutBtn').on('click', function(e) {
    auth0.logout();
  });
	

});


