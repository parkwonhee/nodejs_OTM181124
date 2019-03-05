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
              //console.log('amountmenu2='+menu_f20);

            }//orderInfo끝
            //totPrice_list_tmp.push(age_list_tmp);배열 !!!!
            //console.log('amountmenu='+totPrice_list_tmp);
            //정렬
            var list_f10 = [], listk_f10 = [], num_f10 = [], max_f10, count;//기본 변수
            var list_f20 = [], listk_f20 = [], num_f20 = [], max_f20;
            var list_f30 = [], listk_f30 = [],num_f30 = [], max_f30;
            var list_f40 = [], listk_f40 = [],num_f40 = [], max_f40;

            var list_m10 = [], listk_m10 = [], num_m10 = [], max_m10;
            var list_m20 = [], listk_m20 = [], num_m20 = [], max_m20;
            var list_m30 = [], listk_m30 = [], num_m30 = [], max_m30;
            var list_m40 = [], listk_m40 = [], num_m40 = [], max_m40;
            var url_f10 = [], url_f20 = [], url_f30 = [], url_f40 = [], url_m10 = [], url_m20 = [], url_m30 = [], url_m40 = [];

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

            menu_f20.sort(function (a, b) {
              if (a.name > b.name) {
                return 1;
              }
              if (a.name < b.name) {
                return -1;
              }
              return 0;
            });

            menu_f30.sort(function (a, b) {
              if (a.name > b.name) {
                return 1;
              }
              if (a.name < b.name) {
                return -1;
              }
              return 0;
            });

            menu_f40.sort(function (a, b) {
              if (a.name > b.name) {
                return 1;
              }
              if (a.name < b.name) {
                return -1;
              }
              return 0;
            });

            menu_m10.sort(function (a, b) {
              if (a.name > b.name) {
                return 1;
              }
              if (a.name < b.name) {
                return -1;
              }
              return 0;
            });

            menu_m20.sort(function (a, b) {
              if (a.name > b.name) {
                return 1;
              }
              if (a.name < b.name) {
                return -1;
              }
              return 0;
            });

            menu_m30.sort(function (a, b) {
              if (a.name > b.name) {
                return 1;
              }
              if (a.name < b.name) {
                return -1;
              }
              return 0;
            });

            menu_m40.sort(function (a, b) {
              if (a.name > b.name) {
                return 1;
              }
              if (a.name < b.name) {
                return -1;
              }
              return 0;
            });

//var maxlist_f10 = [],maxlist_f20 = [],maxlist_f30 = [],maxlist_f40 = [],maxlist_m10 = [],maxlist_m20 = [],maxlist_m30 = [],maxlist_m40 = [];
//위에넣음
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
///////////////////////////////20대 여자////////////////////////////////////////////////////////////////
            if(parseInt(menu_f20.length)!=0){
              for (var i = 0; i < menu_f20.length; i = i + count) {
                count = 1;
                for (var j =( i + 1); j < menu_f20.length; j++) {
                  if (menu_f20[i].kname === menu_f20[j].kname)
                    count++;
                }
                var x = 0;
                list_f20.push(menu_f20[i].name);                        //배열로 나타내기-메뉴-영어메뉴
                listk_f20.push(menu_f20[i].kname);
                url_f20.push(menu_f20[i].url);
                num_f20.push(count);                             //카운드하기
              }

              max_f20 = Math.max.apply(null,num_f20);           //최대값구하기이이이

              for (var key in num_f20) {              //foreach
                if(num_f20[key]===max_f20){             //max와 같은 숫자일경우!!
                  if(maxlist_f20 == "a"){
                    maxlist_f20=list_f20[key];
                    maxlistk_f20=listk_f20[key];
                    maxurl_f20=url_f20[key];
                  }else{
                    maxlist_f20=maxlist_f20+","+list_f20[key];
                    maxlistk_f20=maxlistk_f20+","+listk_f20[key];
                    maxurl_f20=maxurl_f20+","+url_f20[key];
                  }
                }
              }
            }else{
              maxlist_f20='icedcafeamericano';
              maxlistk_f20='아이스카페아메리카노';
              maxurl_f20='https://s3.amazonaws.com/twosome-db-url/181_big_img.jpg';
            }

//////////////////////////////////////////////30대 여자///////////////////////////////////////////////////////
            if(parseInt(menu_f30.length)!=0){
              for (var i = 0; i < menu_f30.length; i = i + count) {
                count = 1;
                for (var j = i + 1; j < menu_f30.length; j++) {
                  if (menu_f30[i].kname === menu_f30[j].kname)
                    count++;
                }
                var x = 0;
                list_f30.push(menu_f30[i].name);                        //배열로 나타내기-메뉴
                listk_f30.push(menu_f30[i].kname);
                url_f30.push(menu_f30s[i].url);
                num_f30.push(count);                             //카운드하기
              }
              max_f30 = Math.max.apply(null,num_f30);           //최대값구하기이이이

              for (var key in num_f30) {              //foreach
                if(num_f30[key]===max_f30){             //max와 같은 숫자일경우!!
                  if(maxlist_f30 == "a"){
                    maxlist_f30=list_f30[key];
                    maxlistk_f30=listk_f30[key];
                    maxurl_f30=url_f30[key];
                  }else{
                    maxlist_f30=maxlist_f30+","+list_f30[key];
                    maxlistk_f30=maxlistk_f30+","+listk_f30[key];
                    maxurl_f30=maxurl_f30+","+url_f30[key];
                  }
                }
              }
            }else{
              maxlist_f30='icedcafeamericano';
              maxlistk_f30='아이스카페아메리카노';
              maxurl_f30='https://s3.amazonaws.com/twosome-db-url/181_big_img.jpg';
            }

//////////////////////////////////////////////40대 여자///////////////////////////////////////////////////////
            if(parseInt(menu_f40.length)!=0){
              for (var i = 0; i < menu_f40.length; i = i + count) {
                count = 1;
                for (var j = i + 1; j < menu_f40.length; j++) {
                  if (menu_f40[i].kname === menu_f40[j].kname)
                    count++;
                }
                var x = 0;
                list_f40.push(menu_f40[i].name);                        //배열로 나타내기-메뉴
                listk_f40.push(menu_f40[i].kname);
                url_f40.push(menu_f40s[i].url);
                num_f40.push(count);                             //카운드하기
              }
              max_f40 = Math.max.apply(null,num_f40);           //최대값구하기이이이

              for (var key in num_f40) {              //foreach
                if(num_f40[key]===max_f40){             //max와 같은 숫자일경우!!
                  if(maxlist_f40 == "a"){
                    maxlist_f40=list_f40[key];
                    maxlistk_f40=listk_f40[key];
                    maxurl_f40=url_f40[key];
                  }else{
                    maxlist_f40=maxlist_f40+","+list_f40[key];
                    maxlistk_f40=maxlistk_f40+","+listk_f40[key];
                    maxurl_f40=maxurl_f40+","+url_f40[key];
                  }
                }
              }
            }else{
              maxlist_f40='icedcafeamericano';
              maxlistk_f40='아이스카페아메리카노';
              maxurl_f40='https://s3.amazonaws.com/twosome-db-url/181_big_img.jpg';
            }

/////////////////////////////////////10대 남자////////////////////////////////////////////////////////////
            if(parseInt(menu_m10.length)!=0){
              for (var i = 0; i < menu_m10.length; i = i + count) {
                count = 1;
                for (var j = i + 1; j < menu_m10.length; j++) {
                  if (menu_m10[i].kname === menu_m10[j].kname)
                    count++;
                }
                console.log(menu_m10[i] + " = " + count );    //coffeewhippedcreamcakepieces = 1
                var x = 0;
                list_m10.push(menu_m10[i].name);                        //배열로 나타내기-메뉴
                listk_m10.push(menu_m10[i].kname);
                url_m10.push(menu_m10s[i].url);
                num_m10.push(count);                             //카운드하기
              }
              max_m10 = Math.max.apply(null,num_m10);           //최대값구하기이이이
              console.log('max_m10 : '+max_m10);

              for (var key in num_m10) {              //foreach
                if(num_m10[key]===max_m10){             //max와 같은 숫자일경우!!
                  if(maxlist_m10 == "a"){
                    maxlist_m10=list_m10[key];
                    maxlistk_m10=listk_m10[key];
                    maxurl_m10=url_m10[key];
                  }else{
                    maxlist_m10=maxlist_m10+","+list_m10[key];
                    maxlistk_m10=maxlistk_m10+","+listk_m10[key];
                    maxurl_m10=maxurl_m10+","+url_m10[key];
                  }
                }
              }
            }else{
              maxlist_m10='icedcafeamericano';
              maxlistk_m10='아이스카페아메리카노';
              maxurl_m10='https://s3.amazonaws.com/twosome-db-url/181_big_img.jpg';
            }

/////////////////////////////////////////////////////////////////20대 남자//////////////////////////////

            if(parseInt(menu_m20.length)!=0){
              for (var i = 0; i < menu_m20.length; i = i + count) {
                count = 1;
                for (var j = i + 1; j < menu_m20.length; j++) {
                  if (menu_m20[i].kname === menu_m20[j].kname)
                    count++;
                }
                console.log(menu_m20[i] + " = " + count );    //coffeewhippedcreamcakepieces = 1
                var x = 0;
                list_m20.push(menu_m20[i].name);                        //배열로 나타내기-메뉴
                listk_m20.push(menu_m20[i].kname);
                url_m20.push(menu_m20[i].url);
                num_m20.push(count);                             //카운드하기

              }
              max_m20 = Math.max.apply(null,num_m20);           //최대값구하기이이이
              console.log(max_m20);

              for (var key in num_m20) {              //foreach
                if(num_m20[key]===max_m20){             //max와 같은 숫자일경우!!
                  if(maxlist_m20 == "a"){
                    maxlist_m20=list_m20[key];
                    maxlistk_m20=listk_m20[key];
                    maxurl_m20=url_m20[key];
                  }else{
                    maxlist_m20=maxlist_m20+","+list_m20[key];
                    maxlistk_m20=maxlistk_m20+","+listk_m20[key];
                    maxurl_m20=maxurl_m20+","+url_m20[key];
                  }
                }
              }
            }else{
              maxlist_m20='icedcafeamericano';
              maxlistk_m20='아이스카페아메리카노';
              maxurl_m20='https://s3.amazonaws.com/twosome-db-url/181_big_img.jpg';
            }

///////////////////////////////////////////////////////30대 남자/////////////////////////////////
            if(parseInt(menu_m30.length)!=0){
              for (var i = 0; i < menu_m30.length; i = i + count) {
                count = 1;
                for (var j = i + 1; j < menu_m30.length; j++) {
                  if (menu_m30[i].kname === menu_m30[j].kname)
                    count++;
                }
                console.log(menu_m30[i] + " = " + count );    //coffeewhippedcreamcakepieces = 1
                var x = 0;
                list_m30.push(menu_m30[i].name);                        //배열로 나타내기-메뉴
                listk_m30.push(menu_m30[i].kname);
                url_m30.push(menu_m30s[i].url);
                num_m30.push(count);                             //카운드하기
                console.log(num_m30);

              }
              max_m30 = Math.max.apply(null,num_m30);           //최대값구하기이이이
              console.log(max_m30);

              for (var key in num_m30) {              //foreach
                if(num_m30[key]===max_m30){             //max와 같은 숫자일경우!!
                  if(maxlist_m30 == "a"){
                    maxlist_m30=list_m30[key];
                    maxlistk_m30=listk_m30[key];
                    maxurl_m30=url_m30[key];
                  }else{
                    maxlist_m30=maxlist_m30+","+list_m30[key];
                    maxlistk_m30=maxlistk_m30+","+listk_m30[key];
                    maxurl_m30=maxurl_m30+","+url_m30[key];
                  }
                }
              }
            }else{
              maxlist_m30='icedcafeamericano';
              maxlistk_m30='아이스카페아메리카노';
              maxurl_m30='https://s3.amazonaws.com/twosome-db-url/181_big_img.jpg';
            }

///////////////////////////////////////////////////////40대 남자/////////////////////////////////
            if(parseInt(menu_m40.length)!=0){
              for (var i = 0; i < menu_m40.length; i = i + count) {
                count = 1;
                for (var j = i + 1; j < menu_m40.length; j++) {
                  if (menu_m40[i].kname === menu_m40[j].kname)
                    count++;
                }
                console.log(menu_m40[i] + " = " + count );    //coffeewhippedcreamcakepieces = 1
                var x = 0;
                list_m40.push(menu_m40[i].name);                        //배열로 나타내기-메뉴
                listk_m40.push(menu_m40[i].kname);
                url_m40.push(menu_m40s[i].url);
                num_m40.push(count);                             //카운드하기
                console.log(num_m40);

              }
              max_m40 = Math.max.apply(null,num_m40);           //최대값구하기이이이
              console.log(max_m40);

              for (var key in num_m40) {              //foreach
                if(num_m40[key]===max_m40){             //max와 같은 숫자일경우!!
                  if(maxlist_m40 == "a"){
                    maxlist_m40=list_m40[key];
                    maxlistk_m40=listk_m40[key];
                    maxurl_m40=url_m40[key];
                  }else{
                    maxlist_m40=maxlist_m40+","+list_m40[key];
                    maxlistk_m40=maxlistk_m40+","+listk_m40[key];
                    maxurl_m40=maxurl_m40+","+url_m40[key];
                  }
                }
              }
            }else{
              maxlist_m40='icedcafeamericano';
              maxlistk_m40='아이스카페아메리카노';
              maxurl_m40='https://s3.amazonaws.com/twosome-db-url/181_big_img.jpg';
            }

///////////////////////////////////////////////////////////////////////////////////////////////
//dynamodb에 넣기이이이
            var maxf10 = {  "ename": maxlist_f10,  "kname": maxlistk_f10, "url": maxurl_f10  };
            var maxf20 = {  "ename": maxlist_f20,  "kname": maxlistk_f20, "url": maxurl_f20  };
            var maxf30 = {  "ename": maxlist_f30,  "kname": maxlistk_f30, "url": maxurl_f30  };
            var maxf40 = {  "ename": maxlist_f40,  "kname": maxlistk_f40, "url": maxurl_f40  };

            var maxm10 = {  "ename": maxlist_m10,  "kname": maxlistk_m10, "url": maxurl_m10  };
            var maxm20 = {  "ename": maxlist_m20,  "kname": maxlistk_m20, "url": maxurl_m20  };
            var maxm30 = {  "ename": maxlist_m30,  "kname": maxlistk_m30, "url": maxurl_m30  };
            var maxm40 = {  "ename": maxlist_m40,  "kname": maxlistk_m40, "url": maxurl_m40  };
            console.log("maxf10"+maxf10);

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
            });

            var paramsf2 = {
                TableName:"Twosome_Code",
                Key:{"placeId": placeId_num},
                UpdateExpression: "set recommendmenu[0].female[0].twenties = :max",
                ExpressionAttributeValues:{":max" :maxf20 },
                ReturnValues:"UPDATED_NEW"
            };
            console.log("Attempting a conditional update...");
            docClient.update(paramsf2, function(err, data) {
                if (err) {
                    console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    console.log("UpdateItem succeeded f2:", JSON.stringify(data, null, 2));
                }
            });

            var paramsf3 = {
                TableName:"Twosome_Code",
                Key:{"placeId": placeId_num},
                UpdateExpression: "set recommendmenu[0].female[0].thirties = :max",
                ExpressionAttributeValues:{":max" :maxf30 },
                ReturnValues:"UPDATED_NEW"
            };
            console.log("Attempting a conditional update...");
            docClient.update(paramsf3, function(err, data) {
                if (err) {
                    console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    console.log("UpdateItem succeeded f3:", JSON.stringify(data, null, 2));
                }
            });

            var paramsf4 = {
                TableName:"Twosome_Code",
                Key:{"placeId": placeId_num},
                UpdateExpression: "set recommendmenu[0].female[0].forties = :max",
                ExpressionAttributeValues:{":max" :maxf40 },
                ReturnValues:"UPDATED_NEW"
            };
            console.log("Attempting a conditional update...");
            docClient.update(paramsf4, function(err, data) {
                if (err) {
                    console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    console.log("UpdateItem succeeded f4:", JSON.stringify(data, null, 2));
                }
            });

            var paramsm1 = {
                TableName:"Twosome_Code",
                Key:{"placeId": placeId_num},
                UpdateExpression: "set recommendmenu[0].male[0].teens = :max",
                ExpressionAttributeValues:{":max" :maxm10 },
                ReturnValues:"UPDATED_NEW"
            };
            console.log("Attempting a conditional update...");
            docClient.update(paramsm1, function(err, data) {
                if (err) {
                    console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    console.log("UpdateItem succeeded m1:", JSON.stringify(data, null, 2));
                }
            });

            var paramsm2 = {
                TableName:"Twosome_Code",
                Key:{"placeId": placeId_num},
                UpdateExpression: "set recommendmenu[0].male[0].twenties = :max",
                ExpressionAttributeValues:{":max" :maxm20 },
                ReturnValues:"UPDATED_NEW"
            };
            console.log("Attempting a conditional update...");
            docClient.update(paramsm2, function(err, data) {
                if (err) {
                    console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    console.log("UpdateItem succeeded m2:", JSON.stringify(data, null, 2));
                }
            });

            var paramsm3 = {
                TableName:"Twosome_Code",
                Key:{"placeId": placeId_num},
                UpdateExpression: "set recommendmenu[0].male[0].thirties = :max",
                ExpressionAttributeValues:{":max" :maxm30 },
                ReturnValues:"UPDATED_NEW"
            };
            console.log("Attempting a conditional update...");
            docClient.update(paramsm3, function(err, data) {
                if (err) {
                    console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    console.log("UpdateItem succeeded m3:", JSON.stringify(data, null, 2));
                }
            });

            var paramsm4 = {
                TableName:"Twosome_Code",
                Key:{"placeId": placeId_num},
                UpdateExpression: "set recommendmenu[0].male[0].forties = :max",
                ExpressionAttributeValues:{":max" :maxm40 },
                ReturnValues:"UPDATED_NEW"
            };
            console.log("Attempting a conditional update...");
            docClient.update(paramsm4, function(err, data) {
                if (err) {
                    console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    console.log("UpdateItem succeeded m4:", JSON.stringify(data, null, 2));
                }
            });

          });//data.items 이거끝
      }
  });//퀴리끝
};
