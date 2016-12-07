/**
 *
 * logout module
 */

(function () {
  var Router = Gstrap().Route;
  return new Router('logout')
    .on('', function (req, res) {
      Parse.User.logOut().then(function () {
        res.loggedUser = Parse.User.current();  // this will now be null
        window.location.href = '/';
      });
    })
    .listen();
})();