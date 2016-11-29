/**
 *
 * logout module
 */

(function () {
  return new Gstrap.Route('logout')
    .on('', function (req, res) {
      Parse.User.logOut().then(function () {
        res.loggedUser = Parse.User.current();  // this will now be null
        window.location.href = '/';
      });
    })
    .listen();
})();