// 라우터 app.get만 삽입
///dynamodb-session-store --save
//express-session
//connect-dynamodb
'user strict'
var express = require('express');
var session = require('express-session');
var app = express();
var aws_serverless = require('aws-serverless-express');

const fs = require('fs');
var cors = require('cors');
var bodyParser = require('body-parser');
//gyu
const socket = require('socket.io');
const http = require('http');

//won
var dynamodb3 = require('./js/user_recommend.js');        //추천메뉴
var user_query_1 = require('./js/user_query_1.js');
var user_query_2 = require('./js/user_query_2.js');
var user_query_3 = require('./js/user_query_3.js');
var user_query_4 = require('./js/user_query_4.js');
var user_query_5 = require('./js/user_query_5.js');
var place_name = require('./js/place_name.js');

//woo
var fcm_push = require('./push_notification.js');        //push_notification.js
var fcm_push_alert = require('./push_notification_alert.js');        //push_notification.js
var dynamodb = require('./dynamodb_query.js');           //dynamodb_query.js

var AWS = require("aws-sdk");
var docClient = new AWS.DynamoDB.DocumentClient();
AWS.config.update({
 region: "us-east-1",
});

var DynamoDBStore = require('dynamodb-session-store')(session);
var dynamodb_gyu = new AWS.DynamoDB({ region: 'us-east-1' });
var docClient = new AWS.DynamoDB.DocumentClient({ service: dynamodb_gyu });

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

app.use("/views",express.static(__dirname + "/views"));
app.use("/js",express.static(__dirname + "/js"));

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(cors());

function errorHandle(process){  //setTimeout try-catch 함수
  return function(){
    try{
      return process.apply(this, arguments);
    }catch(e){
      console.log(e);
    }
  };
}
//////////////////////////////////////////////////////////////////////
//woo
app.get('/payment_complete', (req, res) => {           //// 결제완료페이지
  res.render(__dirname+'/public/payment_complete.html',{
    'merchant_uid' : dynamodb.paymentNum,
    'totPrice' : dynamodb.totPrice,
    'menu' : dynamodb.menu,
    'amount' : dynamodb.amount,
    'price' : dynamodb.price,
    'state' : dynamodb.state,
    'current_obj_length' : dynamodb.current_obj_length,

    'brand_name' : dynamodb.brandName,
    'market_name' : dynamodb.positionName,
    'required_time' : dynamodb.requiredTime
  });
});

app.get('/payment_list', (req, res) => {                   //// 결제리스트
  setTimeout(errorHandle(function(){
    res.render(__dirname+'/public/payment_list.html',{
      'brandName' : dynamodb.brandName_list,
      'positionName' : dynamodb.positionName_list,
      'paymentNum' : dynamodb.paymentNum_list,
      'totPrice' : dynamodb.totPrice_list,
      'date' : dynamodb.date_list,
      'state' : dynamodb.state, //
      'state_list' : dynamodb.state_list, //
      'menu_list' : dynamodb.menu_list,
      'obj_length' : dynamodb.obj_length,
      'obj_orderInfo_length' : dynamodb.obj_orderInfo_length
    });
  }), 200);
});

app.get('/payment_list_complete', (req, res) => {          //// 상세보기클락사->완료페이지
  res.render(__dirname+'/public/payment_list_complete.html',{
    'menu_list' : dynamodb.menu_list,
    'state' : dynamodb.state,
    'state_list' : dynamodb.state_list //
  });
});
//------------------------------------------------------------------------
//gyu
app.get('/logout',function(req,res){ //세션 삭제
  req.session.destroy(function(){
    res.clearCookie('sid');
    res.redirect('https://ccx2cfg379.execute-api.us-east-1.amazonaws.com/latest/login')
  });
});

app.get('/homepage',function(req,res){          //welcome!!
   if(req.session.ID && req.session.placeid){
     place_name.send(req.session.placeid);
     setTimeout(errorHandle(function() {
       res.render(__dirname+'/public/mainpage.html',{
         'positionName' : place_name.positionName,
         'ID':req.session.ID,
         'placeid':req.session.placeid
       });
     }),200);
     setTimeout(errorHandle(function() {
       dynamodb3.send(req.session.placeid);
     }),200);
   }else{
      res.redirect('https://ccx2cfg379.execute-api.us-east-1.amazonaws.com/latest/login')
    }
})

app.post('/login',function(req,res){
   var get_data = {
      TableName : "Twosome_Store",         //Twosome_Store
      ProjectionExpression:"ID,Password,PlaceId",
      KeyConditionExpression: "ID = :useremail",
      ExpressionAttributeValues: {
          ":useremail": req.body.email
      }
  };

  var queryObjectPromise = docClient.query(get_data).promise();
   queryObjectPromise.then(function(data) { //쿼리 호출
          console.log("Query succeeded [get_data]");
            data.Items.forEach(function(item) { //호출한 쿼리값
               var id = item.ID; // 사용자 아이디
               var pw = item.Password; //pw  PlaceId
               var placeid = item.PlaceId;
               console.log(id + pw + placeid);
                 if (id === req.body.email && pw === req.body.password){
                req.session.ID = id; //db쓰기
                req.session.placeid = placeid;//
              console.log(req.session.ID+req.session.placeid+"---------");//확인
              res.redirect('https://ccx2cfg379.execute-api.us-east-1.amazonaws.com/latest/homepage')// 로그인 확인 후 페이지 연결
                }else{
              res.redirect('https://ccx2cfg379.execute-api.us-east-1.amazonaws.com/latest/login'); //실패시
                }
            })
       }).catch(function (err) {
         console.log("[Twosome_Store] Unable to query. Error:", JSON.stringify(err, null, 2));
       })
     });

     app.get('/login',function(req,res){
        fs.readFile(__dirname+'/public/login.html','utf8',function(data,err){
           if (err){
              res.status(500).send(err);;
           }else{
              // res.write();
              res.status(200).send(data);;
           }
        });
     })
///////////////////////////////////////////////////////////
//won
app.get('/listlist', (req, res) => {              ////  판매자확인리스트
  //if(check_session_state(req,res)){
  if(req.session.ID && req.session.placeid){
    user_query_1.send(req.session.placeid);
    setTimeout(errorHandle(function() {
      res.render(__dirname+'/public/listlist.html',{
        'positionName' : user_query_1.positionName,
      'orderNum_list' : user_query_1.orderNum_list,//새거

      'date' : user_query_1.date_list,
      'time' : user_query_1.time_list,
      'menu_list' : user_query_1.menu_list,
      'amount_list' : user_query_1.amount_list,
      'type_list' : user_query_1.type_list,

      'state_list_tmp' : user_query_1.state_list_tmp,
      'totPrice' : user_query_1.totPrice_list,

      'obj_length' : user_query_1.obj_length,
      'obj_orderInfolength' : user_query_1.obj_orderInfolength,
      'ID':req.session.ID,
      'placeid':req.session.placeid
      });
    }),200);
  }else {
    res.redirect('https://ccx2cfg379.execute-api.us-east-1.amazonaws.com/latest/login')
  }
});

app.get('/totamount', (req, res) => {             //1.totamount 판매량 보기
  if(req.session.ID && req.session.placeid){
    user_query_2.send(req.session.placeid);
    setTimeout(errorHandle(function() {
      res.render(__dirname+'/public/totamount.html',{
        'positionName' : user_query_2.positionName,
        'list_list' : user_query_2.list_list,
      	'num_list' : user_query_2.num_list,
        'ID':req.session.ID,
        'placeid':req.session.placeid
    	});
    }),200);
  }else {
    res.redirect('https://ccx2cfg379.execute-api.us-east-1.amazonaws.com/latest/login')
  }
});

app.get('/amountchart', (req, res) => {             //2. chart보기 주별 판매량...
  if(req.session.ID && req.session.placeid){
    user_query_1.send(req.session.placeid);
    setTimeout(errorHandle(function() {
      res.render(__dirname+'/public/amountchart.html',{
        'positionName' : user_query_1.positionName,
    		'date_array' : user_query_1.date_array,
      	'amount_array' : user_query_1.amount_array,
        'ID':req.session.ID,
        'placeid':req.session.placeid
    	});
    }),200);
  }else {
    res.redirect('https://ccx2cfg379.execute-api.us-east-1.amazonaws.com/latest/login')
  }
});

app.get('/agechart1', (req, res) => {             //3. chart보기 나이...개로 나누기...
  if(req.session.ID && req.session.placeid){
    user_query_5.send(req.session.placeid);
    setTimeout(errorHandle(function() {
      res.render(__dirname+'/public/agechart_1.html',{
        'positionName' : user_query_5.positionName,
    		'list_10' : user_query_5.list_10,
      	'num_10' : user_query_5.num_10,
        'list_20' : user_query_5.list_20,
      	'num_20' : user_query_5.num_20,
        'ID':req.session.ID,
        'placeid':req.session.placeid
    	});
    }),200);
  }else {
    res.redirect('https://ccx2cfg379.execute-api.us-east-1.amazonaws.com/latest/login')
  }
});

app.get('/agechart2', (req, res) => {             //3.나이2개로 나누기...
  if(req.session.ID && req.session.placeid){
    user_query_5.send(req.session.placeid);
    setTimeout(errorHandle(function() {
      res.render(__dirname+'/public/agechart_2.html',{
        'positionName' : user_query_5.positionName,
        'list_30' : user_query_5.list_30,
      	'num_30' : user_query_5.num_30,
        'list_40' : user_query_5.list_40,
      	'num_40' : user_query_5.num_40,
        'ID':req.session.ID,
        'placeid':req.session.placeid
    	});
    }),200);
  }else {
    res.redirect('https://ccx2cfg379.execute-api.us-east-1.amazonaws.com/latest/login')
  }
});

app.get('/genderchart', (req, res) => {             // 4.chart보기 성별...
  if(req.session.ID && req.session.placeid){
    user_query_3.send(req.session.placeid);
    setTimeout(errorHandle(function() {
      res.render(__dirname+'/public/genderchart.html',{
        'positionName' : user_query_3.positionName,
    		'list_m' : user_query_3.list_m,
      	'num_m' : user_query_3.num_m,
        'list_f' : user_query_3.list_f,
      	'num_f' : user_query_3.num_f,
        'ID':req.session.ID,
        'placeid':req.session.placeid
    	});
    }),200);
  }else {
    res.redirect('https://ccx2cfg379.execute-api.us-east-1.amazonaws.com/latest/login')
  }
});

app.get('/typechart', (req, res) => {             //5. chart보기 포장유무
  if(req.session.ID && req.session.placeid){
    user_query_4.send(req.session.placeid);
    setTimeout(errorHandle(function() {
      res.render(__dirname+'/public/typechart.html',{
        'positionName' : user_query_4.positionName,
        'take_away' : user_query_4.take_away,
      	'eat_in' : user_query_4.eat_in,
        'ID':req.session.ID,
        'placeid':req.session.placeid
    	});
    }),200);
  }else {
    res.redirect('https://ccx2cfg379.execute-api.us-east-1.amazonaws.com/latest/login')
  }
});
//이건 바꾸기

//-------------------------------------------------------------------------
//woo
app.use(bodyParser.json());
app.get("/post", (req, res) => {                       //// uuid -> 지도
  var app_uuid2 = req.query.uuid;
  var token = req.query.token;
  res.render(__dirname+'/public/map_v1.html',{
    'uuid' : app_uuid2,
    'token' : token
  });
});

app.get("/post_list", (req, res) => {
  var app_uuid_list = req.query.uuid;
  dynamodb.send(app_uuid_list, "abc");
  setTimeout(errorHandle(function(){
    res.render(__dirname+'/public/payment_list.html',{
      'uuid' : app_uuid_list,
      'brandName' : dynamodb.brandName_list,
      'positionName' : dynamodb.positionName_list,
      'paymentNum' : dynamodb.paymentNum_list,
      'totPrice' : dynamodb.totPrice_list,
      'date' : dynamodb.date_list,
      'state' : dynamodb.state, //
      'state_list' : dynamodb.state_list, //
      'menu_list' : dynamodb.menu_list,
      'obj_length' : dynamodb.obj_length,
      'obj_orderInfo_length' : dynamodb.obj_orderInfo_length
    });
  }), 200);
});

app.get("/uuidget", (req, res) => {                    //// lex -> 결제 / uuid, placeId받아오는 페이지 띄우는 용
  res.sendFile(__dirname + "/public/uuid_get.html");
});

app.get('/uuidsend', (req, res) => {                   //// uuid, placeId -> 결제페이지로 연결
	var payment_uuid = req.query.uuid, payment_placeId = req.query.placeId;
  dynamodb.send(payment_uuid, payment_placeId);          // to dynamodb_query.js
  setTimeout(errorHandle(function(){
    res.render(__dirname+'/public/payment_button.html',{
      'merchant_uid' : dynamodb.paymentNum,
      'totPrice' : dynamodb.totPrice,
      'state' : dynamodb.state
    });
  }), 200);
});

app.get('/fcm', (req, res) => {                        //// fcm 폼
  if(req.session.placeid){
    res.render(__dirname+'/public/fcmForm.html',{
      'positionName' : place_name.positionName,
      'ID':req.session.ID,
      'placeid':req.session.placeid
    });
  }else {
    res.redirect('https://ccx2cfg379.execute-api.us-east-1.amazonaws.com/latest/login')// 로그인 실패
  }
});

app.post('/fcm_send', (req, res) => {                  //// fcm 폼에서 데이터 받아와서 보내줌
  var mytitle = req.body.title, myurl = req.body.url;
  fcm_push.send(mytitle,myurl);                          // to push_notification.js
});

app.get('/fcm_alert', (req, res) => {                  //// fcm 보내는 폼(알림용)
  // https://ccx2cfg379.execute-api.us-east-1.amazonaws.com/latest/fcm_alert?token=cd29hvAV3z8:APA91bHSdjnXdssssssssssssssssssssss04ikcw1clLl7cAhIHaVj9hWQ1bWC0PUjMuTAlynDx8Cq_gtAhetyzfLm1yz55coechlqfoG_WUer0GpiYA9OKMQnfuUrDq8C4X7232YlE6aswD3VYTLtHA0eVdrlk-Y&brandName=투썸&positionName=상봉점&state=4;
  // http://172.30.1.7:3000/fcm_alert?token=cd29hvAV3z8:APA91bHSdjnXd04ikcw1clLl7cAhIHaVj9hWQ1bWC0PUjMuTAlynDx8Cq_gtAhetyzfLm1yz55coechlqfoG_WUer0GpiYA9OKMQnfuUrDq8C4X7232YlE6aswD3VYTLtHA0eVdrlk-Y&brandName=투썸&positionName=상봉점&state=4;

  var token = req.query.token, brandName = req.query.brandName, positionName = req.query.positionName, state = req.query.state;
  res.render(__dirname+'/public/fcmForm_alert.html',{
    'token' : token,
    'brandName' : brandName,
    'positionName' : positionName,
    'state' : state
  });
});

app.post('/fcm_send_alert', (req, res) => {
  // var token = 'fY34pTXZqcE:APA91bH3cnFVhLgfcP_cbHTCpBhC-Mfu6VGlGaILFFeJB2MX1_WmQg_VDuRsDV9pZbNb2HChsyyD4N0ISdieF6iWCps7lCArbSrnvmW_8pX6YTLNgGpB5m4CWYA3me70JI1jjhtpwxbL';

  var mytitle = req.body.title, token = req.body.token, body = req.body.body;
  fcm_push_alert.send(mytitle,token,body);
});
module.exports = app;
