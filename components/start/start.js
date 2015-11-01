if (Meteor.isClient) {

  Router.route('/start', function(){
    this.render('start');
  })

  Template.start.helpers({
    isCustomer: function () {
      return Meteor.user().profile.profileInfo.userType == "Customer";
    }
  });

  Template.start.events({
    'click .register': function() {
      Router.go('register')
    },
    'click .login': function() {
      Router.go('login')
    },
    'click .logout': function(){
      Meteor.logout();
      Router.go('start')
    },
    'click .fitbitSetup': function(){
      Router.go('fitbitSetup')
    },
    'click .fitbitInfo': function(){
      Router.go('fitbitInfo')
    }
    
  })

}