if (Meteor.isClient) {

  Router.route('/', function(){
    this.render('splash');
    setTimeout(function(){
      Router.go('/start');
    }, 1500);
  })

}