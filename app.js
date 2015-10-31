if (Meteor.isClient) {

  // INSTEAD OF STORING THESE AS COOKIES SAVE THEN IN THE DATABASE

  // counter starts at 0
  Session.setDefault('counter', 0);
  Session.setDefault('requestToken', null);
  Session.setDefault('requestTokenSecret', null);
  Session.setDefault('accessToken', null);
  Session.setDefault('accessTokenSecret', null);
  Session.setDefault('info', null);

  Router.route('/', function(){
    console.log(this.params)

    Meteor.call('getRequestToken', function(error, result){
      if(error){
        console.log(error)
      } else {
        console.log(result)
        Session.set('requestToken', result[0]);
        Session.set('requestTokenSecret', result[1]);
        console.log("requestToken: " + Session.get('requestToken'))
        console.log("requestTokenSecret: " + Session.get('requestTokenSecret'))
        
        // Let's go to authorize fitbit
        Router.go("/fitbit-authorization/" + Session.get('requestToken'))
      }
    });
    this.render('hello');
  })

  Router.route('/oauth_callback', function(){
    console.log(this.params.query)
    var query = this.params.query;

    var oauthToken = query.oauth_token;
    var oauthVerifier  = query.oauth_verifier;

    var requestTokenSecret = Session.get('requestTokenSecret')
    console.log(requestTokenSecret)
    // XXX
    // Use this accessToken and accessTokenSecret for all requests
    // Session.set('accessToken', query.oauth_token);
    // Session.set('accessTokenSecret', query.oauth_verifier);

    var args = {
      oauthToken : oauthToken,
      oauthVerifier: oauthVerifier,
      requestTokenSecret: requestTokenSecret
    } 

    Meteor.call('getAccessToken', args , function(error, result){
      if(error){
        console.log(error)
      } else {
        console.log(result)
        
        // Use this information to load fitbit information
        Session.set('accessToken', result[0]);
        Session.set('accessTokenSecret', result[1]);
        Session.set('info', result[2]);

        console.log("accessToken: " + Session.get('accessToken'))
        console.log("accessTokenSecret: " + Session.get('accessTokenSecret'))
        //return to home page
        // Router.go("/home")
      }
    });
  })



//   Router.route('/fitbit', {where: 'server'}).get( function(){
//     // Router.route('/asd'function () {
//     var request = this.request;
//     var response = this.response;
//     var headers = request.headers;
//     var userAgent = headers["user-agent"];
//     console.log(userAgent);
//     response.end();
// // });
//   })

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {

    // code to run on server at startup
    Fitbit = Meteor.npmRequire('fitbit-node');
    config = {  CONSUMER_KEY : "38105a4a7528a35ea9ca6aea7940d697", 
                CONSUMER_SECRET: "26bccb7fb8d2f2ac92647c664b2465d7"}
      
    // Routes
    Router.route('/fitbit-authorization/:requestToken', {where: 'server'}).get(function() {
      this.response.writeHead(302, {
        'Location': "http://www.fitbit.com/oauth/authorize?oauth_token=" + this.params.requestToken
      });
      this.response.end();
    });

    // Routes
    // Router.route('/oauth_callback', {where: 'server'}).get(function() {
    //   console.log(this.params.query)
    //   var query = this.params.query
    //   if(query && query.oauth_token && query.oauth_verifier){
    //     console.log("GOT THE AUTH TOKEN AND VERIFIER")

    //     var client = new Fitbit(config.CONSUMER_KEY, config.CONSUMER_SECRET);
  
    //     console.log("IN getRequestToken")
    //     var r = Async.runSync(function(done){
    //         client.getAccessToken().then(function(result){
    //           console.log("GOT TOKEN")
    //           console.log(result)
    //           done(null, result)
    //         }, function(error){
    //           console.log(error)
    //           done(error, null)
    //         })
    //       })
    //       console.log(r.result)
    //       // return r.result;
    //     }

  });



// client.getAccessToken(
//       oauth_token
//     , config.requestTokenSecret
//     , oauth_verifier).done(function(result){
//       console.log(result)

//       config.accessToken = result[0]
//       config.accessTokenSecret = result[1]
//       config.info = result[2]

//       res.redirect('/stats')
//     })
      // this.response.writeHead(302, {
      //   'Location': "http://www.fitbit.com/oauth/authorize?oauth_token=" + this.params.requestToken
      // });
    //   this.response.end();
    // });

  // });

  // Methods
    Meteor.methods({
      'getRequestToken': function getRequestToken() {
        var client = new Fitbit(config.CONSUMER_KEY, config.CONSUMER_SECRET);
  
        console.log("IN getRequestToken")
        var r = Async.runSync(function(done){
          client.getRequestToken().then(function(result){
            console.log("GOT TOKEN")
            console.log(result)
            done(null, result)
          }, function(error){
            console.log(error)
            done(error, null)
          })
        })
        return r.result;
      },

      'getAccessToken': function getAccessToken(args) {
        var client = new Fitbit(config.CONSUMER_KEY, config.CONSUMER_SECRET);
  
        console.log("IN getAccessToken")

        console.log(args)

        var r = Async.runSync(function(done){
          client.getAccessToken(args.oauthToken, args.requestTokenSecret, args.oauthVerifier).then(function(result){
            console.log("GOT TOKEN")
            console.log(result)
            done(null, result)
          }, function(error){
            console.log(error)
            done(error, null)
          })
        })
        console.log(r)
        return r.result;
      }
       
    });
}
