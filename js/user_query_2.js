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
      console.log("Query Item succeeded: [user_query_2]");

           data.Items.forEach(function(item) {

             var positionName = item.positionName;//창동역점
             exports.positionName = positionName;
             var obj_orderInfo = item.orderInfo;   //전체 orderinfo
             var obj_orderInfolength = Object.keys(obj_orderInfo).length;   //전체 _orderInfo길이
             exports.obj_orderInfolength =obj_orderInfolength;

            var obj_tmp=[], age_list_tmp=[], gender_list_tmp=[], paymentNum_list_tmp=[],estate_list_tmp=[],state_list_tmp=[], totPrice_list_tmp=[];
            var menu_list_tmp=[], amount_list_tmp=[], date_tmp_list=[], time_tmp_list=[], etype_list=[], type_list=[];

 ///1) 총 판매량~
 //일단 5개 종류의 음식을 확인하기
             var obj2_length=[], obj2_tmp=[];
             var menu_listk=[];//메뉴별 한글메뉴

             for (var t = 0; t<obj_orderInfolength; t++){
               var obj = item.orderInfo[t].order;                 //메뉴개수구하기(item.orderInfo[n].order[m]의 m 구하기)
               var obj2_length = Object.keys(obj).length;

               for (var q = 0; q < obj2_length; q++){
                 var long = parseInt(item.orderInfo[t].order[q].amount)
                 for(var r = 0; r < long; r++){
                   menu_listk.push(item.orderInfo[t].order[q].kmenu);
                 }
               }//order끝_
             }//전체끝...

             var count;
             var menu_lists = menu_listk.sort(),listnum_list=[],listnum_list5=[];//판매변수
             var list_list=[],num_list=[];
             //이제 count하기
             if(menu_lists.length!=0){//정렬후
               for (var i = 0; i < menu_lists.length; i = i + count) {
                 count = 1;
                 for (var j = i + 1; j < menu_lists.length; j++) {
                   if (menu_lists[i] === menu_lists[j])
                     count++;
                 }
                 //console.log(menu_lists[i] + " = " + count );    //coffeewhippedcreamcakepieces = 1
                 var x = 0;
                 listnum_list.push(  { name: menu_lists[i], value:count });
               }
             }else{//메뉴리스트가 없을때는 아무것도 하지 않기!
               listnum_list.push( { name: '없음', value:0 });
             }

             listnum_list.sort(function (a, b) {            // value 기준으로 판매량 많은 순으로 정렬
               if (a.value > b.value) {
                 return -1;
               }
               if (a.value < b.value) {
                 return 1;
               }
               // a must be equal to b
               return 0;
             });

             //메뉴항목이 5개 이상인경우 다른배열로 5개 항목옮기기
             if(listnum_list.length>5){
               for(var i=0;i<5;i++){
                 listnum_list5.push(listnum_list[i]);
               }
               arraylist(listnum_list5);//다시 배열로!!!..ㅜ객체어렵다아..
             }else{//5개 이하인경우 그냥 내보내기
               arraylist(listnum_list);
             }

             function arraylist(exam){
               for(var j=0;j<exam.length;j++){
                 list_list.push(exam[j].name);
                 num_list.push(exam[j].value);
               }
             }
             exports.list_list = list_list;
             exports.num_list = num_list;
           });//data.items 이거끝
  }).catch(function (err) {
      console.log("Unable to read item. Error JSON: ", JSON.stringify(err, null, 2));
  });

};
