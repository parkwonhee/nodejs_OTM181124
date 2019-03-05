// dynamodb DB 쿼리 //promise

module.exports.send = function (i,j){
  var AWS = require('aws-sdk');
  var dynamodb = new AWS.DynamoDB({ region: 'us-east-1' });
  var docClient = new AWS.DynamoDB.DocumentClient({ service: dynamodb });

  var OrderList_params = {
      TableName : "OrderList",                                    //OrderList
      ProjectionExpression:"MAC, orderInfo",
      KeyConditionExpression: "MAC = :i",
      ExpressionAttributeValues: {
          ":i": i
      }
  };

  var Twosome_Code_params = {
      TableName : "Twosome_Code",                                //Twosome_Code
      ProjectionExpression:"placeId, brandName, positionName, requiredTime",
      KeyConditionExpression: "placeId = :j",
      ExpressionAttributeValues: {
          ":j": j
      }
  };

  /* dynamodb json 구조(OrderList)
  {
    "MAC": "778adfb0-b8ed-11e8-bc06-9f1da63f8ca6",
    "orderInfo": [
      {
        "brandName": "투썸플레이스",
        "order": [
          {
            "amount": "2",
            "date": "2018-09-15",
            "menu": "icedcafeamericano",
            "price": "4100",
            "shot": null,
            "size": null,
            "time": "09:45",
            "type": "eat in"
          }
        ],
        "paymentNum": "778adfb0-b8ed-11e8-bc06-9f1da63f8ca60",
        "placeId": "ChIJ20ULhk-5fDUREsDLwzw1mxc",
        "positionName": "창동역점",
        "state": "1",
        "totPrice": "8200"
      }
    ]
  }
  */

  var queryObjectPromise = docClient.query(OrderList_params).promise();
  var queryObjectPromise2 = docClient.query(Twosome_Code_params).promise();

  queryObjectPromise.then(function (data) {
      console.log("[Promise][OrderList]Query Item succeeded:D");

      data.Items.forEach(function(item) {
         var orderInfo = item.orderInfo[0];                  //현재 결제는 항상 item.orderInfo[0]이니 바꿀필요없음

         exports.id = item.MAC;                              //MAC주소
         exports.paymentNum = orderInfo.paymentNum;          //결제번호
         exports.totPrice = orderInfo.totPrice;              //총금액
         exports.state = orderInfo.state;                    //결제상태('1'==주문접수중 '2'=제조중 '3'=제조완료 '4'=수령완료)
         exports.brandName = orderInfo.brandName;            //브랜드이름
         exports.positionName = orderInfo.positionName;      //매장명

         var obj_orderInfo = item.orderInfo;                 //역대 주문개수구하기(item.orderInfo[n]의 n 구하기)
         var obj_orderInfo_length = Object.keys(obj_orderInfo).length;
         exports.obj_orderInfo_length = obj_orderInfo_length;

         var obj = orderInfo.order;                          //현재주문의 메뉴개수구하기(item.orderInfo[0].order[n]의 n 구하기)
         var current_obj_length = Object.keys(obj).length;
         exports.current_obj_length = current_obj_length;

         var menu_tmp=[], amount_tmp=[], price_tmp=[], shot_tmp=[], size_tmp=[], date_tmp=[], time_tmp=[], type_tmp=[], obj_tmp=[], menu_list_tmp=[],
         paymentNum_list_tmp=[], totPrice_list_tmp=[], date_tmp_list=[], brandName_list_tmp=[], positionName_list_tmp=[], state_list_tmp=[];

         for (var q = 0; q < current_obj_length; q++){       // 현재주문의 메뉴개수만큼(item.orderInfo[0].order[n]의 n 만큼)
                                                             // app.js로 [ 'Cappuccino', 'Coldbrew' ]처럼 배열 형태로 넘어감.
                                                             // app.js에서 각각의 페이지로 넘길땐 res.render로 'menu' : dynamodb.menu 형태로 넘기고
                                                             // html에선 <%= menu[0]%> <%= menu[1]%> 이런 형태로 가져와서 찍으면 되지만,
                                                             // string으로 넘어가기 때문에 script상에선 "<%= menu["+i+"]%>" 형태로는 for문을 돌릴 수 없음.
                                                             // for문을 돌리고 싶으면 stript문에서 string으로 넘긴 값을 콤마로 split해서 배열에 넣어 사용해야함.(payment_complete.html)
           menu_tmp.push(orderInfo.order[q].menu);
           exports.menu = menu_tmp;

           amount_tmp.push(orderInfo.order[q].amount);
           exports.amount = amount_tmp;

           price_tmp.push(orderInfo.order[q].price);
           exports.price = price_tmp;

           shot_tmp.push(orderInfo.order[q].shot);
           exports.shot = shot_tmp;

           size_tmp.push(orderInfo.order[q].size);
           exports.size = size_tmp;

           date_tmp.push(orderInfo.order[q].date);
           exports.date = date_tmp;

           time_tmp.push(orderInfo.order[q].time);
           exports.time = time_tmp;

           type_tmp.push(orderInfo.order[q].type);
           exports.type = type_tmp;
         }

         for (var t = 0; t<obj_orderInfo_length; t++){        //역대 주문개수만큼 (item.orderInfo[n]의 n) (주로 payment_list.html에서 사용)
           var obj = item.orderInfo[t].order;                 //메뉴개수구하기(item.orderInfo[n].order[m]의 m 구하기)
           var obj_length = Object.keys(obj).length;
           obj_tmp.push(Object.keys(obj).length);
           exports.obj_length = obj_tmp;
           //console.log(obj_tmp);   //1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 2, 1, 1, 1, 1, 1, 1

           state_list_tmp.push(item.orderInfo[t].state);
           exports.state_list = state_list_tmp;

           brandName_list_tmp.push(item.orderInfo[t].brandName);
           exports.brandName_list = brandName_list_tmp;

           positionName_list_tmp.push(item.orderInfo[t].positionName);
           exports.positionName_list = positionName_list_tmp;

           paymentNum_list_tmp.push(item.orderInfo[t].paymentNum);
           exports.paymentNum_list = paymentNum_list_tmp;

           totPrice_list_tmp.push(item.orderInfo[t].totPrice);
           exports.totPrice_list = totPrice_list_tmp;

            for (var q = 0; q < obj_length; q++){
              date_tmp_list.push(item.orderInfo[t].order[q].date+" "+item.orderInfo[t].order[q].time);
              exports.date_list = date_tmp_list;

              menu_list_tmp.push(item.orderInfo[t].order[q].menu);
              exports.menu_list = menu_list_tmp;
              //console.log(menu_list_tmp);
            }
         }
       });
  }).catch(function (err) {
      console.log("[Promise][OrderList]Unable to read item. Error JSON: ", JSON.stringify(err, null, 2));
  });


  queryObjectPromise2.then(function (data) {
      console.log("[Promise][Twosome_Code]Query Item succeeded:D");
      data.Items.forEach(function(item) {
        exports.placeId = item.placeId;
        exports.positionName = item.positionName;
        exports.brandName = item.brandName;
        exports.requiredTime = item.requiredTime;
      });
  }).catch(function (err) {
      console.log("[Promise][Twosome_Code]Unable to read item. Error JSON: ", JSON.stringify(err, null, 2));
  });

}
