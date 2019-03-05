// dynamodb DB 쿼리

module.exports.send = function (j){
  var AWS = require('aws-sdk');
  var dynamodb = new AWS.DynamoDB({ region: 'us-east-1' });
  var docClient = new AWS.DynamoDB.DocumentClient({ service: dynamodb });
  var placeId_num = j;

  var maxlist_f10 ="a",maxlist_f20="a",maxlist_f30="a",maxlist_f40="a",maxlist_m10="a",maxlist_m20="a",maxlist_m30="a",maxlist_m40="a";//영어
  var maxlistk_f10,maxlistk_f20,maxlistk_f30,maxlistk_f40 ,maxlistk_m10,maxlistk_m20,maxlistk_m30,maxlistk_m40;//한글
  var maxurl_f10,maxurl_f20,maxurl_f30,maxurl_f40,maxurl_m10,maxurl_m20,maxurl_m30,maxurl_m40;//url

  var Twosome_Code_params = {
      TableName : "Twosome_Code",                                    //OrderList
      ProjectionExpression:"brandName, orderInfo, placeId, positionName,recommendmenu,requiredTime",
      KeyConditionExpression: "placeId = :j",
      ExpressionAttributeValues: {
          ":j": placeId_num
      }
  };

  docClient.query(Twosome_Code_params, function(err, data) {
      if (err) {
          console.log("[user_recommend] Unable to query. Error:", JSON.stringify(err, null, 2));
      } else {
          console.log("Query succeeded [user_recommend]");

          data.Items.forEach(function(item) {
//////////////////////////////////list에 들어가는 것들.../////////////////////////////////
             var obj_orderInfo = item.orderInfo;   //전체 orderinfo
             var obj_orderInfolength = Object.keys(obj_orderInfo).length;   //전체 _orderInfo길이
             exports.obj_orderInfolength =obj_orderInfolength;

            //만나이구하는 함수--저밑에서도 쓴다!!
            var menu_f10=[],menu_f20=[],menu_f30=[],menu_f40=[],menu_m10=[],menu_m20=[],menu_m30=[],menu_m40=[];//메뉴추천을 위한 배열!!
            //이거 객체로 해서 {name : 영어이름, kname : 한글이름}이 배열로 들어가도록...

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

            var obj2_length=[], obj2_tmp=[];
            for (var t = 0; t<obj_orderInfolength; t++){
              var obj = item.orderInfo[t].order;                 //메뉴개수구하기(item.orderInfo[n].order[m]의 m 구하기)
              var obj2_length = Object.keys(obj).length;
              obj2_tmp.push(obj2_length);

              for (var q = 0; q < obj2_length; q++){
                //parseInt(item.orderInfo[t].age)
                var age=computeAge(item.orderInfo[t].age);      //나이구하기 23
                if(item.orderInfo[t].gender=='female'){       // 남녀 성별 나누기
                  if(age<20){                 //연령별로 나누기------다시 나눠보기!!10대이하
                    var long = parseInt(item.orderInfo[t].order[q].amount)
                    for(var r = 0; r < long; r++){//객체생성
                      menu_f10.push({name:item.orderInfo[t].order[q].menu, kname:item.orderInfo[t].order[q].kmenu, url:item.orderInfo[t].order[q].url});
                    }
                  }else if(age<30){//20대
                    var long = parseInt(item.orderInfo[t].order[q].amount)
                    for(var r = 0; r < long; r++){
                      menu_f20.push({name:item.orderInfo[t].order[q].menu, kname:item.orderInfo[t].order[q].kmenu, url:item.orderInfo[t].order[q].url});
                    }
                  }else if(age<40){//30대 이상
                    var long = parseInt(item.orderInfo[t].order[q].amount)
                    for(var r = 0; r < long; r++){
                      menu_f30.push({name:item.orderInfo[t].order[q].menu, kname:item.orderInfo[t].order[q].kmenu, url:item.orderInfo[t].order[q].url});
                    }
                  }else {//40대 이상
                    var long = parseInt(item.orderInfo[t].order[q].amount)
                    for(var r = 0; r < long; r++){
                      menu_f40.push({name:item.orderInfo[t].order[q].menu, kname:item.orderInfo[t].order[q].kmenu, url:item.orderInfo[t].order[q].url});
                    }
                  } //이외 연령대가 없으면 카운트 하지 않기
                }else if(item.orderInfo[t].gender=='male'){//남자일때~
                  if(age<20){                 //10대이하
                    var long = parseInt(item.orderInfo[t].order[q].amount)
                    for(var r = 0; r < long; r++){
                      menu_m10.push({name:item.orderInfo[t].order[q].menu, kname:item.orderInfo[t].order[q].kmenu, url:item.orderInfo[t].order[q].url});
                    }
                  }else if(age<30){//20대
                    var long = parseInt(item.orderInfo[t].order[q].amount)
                    for(var r = 0; r < long; r++){
                      menu_m20.push({name:item.orderInfo[t].order[q].menu, kname:item.orderInfo[t].order[q].kmenu, url:item.orderInfo[t].order[q].url});
                    }
                  }else if(age<40){//30대 이상
                    var long = parseInt(item.orderInfo[t].order[q].amount)
                    for(var r = 0; r < long; r++){
                      menu_m30.push({name:item.orderInfo[t].order[q].menu, kname:item.orderInfo[t].order[q].kmenu, url:item.orderInfo[t].order[q].url});
                    }
                  }else {//40대 이상
                    var long = parseInt(item.orderInfo[t].order[q].amount)
                    for(var r = 0; r < long; r++){
                      menu_m40.push({name:item.orderInfo[t].order[q].menu, kname:item.orderInfo[t].order[q].kmenu, url:item.orderInfo[t].order[q].url});
                    }
                  }//이외 연령대가 없으면 카운트 하지 않기
                }//남자일때 검사 끝
              }//order끝_

            }//orderInfo끝
            //정렬
            var list_f10 = [], listk_f10 = [], num_f10 = [], max_f10, count;//기본 변수

            // 영어메뉴이름 기준으로 정렬
            menu_f10.sort(function (a, b) {
              if (a.name > b.name) {
                return 1;
              }
              if (a.name < b.name) {
                return -1;
              }
              return 0;
            });

//////////////////////////////////////10대 여자/////////////////////////////////////////////////////////
            if(parseInt(menu_f10.length)!=0){
              for (var i = 0; i < menu_f10.length; i = i + count) {
                count = 1;
                for (var j = i + 1; j < menu_f10.length; j++) {
                  if (menu_f10[i].kname === menu_f10[j].kname)
                    count++;
                }
                console.log(menu_f10s[i] + " menu_f10s= " + count );    //coffeewhippedcreamcakepieces = 1
                var x = 0;
                list_f10.push(menu_f10s[i].name);                        //배열로 나타내기-메뉴
                listk_f10.push(menu_f10s[i].kname);
                url_f10.push(menu_f10s[i].url);
                num_f10.push(count);                             //카운드하기
              }
              max_f10 = Math.max.apply(null,num_f10);           //최대값구하기이이이

              for (var key in num_f10) {              //foreach
                if(num_f10[key]===max_f10){             //max와 같은 숫자일경우!!
                  if(maxlist_f10 == "a"){
                    maxlist_f10=list_f10[key];
                    maxlistk_f10=listk_f10[key];
                    maxurl_f10=url_f10[key];
                  }else{
                    maxlist_f10=maxlist_f10+","+list_f10[key];
                    maxlistk_f10=maxlistk_f10+","+listk_f10[key];
                    maxurl_f10=maxurl_f10+","+url_f10[key];
                  }
                }
              }
            }else{
              maxlist_f10='icedcafeamericano';
              maxlistk_f10='아이스카페아메리카노';
              maxurl_f10='https://s3.amazonaws.com/twosome-db-url/181_big_img.jpg';
            }
            console.log(maxlistk_f10 + " maxlistk_f10 최대 메뉴= " + count );    //coffeewhippedcreamcakepieces = 1

//dynamodb에 넣기이이이
            var maxf10 = {  "ename": maxlist_f10,  "kname": maxlistk_f10, "url": maxurl_f10  };

            var paramsf1 = {
                TableName:"Twosome_Code",       //
                Key:{"placeId": placeId_num},   //기본키
                UpdateExpression: "set recommendmenu[0].female[0].teens = :max", //업데이트 할 부분
                ExpressionAttributeValues:{":max" :maxf10 }, //변수를 대입
                ReturnValues:"UPDATED_NEW"//UpdateItem 작업 이후에 나타나는대로 업데이트 된 속성 만 반환
            };
            docClient.update(paramsf1, function(err, data) {
                if (err) {
                    console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    console.log("UpdateItem succeeded f1:", JSON.stringify(data, null, 2));
                }
            });//update 끝

          });//data.items 이거끝
      }
  });//퀴리끝
};
