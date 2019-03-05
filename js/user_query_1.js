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
      console.log("Query Item succeeded: [user_query_1]");

           data.Items.forEach(function(item) {

             var positionName = item.positionName;//창동역점
             exports.positionName = positionName;

 //////////////////////////////////list에 들어가는 것들.../////////////////////////////////
              var obj_orderInfo = item.orderInfo;   //전체 orderinfo
              var obj_orderInfolength = Object.keys(obj_orderInfo).length;   //전체 _orderInfo길이
              exports.obj_orderInfolength =obj_orderInfolength;

             var obj_tmp=[], age_list_tmp=[], gender_list_tmp=[], paymentNum_list_tmp=[],estate_list_tmp=[],state_list_tmp=[], totPrice_list_tmp=[];
             var menu_list_tmp=[], amount_list_tmp=[], date_tmp_list=[], time_tmp_list=[], etype_list=[], type_list=[];
             //배열로 값주기
             var orderNum_list_tmp=[],time_tmp_list=[];

              for (var t = 0; t<obj_orderInfolength; t++){         //역대 주문개수만큼 (item.orderInfo[n]의 n)
                var obj = item.orderInfo[t].order;                 //메뉴구하기(item.orderInfo[n].order[m]의 m 구하기)
                var obj_length = Object.keys(obj).length;        //object는 개수를 length만으로 구분안되서~
                obj_tmp.push(obj_length);
                exports.obj_length = obj_tmp;                  //메뉴위 개수

                orderNum_list_tmp.push(item.orderInfo[t].orderNum);//결제정보--이거
                exports.orderNum_list = orderNum_list_tmp;
                console.log("orderNum_list_tmp"+orderNum_list_tmp);
                console.log("orderNum_list_tmp"+orderNum_list_tmp);

                estate_list_tmp.push(item.orderInfo[t].state);//주문상태

                totPrice_list_tmp.push(item.orderInfo[t].totPrice);//총합--이거
                exports.totPrice_list = totPrice_list_tmp;

                for (var q = 0; q < obj_length; q++){//하나의 주문별 메뉴 여려개의 내용
                  amount_list_tmp.push(item.orderInfo[t].order[q].amount);//-밑에
                  exports.amount_list = amount_list_tmp;//차트도

                  date_tmp_list.push(item.orderInfo[t].order[q].date);//-밑에
                  exports.date_list = date_tmp_list;//차트도

                  menu_list_tmp.push(item.orderInfo[t].order[q].kmenu);//메뉴 한글
                  exports.menu_list = menu_list_tmp;

                  time_tmp_list.push(item.orderInfo[t].order[q].time);
                  exports.time_list = time_tmp_list;

                  etype_list.push(item.orderInfo[t].order[q].type);
                }
              }

              for(var i =0; i<etype_list.length;i++){//eat in take out--이것 한글로 바꾸기-배열빠지는일이없도록 ifelse써줌
                if(etype_list[i]=="packing"){
                  type_list.push('포장');
                }else{
                  type_list.push('매장이용');
                }
              }
              exports.type_list = type_list;

              for(var i =0; i<estate_list_tmp.length;i++){//주문상태 바꿔주기
                if(estate_list_tmp[i]=="1"){
                  state_list_tmp.push('주문접수중');
                }else if(estate_list_tmp[i]=="2"){
                  state_list_tmp.push('제조중');
                }else if(estate_list_tmp[i]=="3"){
                  state_list_tmp.push('제조완료');
                }else{
                  state_list_tmp.push('수령완료');
                }
              }
              exports.state_list_tmp = state_list_tmp;
 ////////////////////////////////////////////////////////////////////////////////////////////

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
 ///////////////////////////////////////////////////////////////////////////////////////////////////
 //차트만들기--2)판매량에 따른 일주일간 막대Chart를 만들기!!
 //이건 listlist차트와 같이 있어야함!!
             //list에 있는값이 그대로 필요하다
             var standard1 = new Date().toISOString().slice(0,10);//기준날짜 -오늘 2018-11-11
             var standardDate = new Date(standard1);//기준-어떻게 정할까?
             var baseDate = standardDate;
             baseDate.setDate(baseDate.getDate() -1);//1일 빼기
             var standard2 = new Date(baseDate).toISOString().slice(0,10);//하루전
             baseDate.setDate(baseDate.getDate() -1);//1일 빼기
             var standard3 = new Date(baseDate).toISOString().slice(0,10);//이틀전
             baseDate.setDate(baseDate.getDate() -1);//1일 빼기
             var standard3 = new Date(baseDate).toISOString().slice(0,10);//삼일전
             baseDate.setDate(baseDate.getDate() -1);//1일 빼기
             var standard4 = new Date(baseDate).toISOString().slice(0,10);//사일전
             baseDate.setDate(baseDate.getDate() -1);//1일 빼기
             var standard5 = new Date(baseDate).toISOString().slice(0,10);//오일전
             baseDate.setDate(baseDate.getDate() -1);//1일 빼기
             var standard6 = new Date(baseDate).toISOString().slice(0,10);//육일전
             baseDate.setDate(baseDate.getDate() -1);//1일 빼기
             var standard7 = new Date(baseDate).toISOString().slice(0,10);//칠일전

             var amount_list1=0,amount_list2=0,amount_list3=0,amount_list4=0,amount_list5=0,amount_list6=0,amount_list7=0;
             for(i=0; i< date_tmp_list.length; i++){//이거 다 검사해야하나?무조건??다른방법은??
               if(standard1 == date_tmp_list[i]){//1일--일주일간 보기
                 amount_list1 += parseInt(amount_list_tmp[i]);//양 더해주기
               }else if(standard2 == date_tmp_list[i]){//2일
                 amount_list2 += parseInt(amount_list_tmp[i]);
               }else if(standard3 == date_tmp_list[i]){
                 amount_list3 += parseInt(amount_list_tmp[i]);
               }else if(standard4 == date_tmp_list[i]){
                 amount_list4 += parseInt(amount_list_tmp[i]);
               }else if(standard5 == date_tmp_list[i]){
                 amount_list5 += parseInt(amount_list_tmp[i]);
               }else if(standard6 == date_tmp_list[i]){
                 amount_list6 += parseInt(amount_list_tmp[i]);
               }else if(standard7 == date_tmp_list[i]){
                 amount_list7 += parseInt(amount_list_tmp[i]);
               }
             }
             var date_array=[];//결과로 나온 일주일의 날짜들
             date_array.push(standard1);
             date_array.push(standard2);
             date_array.push(standard3);
             date_array.push(standard4);
             date_array.push(standard5);
             date_array.push(standard6);
             date_array.push(standard7);
             var amount_array = [];//결과로 나온 일주일간의 판매량
             amount_array.push(amount_list1);
             amount_array.push(amount_list2);
             amount_array.push(amount_list3);
             amount_array.push(amount_list4);
             amount_array.push(amount_list5);
             amount_array.push(amount_list6);
             amount_array.push(amount_list7);
             exports.date_array = date_array;//[ '2018-10-14','2018-10-13','2018-10-11','2018-10-10','2018-10-09','2018-10-08','2018-10-07' ]
             exports.amount_array = amount_array;//[ 12, 0, 0, 0, 0, 0, 0 ]

           });//data.items 이거끝
  }).catch(function (err) {
      console.log("Unable to read item. Error JSON: ", JSON.stringify(err, null, 2));
  });

};
