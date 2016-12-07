/*
 The MIT License (MIT)

 Copyright (c) 2016 Iman Khaghani Far

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

(function () {

  var UserManagement = function () {


    this.getUsers = function (callback) {
      var query = new Parse.Query(Parse.User);
      query.find({
        success: function (users) {
          callback(users);
        }
      });
    };

    this.getRoles = function (callback) {
      var query = new Parse.Query(Parse.Role);
      query.find({
        success: function (roles) {
          callback(roles);
        }
      });
    };

    this.getRoleUsers = function (roleName, callback) {
      var query = (new Parse.Query(Parse.Role));
      query.equalTo("name", roleName);
      query.first({
        success: function (role) {
          role.relation('users').query().find({success: callback})
        }
      })
    };

    this.addUserToRole = function (roleName, username) {
      var query1 = new Parse.Query(Parse.User);

      query1.equalTo("username", username);
      query1.first({
        success: function (user) {

          if (!user) {
            alert("The username does not exist!");
            return false;
          }

          var query2 = (new Parse.Query(Parse.Role));
          query2.equalTo("name", roleName);
          query2.first({
            success: function (role) {
              role.getUsers().add(user);
              role.save();
              window.location.reload();
            }
          })
        }
      });
    };

    this.removeUserFromRole = function (roleName, userId) {
      var query1 = new Parse.Query(Parse.User);
      query1.get(userId, {
        success: function (user) {

          if (!user) {
            alert("The username does not exist!");
            return false;
          }

          var query2 = (new Parse.Query(Parse.Role));
          query2.equalTo("name", roleName);
          query2.first({
            success: function (role) {
              role.getUsers().remove(user);
              role.save();
              window.location.reload();
            }
          })
        }
      });
    };

    this.getRoleRoles = function (roleName, callback) {
      var query = (new Parse.Query(Parse.Role));
      query.equalTo("name", roleName);
      query.first({
        success: function (role) {
          role.relation('roles').query().find({success: callback})
        }
      })
    };

    this.addRoleToRole = function (roleName, roleNameChild) {
      var query1 = new Parse.Query(Parse.Role);

      query1.equalTo("name", roleNameChild);
      query1.first({
        success: function (childRole) {

          if (!childRole) {
            alert("Role doest not exist!");
            return false;
          }

          var query2 = (new Parse.Query(Parse.Role));
          query2.equalTo("name", roleName);
          query2.first({
            success: function (role) {
              role.getRoles().add(childRole);
              role.save();
              window.location.reload();
            }
          })
        }
      });
    };

    this.removeRoleFromRole = function (roleName, roleNameChild) {
      var query1 = new Parse.Query(Parse.Role);

      query1.get(roleNameChild, {
        success: function (childRole) {

          if (!childRole) {
            alert("Role does not exist!");
            return false;
          }

          var query2 = (new Parse.Query(Parse.Role));
          query2.equalTo("name", roleName);
          query2.first({
            success: function (role) {
              role.getRoles().remove(childRole);
              role.save();
              window.location.reload();
            }
          })
        }
      });
    };

    this.createRole = function (name, callback) {
      var roleACL = new Parse.ACL();
      roleACL.setPublicReadAccess(true);
      var role = new Parse.Role(name, roleACL);
      role.save({
        success: callback
      });
    };

  }; // end class
  var um = new UserManagement();
  var Router = Gstrap().Route;
  return new Router('admin')
  // or roles
    .on('roles', function (req, res) {
      um.getRoles(function (roles) {
        res.render('public/modules/admin/roles.mustache', {roles: roles}, function (view) {
          // add a new role
          $('#btn-admin-add-role').on('click', function () {
            var name = $('#txt-admin-new-role-name').val();
            $('#txt-admin-new-role-name').val("");
            if (name.trim().length > 0) {
              um.createRole(name, function (newRole) {
                view.prepend('table-admin-roles', newRole);
              });
            }
          });
        });
      });
    })
    .on('roles/:role/users', function (req, res) {

      um.getRoleUsers(req.params.role, function (users) {

        var data = {
          role: req.params.role,
          users: users
        };

        res.render('public/modules/admin/role-users.mustache', data, function (view) {


          // add new user to the role
          $('#btn-admin-new-role-user').on('click', function () {
            var username = $('#txt-admin-new-role-user').val();
            if (username.trim().length > 0) {
              um.addUserToRole(data.role, username);
            }
          });

          // remove a user from the role
          $('#table-role-users').on('click', '.remove-user', function () {
            um.removeUserFromRole(data.role, $(this).parent().parent().attr('id'));

          });

        });
      });


    })
    .on('roles/:role/roles', function (req, res) {

      um.getRoleRoles(req.params.role, function (roles) {
        var data = {
          role: req.params.role,
          roles: roles
        };

        res.render('public/modules/admin/role-roles.mustache', data, function (view) {
          // add new role to the main role
          $('#btn-admin-new-role-role').on('click', function () {
            var roleName = $('#txt-admin-new-role-role').val();
            if (roleName.trim().length > 0) {
              um.addRoleToRole(data.role, roleName);
            }
          });

          // remove a role from the main role
          $('#table-role-roles').on('click', '.remove-role', function () {
            um.removeRoleFromRole(data.role, $(this).parent().parent().attr('id'));

          });

        });


      });

    })
    .on('users', function (req, res) {
      um.getUsers(function (users) {
        res.render('public/modules/admin/users.mustache', {users: users});
      });

    })
    .listen();
})();