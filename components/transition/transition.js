if (Meteor.isClient) {
	//router animation
	animateContentOut = function() {
		$('body').removeClass("animated fadeIn");
		return $('body').addClass("hide");
	}

	fadeContentIn = function() {
	    $('body').addClass("animated fadeIn");
	    return $('body').removeClass("hide");
	}
	// // define this as a global onBeforeAction so it happens all the time
	// Router.onBeforeAction(animateContentOut)

	// // define this as a global onAfterAction so it happens all the time
	// Router.onAfterAction(animateContentOut)

}