if(Meteor.isClient){
  Router.route('/register', function(){
    this.render('register');
  })

  Template.register.helpers({
    message: function () {
      return Session.get('registerError');
    }
  });

  Template.register.events({
      'submit form': function(event){
          event.preventDefault();
          var email = $('[name=email]').val();
          var password = $('[name=password]').val();
          var firstname = $('[name=firstname]').val();
          var lastname = $('[name=lastname]').val();
          var userType = $('[name=userType]').val();
          var date = $('[name=date]').val();
          var address = $('[name=address]').val();
          var phone = $('[name=phone]').val();

          var profileInfo = {
          	userType : userType,
            date: date,
            address: address,
            phone: phone,
            firstname: firstname,
            lastname: lastname
          }

          var healthInfo = [
                              {
                                "title" : "Mood",
                                "value" : 10,
                                "class" : "success",
                                "id" : 1,
                                "isRange" : true,
                                "thresholds":{
                                    "good" : [[0, 30]],
                                    "ok": [[30,70]],
                                    "bad": [[70, 100]]
                                }
                              },
                              {
                                "title" : "Pain",
                                "value" : 0,
                                "class" : "success",
                                "id" : 2,
                                "isRange" : true,
                                "thresholds":{
                                    "good" : [[0, 30]],
                                    "ok": [[30,70]],
                                    "bad": [[70, 100]]
                                }
                              },
                              {
                                "title" : "Glucose",
                                "value" : 80,
                                "class" : "success",
                                "id" : 3,
                                "thresholds":{
                                    "good" : [[70, 100]],
                                    "ok": [[60,70], [100,110]],
                                    "bad": [[0,70], [110,200]],
                                }
                              },
                              {
                                "title" : "Blood Pressure",
                                "value" : 110,
                                "class" : "success",
                                "id" : 4,
                                "thresholds":{
                                    "good" : [[90, 120]],
                                    "ok": [[80,90], [120,130]],
                                    "bad": [[0,80], [130,200]],
                                }
                              },
                              {
                                "title" : "Steps Taken",
                                "value" : 0,
                                "class" : "success",
                                "id" : 5,
                                "thresholds":{
                                    "good" : [[0, 10000]],
                                    "ok": [],
                                    "bad": []
                                }
                              },
                              {
                                "title" : "Floors Climbed",
                                "value" : 0,
                                "class" : "success",
                                "id" : 6,
                                "thresholds":{
                                    "good" : [[0, 10000]],
                                    "ok": [],
                                    "bad": []
                                }
                              },
                              {
                                "title" : "Distance Walked",
                                "value" : 0,
                                "class" : "success",
                                "id" : 7,
                                "thresholds":{
                                    "good" : [[0, 10000]],
                                    "ok": [],
                                    "bad": []
                                }
                              },
                              {
                                "title" : "Calories Burned",
                                "value" : 0,
                                "class" : "success",
                                "id" : 8,
                                "thresholds":{
                                    "good" : [[0, 10000]],
                                    "ok": [],
                                    "bad": []
                                }
                              },
                            ]

          console.log(profileInfo)

          Accounts.createUser({
              email: email,
              password: password,
              profile: {
                profileInfo: profileInfo,
                healthInfo: healthInfo,
                requestToken: "",
                requestTokenSecret: "",
                accessToken: "",
                accessTokenSecret: "",
                fitbitInfo: null
              }
          }, function(error){
              if(error){
                  Session.set('registerError', error.reason)
                  console.log(error.reason); // Output error if registration fails
              } else {
                  Router.go("login"); // Redirect user if registration succeeds
              }
          });
      }
  });

}
