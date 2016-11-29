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

  var Todo = Parse.Object.extend('todo');

  var query = new Parse.Query(Todo);


  return new Gstrap.Route('todo')
    .on('', function (req, res) {

      var myTodos = new Parse.Query(Todo);
      myTodos.find({
        success: function (todos) {
          res.render('public/modules/todo/todo.ejs', {todos: todos}, function (view) {
            // add new item
            $('#new-todo-item').on('keydown', function (e) {
              if (e.keyCode == 13) {
                var name = $(this).val();
                if (name.length > 0) {
                  $(this).val('');
                  var item = new Todo();
                  item.set('name', name);
                  item.set('completed', false);
                  item.setACL(new Parse.ACL(Parse.User.current()));
                  item.save(null, {
                    success: function (savedItem) {
                      view.append('todo-items', {item: savedItem});
                    },
                    error: function (obj, error) {
                      console.log(error);
                    }
                  });
                }
              }
            });

            // remove item
            $('#todo-items').on('click', '.item-remove', function (e) {
              query.get($(this).parent().parent().attr('id'), {
                success: function (obj) {
                  obj.destroy({
                    success: function (deletedObj) {
                      $('#' + deletedObj.id).remove();
                    }
                  });
                },
                error: function (obj, error) {
                  console.log(error);
                }
              });
            });

            // change item status, (completed, not completed)
            $('#todo-items').on('click', '.todo-checkbox', function (e) {
              if ($(this).prop('checked')) {
                // it is checked
                $(this).parent().next().css('textDecoration', 'line-through');

                query.get($(this).parent().parent().attr('id'), {
                  success: function (obj) {
                    obj.set('completed', true);
                    obj.save();
                  },
                  error: function (obj, error) {
                    console.log(error);
                  }
                });
              } else {
                // it is not checked
                $(this).parent().next().css('textDecoration', 'none');

                query.get($(this).parent().parent().attr('id'), {
                  success: function (obj) {
                    obj.set('completed', false);
                    obj.save();
                  },
                  error: function (obj, error) {
                    console.log(error);
                  }
                });
              }
            });
          });
        },
        error: function (todos, error) {
          console.log(error.message);
        }
      });
    })
    .listen();
})();