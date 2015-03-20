if (Meteor.isClient) {
  var remoteUrl = '/';

  Session.setDefault('useNewTemplateSubscribe', true);
  Session.setDefault('useTemplate','hello');
  Session.setDefault('errorMessage','');

  Meteor.remoteConnection = DDP.connect(remoteUrl);

  DBImages = new Meteor.Collection('dbimages',{connection: Meteor.remoteConnection});

  Template.registerHelper('useTemplate', function(){
    return Session.get('useTemplate');
  });

  Template.hello.onCreated(function(){
    Session.set('errorMessage','');

    if(Session.get('useNewTemplateSubscribe'))
      this.view.subscribe(['thumbnails', 0, {
        onError: function(err) {
          console.log(err);
          Session.set('errorMessage', EJSON.stringify(err,{indent: true}));
        }
      }],{
        connection: Meteor.remoteConnection
      });
    else
      this.dbimagesHandle = Meteor.remoteConnection.subscribe('thumbnails',0);
  });

  Template.hello.onDestroyed(function(){
    if(this.dbimagesHandle)
      this.dbimagesHandle.stop();
  });

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    },
    images: function() {
      return DBImages.find();
    },
    errorMessage: function(){
      return Session.get('errorMessage');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('useTemplate','changeMethod');
    }
  });

  Template.changeMethod.helpers({
    checked: function() {
      return Session.get('useNewTemplateSubscribe');
    }
  });
  Template.changeMethod.events({
    'change input': function (e,t) {
      Session.set('useNewTemplateSubscribe', e.target.checked);
      Session.set('useTemplate', 'hello');
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    Meteor.publish("thumbnails", function () {
      return [];
    });
  });
}
