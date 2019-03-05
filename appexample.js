const express = require('express');
var session = require('express-session');
const socket = require('socket.io');
const http = require('http');
const fs =require('fs');
const app = express();
const AWS = require("aws-sdk");
var bodyParser = require('body-parser');
var cors = require('cors');

AWS.config.update({
 region: "us-east-1",
});
var DynamoDBStore = require('dynamodb-session-store')(session);
var dynamodb_gyu = new AWS.DynamoDB({ region: 'us-east-1' });
var docClient = new AWS.DynamoDB.DocumentClient({ service: dynamodb_gyu });

const server = http.createServer(app);
const io = socket(server)
const port = 3000;

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Max-Age", "3600");
  res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST');
  res.header("Access-Control-Allow-Headers", 'Origin,Accept,X-Requested-With,Content-Type,Access-Control-Request-Method,Access-Control-Request-Headers,Authorization');
  next();
});

app.use(bodyParser.urlencoded({extended:false}));

var options = {
  tableName: 'OTM_Seesion_State',
  consistentRead: false,
  accessKeyId: 'AKIAIN54D3Y6DLXUHZNA',
  secretAccessKey: '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',
  region: 'us-east-1'
};
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(session({
   key:'sid',
   secret: 'hanium_syu',//비밀값
   resave: false, //사용할때마다 재발급 여부
   saveUninitialized: true, //세션아이디를 세션을 실제 사용하기 전에 세션 발급 여부
   cookie: {
    maxAge: 24000 * 60 * 60 // 쿠키 유효기간 24시간
  },
   store: new DynamoDBStore(options)
}))//gyu

function check_session_state(req,res){
  if(req.session.loggin_state){
    return true;
  }else{
    return false;
  }
}
app.use('/css',express.static('./css'));
app.use('/js',express.static('./js'));

 app.get('/trigger_come',function(req,res){ //트리거로 인한 호출// 데이터 최신화
  console.log("connet to user");
  console.log('req.query.PositionName  : ' + req.query.PositionName);
  console.log('req.query.Brand  : ' + req.query.Brand);
  console.log('req.query.placeId  : ' + req.query.placeId);

  var whenin = {
    TableName : "Twosome_Code",         //Twosome_Code
    ProjectionExpression:"brandName, orderInfo, placeId, positionName,recommendmenu,requiredTime",
    KeyConditionExpression: "placeId = :whereplaceid",
    ExpressionAttributeValues: {
    ":whereplaceid": req.query.placeId
         }
     };
    var queryObjectPromise = docClient.query(whenin).promise();
    // 해당 클라이언트로 쿼리문 전송
    console.log(req.query.Brand+' '+req.query.PositionName+' info StartQuery');
    var querydata = new Object(); //append 데이터
    queryObjectPromise.then(function(err, data) { //쿼리 호출
          console.log("Query succeeded [whenin]");
            data.Items.forEach(function(item) { //호출한 쿼리값
                //제품 상태의 값이 주문접수중_1.제조중_2.제조완료_3'.수령완료_4'

                //상태가 4미만인 데이터만 포함하여 클라이언트로 전송
                for(var i=0;i <item.orderInfo[i].length;i++){
                    if(item.orderInfo[i].state < 4){ //제품 상태가 수령완료인 경우 클라이언트에게 데이터를 넘기지 않음
                    querydata.order[i].orderNum = item.orderInfo[i].order.orderNum //주문번호
                    querydata.order[i].date = item.orderInfo[i].order.date; //날짜
                    querydata.order[i].time = item.orderInfo[i].order.time // 시간
                    querydata.order[i].kmenu = item.orderInfo[i].order.kmenu //메뉴
                    querydata.order[i].amount = item.orderInfo[i].order.amount //수량
                    querydata.order[i].size = item.orderInfo[i].order.size //사이즈
                    querydata.order[i].shot = item.orderInfo[i].order.shot //샷
                    querydata.order[i].syrup = item.orderInfo[i].order.syrup // 시럽
                    querydata.order[i].type = item.orderInfo[i].order.type // 포장유무
                    querydata.order[i].state = item.orderInfo[i].state //제품 상태
                    querydata.order[i].totPrice = item.orderInfo[i].totPrice //총가격
                    querydata.order[i].Mac_address = item.orderInfo[i].Mac_address // MAC주소
                    }
                }
                querydata.brandName = item.brandName; //브랜드이름
                querydata.positionName =item.positionName // 매장위치 이름
                console.log('send for : '+ req.query.placeId);
                io.to(req.query.placeId).emit('show',querydata,function(err){
                console.log('socket_err state :'+ err);
                });//소켓 접속 상태 점검 쿼리 데이터 첨부
                //트리거의 신호가 넘어오면 해당 소켓 유저에 대한 데이터 쿼리 데이터를 소켓을 통해 전송
          })
     }).catch(function (err) {
      console.log("Unable to read item. Error Query JSON: ", JSON.stringify(err, null, 2));
    })

  res.send('OK your Signal');
})

app.get('/showOrder', (req, res) => { //실시간 주문내역 보기
  if(req.query.ID && req.query.placeid){

  var comeplace = req.query.placeid;
  console.log('placeid type is : '+typeof(comeplace));
  var brandName;
  var PositionName ;
  var orderNum = new Array();

  var date = new Array();
  var time = new Array();
  var kmenu = new Array();
  var amount = new Array();
  var size = new Array();
  var shot = new Array();
  var syrup = new Array();
  var type = new Array();

  var state = new Array();
  var totPrice = new Array();
  var Mac_address = new Array();
  var ordernum_num = new Array();


 var firstin = {
      TableName : "Twosome_Code",                                //Twosome_Code
      ProjectionExpression:"placeId,orderInfo, brandName, positionName, requiredTime",
      KeyConditionExpression: "placeId = :j",
      ExpressionAttributeValues: {
          ":j": comeplace
      }
  };

  var queryObjectPromise2 = docClient.query(firstin).promise();

  queryObjectPromise2.then(function (data) {
      console.log("[Promise][firstin]Query Item succeeded:D");
      data.Items.forEach(function(item) {
                brandName = item.brandName; // 브랜드 이름
                PositionName = item.positionName; //지점 이름
                //제품 상태의 값이 주문접수중_1.제조중_2.제조완료_3'.수령완료_4'
                  for(var i=0;i < item.orderInfo.length;i++){
                  //item.orderInfo[i].order.length 한 주문에 주문한 제품의 수
                      date[i] = new Array();
                      time[i] = new Array();
                      kmenu[i] = new Array();
                      amount[i] = new Array();
                      size[i] = new Array();
                      shot[i] = new Array();
                      syrup[i] = new Array();
                      type[i] = new Array();
                  }

                //상태가 4미만인 데이터만 포함하여 클라이언트로 전송
                for(var i=0;i <item.orderInfo.length;i++){ // 각 주문의 개수

                    if(item.orderInfo[i].state < 4){ //제품 상태가 수령완료인 경우 클라이언트에게 데이터를 넘기지 않음
                      orderNum.push(item.orderInfo[i].orderNum)  //주문번호
                      totPrice.push(item.orderInfo[i].totPrice)//총가격
                      Mac_address.push(item.orderInfo[i].Mac_address) ;// MAC주소
                      state.push(item.orderInfo[i].state); //주문 상태

                       for(var j=0;j <item.orderInfo[i].order.length;j++){ //한 주문에 주문한 상품의 종류
                        date[i].push(item.orderInfo[i].order[j].date); //날짜
                        time[i].push(item.orderInfo[i].order[j].time) // 시간
                        kmenu[i].push(item.orderInfo[i].order[j].kmenu) //메뉴
                        amount[i].push(item.orderInfo[i].order[j].amount) //수량
                        size[i].push(item.orderInfo[i].order[j].size) //사이즈
                        shot[i].push(item.orderInfo[i].order[j].shot) //샷
                        syrup[i].push(item.orderInfo[i].order[j].syrup) // 시럽
                        type[i].push(item.orderInfo[i].order[j].type) // 포장유무
                        }
                    ordernum_num.push(date[i].length);//한 주문당 주문당 상품의 개수
                    }
                } //한주문당 한사람이 주문한 상품 N개
                console.log('send for : '+brandName+PositionName)
                //트리거의 신호가 넘어오면 해당 소켓 유저에 대한 데이터 쿼리 데이터를 소켓을 통해 전송

                console.log(comeplace + brandName + PositionName +orderNum +ordernum_num);
                res.render(__dirname+'/public/showOrder.html',{
                'placeid' : comeplace,
                'brandName' : brandName,
                'PositionName' : PositionName,
                'orderNum' : orderNum,
                'totPrice' : totPrice,
                'Mac_address' : Mac_address,
                'date' : date, //이하 배열
                'time' : time,
                'kmenu' : kmenu,
                'amount' : amount,
                'size' : size,
                'shot' : shot,
                'syrup' : syrup,
                'type' : type,
                'state' : state,
                'ordernum_num' : ordernum_num
                  });
      });
  }).catch(function (err) {
      console.log("[Promise][Twosome_Code]Unable to read item. Error JSON: ", JSON.stringify(err, null, 2));
  });

  }else{
    res.send('login fail')
  }
});
//트리거 결과가 넘어오면 해당 매장으로 쿼리를 해서 보내줘야 함
// session.sid 로 placeid 를 아이디로 통신함
// io.to(소켓아이디).emit('이벤트명' 데이터); //특정 사용자에게 메시지
// io.socket 이란 접속되는 모든 소켓들을 의미


io.sockets.on('connect',function(socket){ //connection이라는 이벤트 발생시 콜백 함수가 실행됨
 console.log('come to user');
  socket.on('newUser',function(placeid){ //연결상태 체크
    console.log(placeid+' 님이 접속하였습니다.');
    socket.name = placeid;
  });
   // io.sockets.emit('update',{type: 'connect',name: 'SERVER',message: name+ '님이 접속하였습니다.'})
  //message 이벤트 발생시 호출
// socket.name //접속된 접속 id (sid) 값

//이하 업데이트 쿼리문 완성 후 트리거로 인한 자동 로딩
socket.on('message',function(data){ //message는 클라이언트에서 신호가옴 //주문상태 변경 요청
  console.log('message');
  var placeId = data.placeid;
  var state = data.state;
  var ordernum = data.ordernum;
  console.log(state+' : '+ordernum+' : '+placeId);

var firstin = {
      TableName : "Twosome_Code",                                //Twosome_Code
      ProjectionExpression:"placeId,orderInfo, brandName, positionName, requiredTime",
      KeyConditionExpression: "placeId = :j",
      ExpressionAttributeValues: {
          ":j": placeId
      }
  };
var queryObjectPromise2 = docClient.query(firstin).promise();
var senddata;
queryObjectPromise2.then(function (data) {
      console.log("[Promise][firstin]Query Item succeeded:D");
      data.Items.forEach(function(item) {
        for(var i =0;i<item.orderInfo.length;i++){
          if(item.orderInfo[i].orderNum == ordernum){ //업데이트 진행
            console.log(i +' : '+state);
            senddata = {
              findupdate: i,
              state: state
            }
          }
        }
    });
  }).catch(function (err) {
      console.log("[Promise][Twosome_Code]Unable to read item. Error JSON: ", JSON.stringify(err, null, 2));
  }).finally(function(){
          console.log(senddata);
          // socket.broadcast.emit('hello',senddata);
          io.to(data.id).emit('hello',senddata); //특정 숫자를 보냄
  });

//table update No.1v
  // queryObjectPromise2.then(function (data) {
  //     console.log("[Promise][firstin]Query Item succeeded:D");
  // }).catch(function (err) {
  //     console.log("[Promise][Twosome_Code]Unable to read item. Error JSON: ", JSON.stringify(err, null, 2));
  // });

            //  docClient.update(whenup, function(err, data) {//data.state, data.placeId
            // if (err) {
            //     console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
            // } else {
            //     console.log("UpdateItem succeeded whenup:", JSON.stringify(data, null, 2));
            //    }
            // });
});

// query = {placeid :placeid,
//   num :data.findupdate,
//   state : data.state
//   }


socket.on('changdb',function(data){
  console.log('changdb');
  var placeid = data.placeid
  var findupdate = data.num //몇번째 주문인지
  var state = data.state
console.log("인덱스 번호 : "+findupdate+" 변경될 상태 :"+state+" placeid : "+placeid);
  //table update No.2
  var setindex = "orderInfo["+findupdate+"]"
    // var whenup = {
    //     TableName:"Twosome_Code",
    //     Key:{"placeId": placeid},   //기본키
    //     UpdateExpression: "set orderInfo[0].state = :num", //업데이트 할 부분
    //     ExpressionAttributeValues:{"num"  :state}, //변수를 대입
    //     ReturnValues:"UPDATED_NEW"//UpdateItem 작업 이후에 나타나는대로 업데이트 된 속성 만 반환
    // };
    // expressionAttributeNames: {""},
    var params = {
    TableName:"Twosome_Code",
    Key:{
        "placeId": placeid
    },
    UpdateExpression: "set orderInfo[0]:c = :num",
    ExpressionAttributeValues:{
        ":num" :state,
        ":c" :".state"
    },
    ReturnValues:"UPDATED_NEW"
};
  console.log(params);
    docClient.update(params,function(err,data){
      if(err){
      console.log("실패 : UpdateItem Faile whenup:", JSON.stringify(err, null, 2));
      }else{
      console.log("성공 : UpdateItem succeeded whenup:", JSON.stringify(data, null, 2));

      }
    })

    })
  //table update No.2
  // var whenup1 = {
  //     TableName:"OrderList",
  //     Key:{"placeId": data.MAC},
  //     UpdateExpression: "set item.orderInfo[N].state = :state",
  //     ExpressionAttributeValues:{":state" :state },
  //     ReturnValues:"UPDATED_NEW"
  // };
  // docClient.update(whenup1, function(err, data) {
  //   if (err) {
  //       console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
  //   } else {
  //       console.log("UpdateItem succeeded whenup1:", JSON.stringify(data, null, 2));
  //      }
  // });


//disconnect 이벤트 발생시 호출 --
  socket.on('disconnect',function(){//disconnect 연결된 소켓이 끊어지면 자동으로 실행
    console.log(socket.name+ ' is disconnect');
    // socket.broadcast.emit('update',{type: 'disconnect',name: 'SERVER',message: socket.name +'님이 나가셨습니다.'})
  })
})
//
server.listen(port,function(){
  console.log('Listening ' + port +' Port');
})
