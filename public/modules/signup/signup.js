(function () {

  var Router = Gstrap().Route;
  return new Router('signup')
    .on('', function (req, res) {
      res.render('public/modules/signup/signup.ejs', {}, function (view) {

        $('#signup-btn').on('click', function () {
          // check fields
          var username = $('#signup-username').val().trim();
          var password = $('#signup-password').val().trim();
          var email = $('#signup-email').val().trim();
          var user = new Parse.User();

          user.set('username', username);
          user.set('password', password);
          user.set('email', email);

          user.signUp(null, {
            success: function (user) {
              window.location.href = "";
            },
            error: function (user, error) {
              alert(error.message);
            }
          });
        });

      });
    })
    .listen();
})();