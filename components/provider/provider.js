if(Meteor.isClient){
	Router.route('/provider', function(){
		this.render('provider');
	})

	Session.setDefault("noCustomers", true);

	Template.provider.helpers({
		customers: function(){
			console.log("____")
			var allUsers = Meteor.users.find({}).fetch();
			var users = _.filter(Meteor.users.find({}).fetch(), function(user){
					return user.profile.profileInfo.userType == "Customer" 
					&& _.contains(user.profile.profileInfo.monitorsId, Meteor.user()._id)
				})
			if(users.length > 0){
				Session.set("noCustomers", false);
			}

			return users;
		},
		noCustomers: function(){
			return Session.get("noCustomers")
		}
	});


	Template.provider.events({
		'click .logout':function (event){
	      	event.preventDefault();
	      	Meteor.logout();
		    Router.go('start')
	      }
	 })
}