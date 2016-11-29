# Gstrap
Gstrap is not just another Javascript web framework. It's been created to be exteremly simple to use, powerful and extremely similar to our programming knowledge. Therefore you can start building your web app without learning anything new (except a bit of jQuery) and you can do everything that Javascript allows you to do. I know a lot of us hate to learn just another javascript framework, we also hate to change our codebase to adapt with AngularJS or similar new frameworks. That's why I put 8 years of my javascript development experience together and created Gstrap... Let's me explain how it works in more detail.

# Before Quick Start
you can jump to Quick Start and create your own app in less than 10 minutes, but before that I want to give you some background on Gstrap. 

## Signle page framework ##
Gstrap is modern, so it manages everything in a single HTML file (e.g., index.html) and everything else is just DOM manipulation (similar to AngularJS).

## Gstrap and jQuery ##
Gstrap itself is built on top of Jquery. It could be agnostic to jQuery, but I thought you will end up including jQuery in your single HTML file, so do it because it won't work without jQuery, any version of jQuery 2 and above should work. If you want to help me to get Gstrap independent of Jquery, then let's do it.

## Gstrap and EJS ##
As any single page Javascript framework, Gstrap manipulate the DOM object and therefore needs a template engine. EJS and Mustache were around for many years and Gstrap support both.

## Gstrap is fast and minimalistic ##
Gstrap is a really minimalistic framework. Apparently it is the most minimalistic javascript framework in the world. There are two main reason for it's simplicity. 1) You can fully understand the framework and debug your code in no time 2) it works fast because it is small and does not have anything that is not neccessary. To make the story short, Gstrap does not have any fancy features that you will never use, but your browser has to load them.

## Gstrap modules ##
Since Gstrap is minimalistic, it does not have fancy features but the only limit you have is the sky. You can build modules (plain functions) and load them in your app. So any new feature that you want to add to Gstrap is going to be a module (e.g., custom function)

## View modulues ##
You can build modules that have three simple properties (1: route, 2: view (e.g.,EJS),3: controller) and load them in Gstrap. Gstrap listens to route change and load your module. You can build your view module however you want as far as it has a route, template and a controller. I told you, Gstrap is very powerful and minimalistic.



# Quick Start

 1. Setup your project by creating an index.html file, then open it with your favorite editor
 2. In the `<head></head>` tags insert:
	 1. embed Jquery 2.X or above: because gstrap is built on top of jQuery and you need it to run gstrap.
	 2. embed `gstrap.js` or `gstra.min.js` right after the jQuery

Your code will look like this:

    <head>
	    <script src="jquery.min.js"></script>
	    <script src="gstrap.min.js"></script>
    </head>

## create the app and configure it
once you have both jquery and gstrap in the header, you can start creating you 1 page application. 

    <body>
	    <script>
	    	new Gstrap({
		    name: "my app", // the name of your application
		    version: 0.0, // the version of your applicatopn
		    description: "description of your application", // a bit of description
		    // here you pass all the modules that you need in this app
		    // refer to modules in thos doc to learn more about them
		    modules: [
		        // an static vide module for your static navigation, If you want one
		        {
		            name: "navbar",
		            path: "modules/navbar/navbar.js"
		        },
		        // a module for your home page
		        {
		            name: "default",
		            path: "modules/default/default.js"
		        },
		        // see the parse example, it is a simple use profule module that works with Parse server.
		        {
		            name: "userProfile",
		            path: "modules/user-profile/user-profile.js"
		        },
		
		        // see the modules folder, I already built a t0d0 view module for you.
		        {
		            name: "todo",
		            path: "modules/todo/todo.js"
		        }
		    ],
		    // do things before loading the ui, for example check auth.
		    beforeLoad: function ($g, next) {
		        // once you made sure that the user is logged on, or whatever asynchronous task you want to do,
		        // call next();
		    },
		    load: function ($g) {
		        // get the $g which is the gstrap instance and let you access
		        // gstrap public methods like render and Queue
		        
		        // set the static views of the app, the one that does not change on
		        // route change :)
		        $g.static($g.modules.navbar({}, $g));
		
		        // set the default dynamic page, if the route is not found
		        $g.dynamic($g.modules.notFound());
		        $g.route('', function (req) {
		            $g.page.html("front end");
		        });
		        // and some more routes like logout
		        $g.route('logout/', function (req) {
		            dpd.users.logout(function (err) {
		                window.location.href = 'index.html';
		                if (err) console.log(err);
		            });
		        });
		        
		        // listen will registers and listen to the above routes.
		        $g.listen();
		    }
		});
	    </script>
    </body>

# Gstrap Modules

to be continued...
