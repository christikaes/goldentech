if (Meteor.isClient) {

  // INSTEAD OF STORING THESE AS COOKIES SAVE THEN IN THE DATABASE

  // counter starts at 0
  Session.setDefault('counter', 0);
  Session.setDefault('requestToken', null);
  Session.setDefault('requestTokenSecret', null);
  Session.setDefault('accessToken', null);
  Session.setDefault('accessTokenSecret', null);
  Session.setDefault('info', null);

  Session.setDefault('oauthToken', null);
  Session.setDefault('oauthVerifier', null);

  Session.setDefault('steps', 0);

  Session.setDefault('registerError', "");
  Session.setDefault('loginToOauthError', "");
  Session.setDefault('loginError', "");

  Router.route('/fitbitSetup', function(){
    console.log(this.params)

    Meteor.call('getRequestToken', function(error, result){
      if(error){
        console.log(error)
        //return to home page
        Router.go("/start")
      } else {
        console.log(result)
        // Meteor.user().profile.requestToken = result[0];
        // Meteor.user().profile.requestTokenSecret = result[1];

        console.log(Meteor.user().profile)
        Meteor.users.update(Meteor.user()._id, {$set: {"profile.requestToken": result[0]}});
        Meteor.users.update(Meteor.user()._id, {$set: {"profile.requestTokenSecret": result[1]}});

        console.log(Meteor.user().profile)

        Session.set('requestToken', result[0]);
        Session.set('requestTokenSecret', result[1]);
        console.log("requestToken: " + Session.get('requestToken'))
        console.log("requestTokenSecret: " + Session.get('requestTokenSecret'))
        
        // Let's go to authorize fitbit
        Router.go("/fitbit-authorization/" + Meteor.user().profile.requestToken)
      }
    });
  })
  
  Router.route('/oauth_callback', function(){
    // Save the params
     console.log(this.params.query)
      var query = this.params.query;

      var oauthToken = query.oauth_token;
      var oauthVerifier  = query.oauth_verifier;

      Session.set("oauthToken", oauthToken)
      Session.set("oauthVerifier", oauthVerifier)

    // IF IT LOGGED YOU OUT, LOG BACK IN
    // if(Meteor.user()){
    //   // Router.go("/oauth_callback_loggedin")
    // } else {
      // LOGIN
      this.render('loginToOauth')
    // }
  })


  Router.route('/oauth_callback_loggedin', function(){
    console.log("---------HERE----------")
    console.log(Meteor.user())

    var oauthToken = Session.get("oauthToken")
    var oauthVerifier  = Session.get("oauthVerifier")
   
    var requestTokenSecret = Meteor.user().profile.requestTokenSecret
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

    console.log(args)

    Meteor.call('getAccessToken', args , function(error, result){
      if(error){
        console.log(error)
        //return to home page
        Router.go("/start")
      } else if(result.length > 0) {
        console.log(result)
        
        // Use this information to load fitbit information
        Meteor.users.update(Meteor.user()._id, {$set: {"profile.accessToken": result[0]}});
        Meteor.users.update(Meteor.user()._id, {$set: {"profile.accessTokenSecret": result[1]}});
        Meteor.users.update(Meteor.user()._id, {$set: {"profile.fitbitInfo": result[2]}});
        // Meteor.user().profile.accessToken = result[0];
        // Meteor.user().profile.accessTokenSecret = result[1];
        // Meteor.user().profile.fitbitInfo = result[2];
        Session.set('accessToken', result[0]);
        Session.set('accessTokenSecret', result[1]);
        Session.set('info', result[2]);

        console.log("accessToken: " + Session.get('accessToken'))
        console.log("accessTokenSecret: " + Session.get('accessTokenSecret'))
        console.log(Meteor.user().profile)
        console.log("!!!!!!!!!!!!!!!!")

        //return to home page
        Router.go("/start")
      }
    });
  })

  Template.loginToOauth.helpers({
    message: function () {
      return Session.get('loginToOauthError');
    }
  });

  Router.route('/loginToOauth', function(){
    this.render('loginToOauth');
  })

  Template.fitbitInfo.helpers({
    message: function () {
      return "You have walked: " + Session.get('steps') + " steps";
    }
  });

  Router.route('/fitbitInfo', function(){
    console.log("HERE")
    var args = {
      url: "/activities.json",
      accessToken: Meteor.user().profile.accessToken,
      accessTokenSecret: Meteor.user().profile.accessTokenSecret
    }

    Meteor.call('myget', args, function(error, result){
      console.log("BACK")
      if(error){
        console.log(error)
        //return to home page
        Router.go("/start")
      } else {
        console.log(result)
        // Meteor.user().profile.requestToken = result[0];
        // Meteor.user().profile.requestTokenSecret = result[1];

        // console.log(result)

        Session.set('steps', result.lifetime.tracker.steps);  

        var steps = result.lifetime.tracker.steps;
        var floors = result.lifetime.tracker.floors;
        var distance = result.lifetime.tracker.distance;
        var caloriesOut = result.lifetime.tracker.caloriesOut;

        console.log(steps)

        var newHealthInfo = Meteor.user().profile.healthInfo;
        _.forEach(newHealthInfo, function(info){
          if(info.id == 5){
            info.value = steps;
            // info.class = newClass;
          }
          if(info.id == 6){
            info.value = floors;
            // info.class = newClass;
          }
          if(info.id == 7){
            info.value = distance;
            // info.class = newClass;
          }
          if(info.id == 8){
            info.value = caloriesOut;
            // info.class = newClass;
          }
        })

        Meteor.users.update(Meteor.user()._id, {$set: {"profile.healthInfo": newHealthInfo}});
          Session.set("healthInfo", Meteor.user().profile.healthInfo)
     
        //return to home page
        Router.go("/start")      
      }
    });

    this.render('fitbitInfo');
  })

  Template.loginToOauth.events({
      'submit form': function(event){
          console.log("SUBMIT")
          event.preventDefault();
          var email = $('[name=email]').val();
          var password = $('[name=password]').val();
          Meteor.loginWithPassword(email, password, function(error){
              if(error){
                  Session.set('loginToOauthError', error.reason)
                  console.log(error.reason);
              } else {
                  console.log("#############")
                  Router.go("/oauth_callback_loggedin");
              }
          });
      }
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {

    // code to run on server at startup
    Fitbit = Meteor.npmRequire('fitbit-node');
    config = {  CONSUMER_KEY : "38105a4a7528a35ea9ca6aea7940d697", 
                CONSUMER_SECRET: "26bccb7fb8d2f2ac92647c664b2465d7"}
    
    Twilio = Meteor.npmRequire('twilio');

    // Routes
    Router.route('/fitbit-authorization/:requestToken', {where: 'server'}).get(function() {
      this.response.writeHead(302, {
        'Location': "http://www.fitbit.com/oauth/authorize?oauth_token=" + this.params.requestToken
      });
      this.response.end();
    });

  });

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
            console.log("xxxxxxxxxxxxxxxxxxxx")
            done(error, null)
          })
        })
        return r.result;
      },

      'getAccessToken': function getAccessToken(args) {
        var client = new Fitbit(config.CONSUMER_KEY, config.CONSUMER_SECRET);
        console.log("_________________________")
        console.log("IN getAccessToken")

        console.log(args)

        var r = Async.runSync(function(done){
          client.getAccessToken(args.oauthToken, args.requestTokenSecret, args.oauthVerifier).then(function(result){
            console.log("GOT TOKEN")
            console.log(result)
            done(null, result)
          }, function(error){
            console.log("xxxxxxxxxxxxxxxxxxxx")
            console.log(error)
            done(error, null)
          })
        })
        console.log(r)
        return r.result;
      },

      'myget': function myget(args) {
        var client = new Fitbit(config.CONSUMER_KEY, config.CONSUMER_SECRET);
        console.log("..........")
        console.log("IN get")

        console.log(args)

        var r = Async.runSync(function(done){
          client.get(args.url, args.accessToken, args.accessTokenSecret).then(function(result){
            console.log("GOT RESULT")
            console.log(result)
            var a = done(null, result)
            // return a
          }, function(error){
            console.log("xxxxxxxxxxxxxxxxxxxx")
            console.log(error)
            done(error, null)
          })
        })
        console.log("_________")
        console.log(r.result)

        console.log(JSON.parse(r.result[0]))

        return JSON.parse(r.result[0]);
      }
       
       
    });
}
