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
      console.log("Query Item succeeded: [user_query_5]");

           data.Items.forEach(function(item) {

             var positionName = item.positionName;//창동역점
             exports.positionName = positionName;

 //////////////////////////////////list에 들어가는 것들.../////////////////////////////////
              var obj_orderInfo = item.orderInfo;   //전체 orderinfo
              var obj_orderInfolength = Object.keys(obj_orderInfo).length;   //전체 _orderInfo길이
              exports.obj_orderInfolength =obj_orderInfolength;

             var obj_tmp=[], age_list_tmp=[], gender_list_tmp=[], paymentNum_list_tmp=[],estate_list_tmp=[],state_list_tmp=[], totPrice_list_tmp=[];
             var menu_list_tmp=[], amount_list_tmp=[], date_tmp_list=[], time_tmp_list=[], etype_list=[], type_list=[];


function computeAge(birthday)//나이구하기 함수
{
  var bday=parseInt(birthday.substring(6,8));
  var bmo=(parseInt(birthday.substring(4,6))-1);
  var byr=parseInt(birthday.substring(0,4));//태어난해
  //console.log(byr + "-" + bmo + "-" + bday);
  var age;
  var now = new Date();
  tday=now.getDate();
  tmo=now.getMonth();
  tyr=now.getFullYear();
  if((tmo > bmo)||(tmo==bmo & tday>=bday)) {//만나이구하기 위해
    age=byr;
  } else{
    age=byr+1;
  }
  return tyr-age;//이게 나이
};

             //배열로 값주기
 ////////////////////////////////////////////////////////////////////////////////////////////
 //차트만들기--4)연령에 따른 PieChart2를 만들기!!

             var obj2_length=[], obj2_tmp=[];
             var menu_10=[],menu_20=[],menu_30=[], menu_40=[];//연령별 메뉴

             for (var t = 0; t<obj_orderInfolength; t++){
               var obj = item.orderInfo[t].order;                 //메뉴개수구하기(item.orderInfo[n].order[m]의 m 구하기)
               var obj2_length = Object.keys(obj).length;
               obj2_tmp.push(obj2_length);

               for (var q = 0; q < obj2_length; q++){
                 var age=computeAge(item.orderInfo[t].age);      //나이구하기 23-위에 함수쓰기!!!!!!!!!!
                 //끝~var age=parseInt(item.orderInfo[t].age);      //숫자로 생각하기
                   if(age<20){                 //연령별로 나누기 !10대이하
                     var long = parseInt(item.orderInfo[t].order[q].amount)
                     for(var r = 0; r < long; r++){
                       menu_10.push(item.orderInfo[t].order[q].kmenu);
                     }
                   }else if(age<30){//20대
                     var long = parseInt(item.orderInfo[t].order[q].amount)
                     for(var r = 0; r < long; r++){
                       menu_20.push(item.orderInfo[t].order[q].kmenu);
                     }
                   }else if(age<40){//30대 이상
                     var long = parseInt(item.orderInfo[t].order[q].amount)
                     for(var r = 0; r < long; r++){
                       menu_30.push(item.orderInfo[t].order[q].kmenu);
                     }
                   }else{ //40대 이상
                     var long = parseInt(item.orderInfo[t].order[q].amount)
                     for(var r = 0; r < long; r++){
                       menu_40.push(item.orderInfo[t].order[q].kmenu);
                     }
                   }//이외 연령대가 없으면 카운트 하지 않기
               }//order끝_
             }//orderInfo끝
             //중간점검
             //console.log("20:"+menu_20);
             //여기서 값이 없을수도 있다~!!!!30:   (무)
             //밑에서 0을 포함하는것으로 재정의해준다!
             var count;
             var menu_10s = menu_10.sort(), list_10=[],num_10=[],listnum_10=[];//10대 기본 변수-마지막 변수설정은 객체이다!
             var menu_20s = menu_20.sort(), list_20=[],num_20=[],listnum_20=[];//20대
             var menu_30s = menu_30.sort(), list_30=[],num_30=[],listnum_30=[];//30대
             var menu_40s = menu_40.sort(), list_40=[],num_40=[],listnum_40=[];//40대이상

             //이제 count하기
             //10대일 경우
             if(menu_10s.length!=0){//10대 매뉴 카운트하기
               for (var i = 0; i < menu_10s.length; i = i + count) {
                 count = 1;
                 for (var j = i + 1; j < menu_10s.length; j++) {
                   if (menu_10s[i] === menu_10s[j])
                     count++;
                 }
                 var x = 0;
                 listnum_10.push(  { name: menu_10s[i], value:count });
               }
             }else{//메뉴리스트가 없을때는 아무것도 하지 않기!
               listnum_10.push( { name: '없음', value:0 });
             }

             listnum_10.sort(function (a, b) {            // value 기준으로 판매량 많은 순으로 정렬
               if (a.value > b.value) {
                 return -1;
               }
               if (a.value < b.value) {
                 return 1;
               }
               // a must be equal to b
               return 0;
             });
             //console.log(listnum_10);//아무것도 없으면 순서가 변하지 않음

             var listnum_105=[],listnum_205=[],listnum_305=[],listnum_405=[];//여기 항목이 6개 이상일때 배열객체로 쓴다..

             //메뉴항목이 5개 이상인경우 다른배열로 5개 항목옮기기
             if(listnum_10.length>5){
               for(var i=0;i<5;i++){
                 listnum_105.push(listnum_10[i]);
               }
               array10(listnum_105);
             }else{//5개 이하인경우 그냥 내보내기
               array10(listnum_10);
             }

             function array10(exam){
               for(var j=0;j<exam.length;j++){
                 list_10.push(exam[j].name);
                 num_10.push(exam[j].value);
               }
             }
             exports.list_10 = list_10;
             exports.num_10 = num_10;

             //20대일경우
             if(menu_20s.length!=0){//20대 매뉴 카운트하기
               for (var i = 0; i < menu_20s.length; i = i + count) {
                 count = 1;
                 for (var j = i + 1; j < menu_20s.length; j++) {
                   if (menu_20s[i] === menu_20s[j])
                     count++;
                 }
                 var x = 0;
                 listnum_20.push(  { name: menu_20s[i], value:count });//객체
               }
             }else{//메뉴리스트가 없을때는 아무것도 하지 않기!
               listnum_20.push( { name: '없음', value:0 });
             }

             listnum_20.sort(function (a, b) {            // value 기준으로 판매량 많은 순으로 정렬
               if (a.value > b.value) {
                 return -1;
               }
               if (a.value < b.value) {
                 return 1;
               }
               return 0;
             });

             //메뉴항목이 5개 이상인경우 다른배열로 5개 항목옮기기
             if(listnum_20.length>5){
               for(var i=0;i<5;i++){
                 listnum_205.push(listnum_20[i]);
               }
               array20(listnum_205);
             }else{//5개 이하인경우 그냥 내보내기
               array20(listnum_20);
             }

             function array20(exam){
               for(var j=0;j<exam.length;j++){
                 list_20.push(exam[j].name);
                 num_20.push(exam[j].value);
               }
             }
             exports.list_20 = list_20;
             exports.num_20 = num_20;

             //30대인 경우
             if(menu_30s.length!=0){//30대 이상 매뉴 카운트하기
               for (var i = 0; i < menu_30s.length; i = i + count) {
                 count = 1;
                 for (var j = i + 1; j < menu_30s.length; j++) {
                   if (menu_30s[i] === menu_30s[j])
                     count++;
                 }
                 var x = 0;
                 listnum_30.push(  { name: menu_30s[i], value:count });//객체
               }
             }else{//메뉴리스트가 없을때는 아무것도 하지 않기!
               listnum_30.push( { name: '없음', value:0 });
             }

             listnum_30.sort(function (a, b) {            // value 기준으로 판매량 많은 순으로 정렬
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
             if(listnum_30.length>5){
               for(var i=0;i<5;i++){
                 listnum_305.push(listnum_30[i]);
               }
               array30(listnum_305);
             }else{//5개 이하인경우 그냥 내보내기
               array30(listnum_30);
             }

             function array30(exam){
               for(var j=0;j<exam.length;j++){
                 list_30.push(exam[j].name);
                 num_30.push(exam[j].value);
               }
             }
             exports.list_30 = list_30;
             exports.num_30 = num_30;

             //40대인경우
             if(menu_40s.length!=0){//40대 이상 매뉴 카운트하기
               for (var i = 0; i < menu_40s.length; i = i + count) {
                 count = 1;
                 for (var j = i + 1; j < menu_40s.length; j++) {
                   if (menu_40s[i] === menu_40s[j])
                     count++;
                 }
                 var x = 0;
                 listnum_40.push(  { name: menu_40s[i], value:count });//객체
               }
             }else{//메뉴리스트가 없을때는 아무것도 하지 않기!
               listnum_40.push( { name: '없음', value:0 });
             }

             listnum_40.sort(function (a, b) {            // value 기준으로 판매량 많은 순으로 정렬
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
             if(listnum_40.length>5){
               for(var i=0;i<5;i++){
                 listnum_405.push(listnum_40[i]);
               }
               array40(listnum_405);
             }else{//5개 이하인경우 그냥 내보내기
               array40(listnum_40);
             }

             function array40(exam){
               for(var j=0;j<exam.length;j++){
                 list_40.push(exam[j].name);
                 num_40.push(exam[j].value);
               }
             }
             exports.list_40 = list_40;
             exports.num_40 = num_40;
           });//data.items 이거끝
  }).catch(function (err) {
      console.log("Unable to read item. Error JSON: ", JSON.stringify(err, null, 2));
  });
};
