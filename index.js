var aws = require('aws-sdk'),
http = require('http');

var awsRegion = 'us-east-1';


// Set the region
aws.config.update({region: awsRegion});

exports.handler = function(event, context) {
  event.Records.forEach(record => {
    const { body } = record;
    //console.log(body);
    try{
      // for testing only
      //var hash = JSON.parse(JSON.stringify(body));
      var hash = JSON.parse(body);
      console.log(hash)
    
    }catch(e){
      console.log("Invalid json");
      console.log(hash);
    }
    if(!hash.function){
      console.log("invalid function");
    }
    
    if(hash.function == "reserve" || hash.function == "return"){
      if(!hash.book_name){
        console.log("Invalid book name");
      }
      if(!hash.topic){
        console.log("Invalid Topic Arn");
      }
  
      sendEmailNotification(hash.function, hash.book_name, hash.topic, function(err, data) {
        if (err) {
          console.log("Email was not sent: ", err);
        } else {
          console.log("Email sent: ", data);
        }
      });

    }
    
    if(hash.function == "subscribe"){
      if(!hash.email){
        console.log("invalid email");
      }
      if(!hash.topic){
        console.log("invalid topic");
      }
      
      subscribeEmail(hash.email, hash.topic, function(err, data) {
        if (err) {
          console.log("Email was not sent: ", err);
        } else {
          console.log("Email sent: ", data);
        }
      });
      
    }

    if(hash.function == "checkout"){
      if(!hash.transactions){
        console.log("invalid transactions");
      }
      if(!hash.topic){
        console.log("invalid topic");
      }
      
      sendCheckOutEmailNotification(hash.transactions, hash.topic, function(err, data) {
        if (err) {
          console.log("Email was not sent: ", err);
        } else {
          console.log("Email sent: ", data);
        }
      });
      
    }
});


function sendEmailNotification(func, book_name, topic, callback){
  var sns = new aws.SNS({region:awsRegion});
  
  if(func=="reserve") {
    // Create publish parameters
    var params = {
      Message: 'You have reserved ' + book_name + '. We will update you when it is free!', /* required */
      TopicArn: topic
    };
 }
 else if(func == "return") {
  var params = {
      Message: book_name + ' has now been returned. You can now reserve it!', /* required */
      TopicArn: topic
    };
 }
  
  console.log(params);
  sns.publish(params, function(err, data) {
  if (err) {
    console.log(err.stack);
    return;
  }
  console.log('push sent');
  console.log(data);
  context.done(null, 'Function Finished!');  
  });

}

function sendCheckOutEmailNotification(transactions, topic, callback){
  var sns = new aws.SNS({region:awsRegion});

   var message = "You have checked out some books from the library. Here is the information:\n\n"

    for (i= 0; i < transactions.length; i++) {
      message +="Book_name: " + transactions[i].book_name + "\nCheckout date: " + transactions[i].checkout_date + "\nReturn Date: " + transactions[i].return_date  + "\n\n"
    } 

    // Create publish parameters
    var params = {
      Message: message, /* required */
      TopicArn: topic
    };

   

  
  console.log(params);
  sns.publish(params, function(err, data) {
  if (err) {
    console.log(err.stack);
    return;
  }
  console.log('push sent');
  console.log(data);
  context.done(null, 'Function Finished!');  
  });

}

function subscribeEmail(email, topic, callback){
  var sns = new aws.SNS({region:awsRegion});
  
  // Create publish parameters
  var params = {
    Protocol: 'EMAIL', /* required */
    TopicArn: topic, /* required */
    Endpoint: email
  };
  console.log(params);
 sns.subscribe(params, function(err, data) {
  if (err) {
    console.log(err.stack);
    return;
  }
  console.log('push sent');
  console.log(data);
  context.done(null, 'Function Finished!');  
  });

}


};
