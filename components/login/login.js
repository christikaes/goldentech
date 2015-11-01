if (Meteor.isClient) {

  Router.route('/login', function(){
    this.render('login');
  })

  Template.login.helpers({
    message: function () {
      return Session.get('loginError');
    }
  });

  Template.login.events({
      'submit form': function(event){
          event.preventDefault();
          var email = $('[name=email]').val();
          var password = $('[name=password]').val();
          Meteor.loginWithPassword(email, password, function(error){
              if(error){
                  Session.set('loginError', error.reason)
                  console.log(error.reason);
              } else {
                  Router.go("start");
              }
          });
      },
      'click .register': function() {
        Router.go('register')
      }
  });

}