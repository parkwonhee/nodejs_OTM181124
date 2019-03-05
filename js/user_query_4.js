// dynamodb DB 쿼리

module.exports.send = function (j){
  var AWS = require('aws-sdk');
  var dynamodb = new AWS.DynamoDB({ region: 'us-east-1' });
  var docClient = new AWS.DynamoDB.DocumentClient({ service: dynamodb });
  var placeId_num = j;

  var maxlist_f10 ="a",maxlist_f20="a",maxlist_f30="a",maxlist_f40="a",maxlist_m10="a",maxlist_m20="a",maxlist_m30="a",maxlist_m40="a";//영어
  var maxlistk_f10,maxlistk_f20,maxlistk_f30,maxlistk_f40 ,maxlistk_m10,maxlistk_m20,maxlistk_m30,maxlistk_m40;//한글

  var Twosome_Code_params = {
      TableName : "Twosome_Code",                                    //OrderList
      ProjectionExpression:"brandName, orderInfo, placeId, positionName,recommendmenu,requiredTime",
      KeyConditionExpression: "placeId = :j",
      ExpressionAttributeValues: {
          ":j": placeId_num
      }
  };

  var queryObjectPromise = docClient.query(Twosome_Code_params).promise();

  queryObjectPromise.then(function (data) {
      console.log("Query Item succeeded: [user_query_4]");

           data.Items.forEach(function(item) {

             var positionName = item.positionName;//창동역점
             exports.positionName = positionName;

              var obj_orderInfo = item.orderInfo;   //전체 orderinfo
              var obj_orderInfolength = Object.keys(obj_orderInfo).length;   //전체 _orderInfo길이
              exports.obj_orderInfolength =obj_orderInfolength;

             var obj_tmp=[], age_list_tmp=[], gender_list_tmp=[], paymentNum_list_tmp=[],estate_list_tmp=[],state_list_tmp=[], totPrice_list_tmp=[];
             var menu_list_tmp=[], amount_list_tmp=[], date_tmp_list=[], time_tmp_list=[], etype_list=[], type_list=[];

 ///////////////////////////////////////////////////////////////////////////////////////////////////
 //차트만들기--5)포장유무 따른 piechart를 만들기!!어떻게할까?-한번에
 //이건 listlist차트와 같이 있어야함!!in-store use , packing

             var obj2_length=[], obj2_tmp=[];
             var eat_in=0,take_away=0;//남녀별 한글메뉴

             for (var t = 0; t<obj_orderInfolength; t++){
               var obj = item.orderInfo[t].order;                 //메뉴개수구하기(item.orderInfo[n].order[m]의 m 구하기)
               var obj2_length = Object.keys(obj).length;

               for (var q = 0; q < obj2_length; q++){
                 if(item.orderInfo[t].order[q].type=='in-store use'){       // 포장유무-매장부터
                   var long = parseInt(item.orderInfo[t].order[q].amount)
                   eat_in += long;
                 }else if(item.orderInfo[t].order[q].type=='packing'){//포장일때
                   var long = parseInt(item.orderInfo[t].order[q].amount)
                   take_away += long;
                 }//포장일때 검사 끝
               }//order끝_
             }//전체끝...
             exports.take_away = take_away;
             exports.eat_in = eat_in;
 //5번까지 끝
           });//data.items 이거끝
  }).catch(function (err) {
      console.log("Unable to read item. Error JSON: ", JSON.stringify(err, null, 2));
  });
};
