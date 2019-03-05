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
      console.log("Query Item succeeded: [user_query_3]");

           data.Items.forEach(function(item) {

             var positionName = item.positionName;//창동역점
             exports.positionName = positionName;
             var obj_orderInfo = item.orderInfo;   //전체 orderinfo
             var obj_orderInfolength = Object.keys(obj_orderInfo).length;   //전체 _orderInfo길이
             exports.obj_orderInfolength =obj_orderInfolength;

            var obj_tmp=[], age_list_tmp=[], gender_list_tmp=[], paymentNum_list_tmp=[],estate_list_tmp=[],state_list_tmp=[], totPrice_list_tmp=[];
            var menu_list_tmp=[], amount_list_tmp=[], date_tmp_list=[], time_tmp_list=[], etype_list=[], type_list=[];

 ////////////////////////////////////////////////////////////////////////////////////////////
 //차트만들기--3)성별에 따른 PieChart를 만들기!!
             var obj2_length=[], obj2_tmp=[];
             var menu_mk=[],menu_fk=[];//남녀별 한글메뉴

             for (var t = 0; t<obj_orderInfolength; t++){
               var obj = item.orderInfo[t].order;                 //메뉴개수구하기(item.orderInfo[n].order[m]의 m 구하기)
               var obj2_length = Object.keys(obj).length;

               for (var q = 0; q < obj2_length; q++){
                 if(item.orderInfo[t].gender=='female'){       // 남녀 성별 나누기-여자부터
                   var long = parseInt(item.orderInfo[t].order[q].amount)//메뉴를 다른배열로 나누기!!!
                   for(var r = 0; r < long; r++){
                     menu_fk.push(item.orderInfo[t].order[q].kmenu);

                   }
                 }else if(item.orderInfo[t].gender=='male'){//남자일때~
                   var long = parseInt(item.orderInfo[t].order[q].amount)
                   for(var r = 0; r < long; r++){
                     menu_mk.push(item.orderInfo[t].order[q].kmenu);
                   }
                 }//남자일때 검사 끝
               }//order끝_
             }//전체끝...

             var count;
             var menu_fs = menu_fk.sort(), list_f=[],num_f=[],listnum_f=[],listnum_f5=[];//여자 기본 변수-객체로해보기
             var menu_ms = menu_mk.sort(), list_m=[],num_m=[],listnum_m=[],listnum_m5=[];//남자
             //이제 count하기
             if(menu_fs.length!=0){//여자일때
               for (var i = 0; i < menu_fs.length; i = i + count) {
                 count = 1;
                 for (var j = i + 1; j < menu_fs.length; j++) {
                   if (menu_fs[i] === menu_fs[j])
                     count++;
                 }
                 var x = 0;
                 listnum_f.push(  { name: menu_fs[i], value:count });
               }
             }else{//메뉴리스트가 없을때는 아무것도 하지 않기!
               listnum_f.push( { name: '없음', value:0 });
             }

             listnum_f.sort(function (a, b) {            // value 기준으로 판매량 많은 순으로 정렬
               if (a.value > b.value) {
                 return -1;
               }
               if (a.value < b.value) {
                 return 1;
               }
               // a must be equal to b
               return 0;
             });

             if(listnum_f.length>5){
               for(var i=0;i<5;i++){
                 listnum_f5.push(listnum_f[i]);
               }
               //console.log(listnum_f5);//항목이 6개이상이면 3번출력!
               arrayf(listnum_f5);//다시 배열로!!!..ㅜ객체어렵다아..
             }else{//5개 이하인경우 그냥 내보내기
               arrayf(listnum_f);
             }

             function arrayf(exam){
               for(var j=0;j<exam.length;j++){
                 list_f.push(exam[j].name);
                 num_f.push(exam[j].value);
               }
             }
             exports.list_f = list_f;
             exports.num_f = num_f;

             if(menu_ms.length!=0){//남자일때
               for (var i = 0; i < menu_ms.length; i = i + count) {
                 count = 1;
                 for (var j = i + 1; j < menu_ms.length; j++) {
                   if (menu_ms[i] === menu_ms[j])
                     count++;
                 }
                 var x = 0;
                 listnum_m.push(  { name: menu_ms[i], value:count });
               }
             }else{//메뉴리스트가 없을때는 아무것도 하지 않기!
               listnum_m.push( { name: '없음', value:0 });
             }
             //console.log(listnum_m);//[ { name: '없음', value: 1 } ]

             listnum_m.sort(function (a, b) {            // value 기준으로 판매량 많은 순으로 정렬
               if (a.value > b.value) {
                 return -1;
               }
               if (a.value < b.value) {
                 return 1;
               }
               // a must be equal to b
               return 0;
             });
             //console.log(listnum_m);//아무것도 없으면 순서가 변하지 않음

             //메뉴항목이 5개 이상인경우 다른배열로 판매량이 많은 5개만 내보내기 위해서 항목옮기기
             if(listnum_m.length>5){
               for(var i=0;i<5;i++){
                 listnum_m5.push(listnum_m[i]);
               }
               arraym(listnum_m5);
             }else{//5개 이하인경우 그냥 내보내기
               arraym(listnum_m);
             }

             function arraym(exam){
               for(var j=0;j<exam.length;j++){
                 list_m.push(exam[j].name);
                 num_m.push(exam[j].value);
               }
             }
             exports.list_m = list_m;
             exports.num_m = num_m;
           });//data.items 이거끝
  }).catch(function (err) {
      console.log("Unable to read item. Error JSON: ", JSON.stringify(err, null, 2));
  });

};
