// dynamodb DB 쿼리

module.exports.send = function (j){
  var AWS = require('aws-sdk');
  var dynamodb = new AWS.DynamoDB({ region: 'us-east-1' });
  var docClient = new AWS.DynamoDB.DocumentClient({ service: dynamodb });
  var placeid = j;

  var maxlist_f10 ="a",maxlist_f20="a",maxlist_f30="a",maxlist_f40="a",maxlist_m10="a",maxlist_m20="a",maxlist_m30="a",maxlist_m40="a";//영어
  var maxlistk_f10,maxlistk_f20,maxlistk_f30,maxlistk_f40 ,maxlistk_m10,maxlistk_m20,maxlistk_m30,maxlistk_m40;//한글

  var when_in = {
   TableName : "Twosome_Code",         //Twosome_Code
   ProjectionExpression:"placeId,brandName,positionName",
   KeyConditionExpression: "placeId = :whereplaceid",
   ExpressionAttributeValues: {
   ":whereplaceid": placeid
        }
    };

  var queryObjectPromise = docClient.query(when_in).promise();

  queryObjectPromise.then(function (data) {
    console.log("Query succeeded [whenin]");
      data.Items.forEach(function(item) { //호출한 쿼리값
        var positionName = item.positionName; //지점 이름
        exports.positionName = positionName;
    })
  }).catch(function (err) {
      console.log("Unable to read item. Error JSON: ", JSON.stringify(err, null, 2));
  });

};
