if(Meteor.isClient){
	Router.route('/home', function(){
		this.render('home');
	})

	Session.setDefault("monitors", null);
	Session.setDefault("monitorsError", false)
	Session.setDefault("healthInfo", null);

	Template.home.helpers({
		userType: function () {

		  return Session.get("healthInfo");
		},
		monitorsError: function(){
			return Session.get("monitorsError");
		},
		health: function () {
			// return Session.get("healthInfo");
			return Session.get("healthInfo") ? Session.get("healthInfo") : Meteor.user().profile.healthInfo
		},
		monitors: function(){
			// var monitors = Meteor.user().profile.profileInfo.monitorsId;
			var monitors = Session.get("monitors") ? Session.get("monitors") : monitors = Meteor.user().profile.profileInfo.monitorsId
			console.log("IN HELPER")
			// var userIds = _.pluck(Meteor.users.find({}).fetch(),"_id");
			var users = _.filter(Meteor.users.find({}).fetch(), function(user){return _.contains(monitors, user._id)})
			console.log(users);

			return users;

			// return Meteor.users.find({ "emails.address" : 'a@a.com' }).fetch();
		},
		profile: function () {
			console.log(Meteor.user().profile.profileInfo)
			return Meteor.user().profile.profileInfo
		}
	});

	Template.home.events({
      'submit .monitor': function(event){
          event.preventDefault();
          var phone = $('[name=phoneNum]').val();
          console.log(phone)
          console.log("____")
          var nm = _.filter(Meteor.users.find({}).fetch(), function(user){
          	console.log(user.profile.profileInfo.phone)
          	return user.profile.profileInfo.phone == phone &&
          			user.profile.profileInfo.userType == "Provider"
          })
          console.log(nm);
          // var newMonitor = Meteor.users.findOne({ "emails.address" : email })
          if(nm.length < 1){
          	console.log("Could not find this person")
          	Session.set("monitorsError", true)
          } else {
          	  Session.set("monitorsError", false)
          	  var newMonitor = nm[0]
	          console.log("___")
	          console.log(newMonitor)

	          //add the monitor
	          var newMonitors = Meteor.user().profile.profileInfo.monitorsId;
	          newMonitors = newMonitors ? newMonitors : [];

	          newMonitors.push(newMonitor._id)
	          console.log(newMonitors)

			  Meteor.users.update(Meteor.user()._id, {$set: {"profile.profileInfo.monitorsId": newMonitors}});
			  Session.set("monitors", Meteor.user().profile.profileInfo.monitorsId)
          }
      },
      'click .sendSMS' : function(event){
      		event.preventDefault();
      		console.log("SEND SMS")

      		var msg = "Join Wellness Common"

      		var args = {
      			msg : msg,
      			fromNum: Meteor.user().profile.profileInfo.phone,
      			toNum: $('[name=phoneNum]').val()
      		}

      		Meteor.call('sendSMS', args, function (error, result){
      			console.log("DONE SENDING")
      			Session.set("monitorsError", false)
      		})
      },
      'click .alert' :function (event){
      		event.preventDefault();
      		console.log("SEND ALERT SMS")

      		var msg = "Emergency!"

      		var args = {
      			msg : msg,
      			fromNum: Meteor.user().profile.profileInfo.phone,
      			toNum: $('[name=phoneNum]').val()
      		}

      		Meteor.call('sendSMS', args, function (error, result){
      			console.log("DONE SENDING")
      			Session.set("monitorsError", false)
      		})
      },
      'click .logout':function (event){
      	event.preventDefault();
      	Meteor.logout();
	    Router.go('start')
      }, 
	    'click .fitbitSetup': function(){
	      Router.go('fitbitSetup')
	    },
	    'click .fitbitInfo': function(){
	      Router.go('fitbitInfo')
	    },
	    'click .update': function(event){
	    	console.log("UPDATE");
	    	var id = this.id;
	    	var newValue = $('[name='+id+']').val()
	    	var newClass= "success";

	    	//check thresholds
	    	_.forEach(this.thresholds.good, function(t){
	    		if(newValue>t[0] && newValue<=t[1]){
	    			newClass= "success";
	    		}
	    	})
	    	_.forEach(this.thresholds.ok, function(t){
	    		if(newValue>t[0] && newValue<=t[1]){
	    			newClass= "warning";
	    		}
	    	})
	    	_.forEach(this.thresholds.bad, function(t){
	    		if(newValue>t[0] && newValue<=t[1]){
	    			newClass= "danger";
	    		}
	    	})
	    	console.log(newValue)
	    	console.log(newClass)


	    	var newHealthInfo = Meteor.user().profile.healthInfo;
	    	_.forEach(newHealthInfo, function(info){
	    		if(info.id == id){
	    			info.value = newValue;
	    			info.class = newClass;
	    		}
	    	})

	    	console.log(id)
	   		console.log(newHealthInfo)

	    	// var newHealthInfo = _.filter(Meteor.user().profile.healthInfo, function(info){
	    	// 								return info.id != id
	    	// 						});
	    	// this.value = newValue;
	    	// console.log(this)
	    	// newHealthInfo.push(this);


	    	// newHealthInfo.sort(function(a,b){
	    	// 	if (a.id > b.id){
	    	// 		return 1
	    	// 	} else if (a.id = b.id){
	    	// 		return 0
	    	// 	} else {
	    	// 		return -1
	    	// 	}
	    	// })


	    	Meteor.users.update(Meteor.user()._id, {$set: {"profile.healthInfo": newHealthInfo}});
	    	Meteor.users.update(Meteor.user()._id, {$set: {"profile.class": newClass}});
	    	Session.set("healthInfo", Meteor.user().profile.healthInfo)
	    },
	    'click .nav' : function(){
	  		Session.set("healthInfo", Meteor.user().profile.healthInfo)
	    }
    
  });

}

if(Meteor.isServer){
	Meteor.methods({
		'sendSMS': function senndSMS(args){
			console.log("SENDING SMS");
			console.log(args)

			//require the Twilio module and create a REST client
			var client = Twilio('ACCOUNT_SID', 'AUTH_TOKEN');

			//Send an SMS text message
			client.sendMessage({

			    to:'+1' + args.toNum, // Any number Twilio can deliver to
			    from: '+1' + args.fromNum, // A number you bought from Twilio and can use for outbound communication
			    body: args.msg // body of the SMS message

			}, function(err, responseData) { //this function is executed when a response is received from Twilio

			    if (!err) { // "err" is an error received during the request, if any

			        // "responseData" is a JavaScript object containing data received from Twilio.
			        // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
			        // http://www.twilio.com/docs/api/rest/sending-sms#example-1

			        console.log(responseData.from); // outputs "+14506667788"
			        console.log(responseData.body); // outputs "word to your mother."
			    }
			});
		}
	})
}