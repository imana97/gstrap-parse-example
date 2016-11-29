(function () {
  return function (settings, $g) {
    var navbar = $(document.createElement('div')).addClass('navbar navbar-fixed-top navbar-inverse');
    $g.EJS('public/modules/navbar/navbar.ejs', settings, function (view) {
      navbar.html(view);

      $('#btn-login').click(function (e) {
        var username = $('#input-username').val();
        var password = $('#input-password').val();

        Parse.User.logIn(username, password, {
          success: function (user) {
            window.location.reload();
          },
          error: function (user, error) {
            alert(error.message);
          }
        });
      });

      $('#btn-signup').click(function (e) {
        window.location.hash = "#!/signup/";
      });

    });
    return navbar;
  };
})();

