// https://devstarsj.github.io/2017/08/06/aws-serverless-express/ ver.ko
// https://medium.freecodecamp.org/express-js-and-aws-lambda-a-serverless-love-story-7c77ba0eaa35 ver.en
//https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html 아마존 cli 설정법
//https://github.com/claudiajs/claudia node to aws lamdba
//https://vimeo.com/156232471 콘솔 사용법
// 삭제시 aws_iam role aws_api_gateway 에서 해당 객체 지워야함 
// express_to aws 배포시 필요 모듈 (이하)
// npm install claudia -g shell에 추가
// npm install claudia-api-builder -S
// claudia generate-serverless-express-proxy --express-module app(main js이름)
// claudia 업로드를 위한 json 제작
//claudia create --handler lambda.handler --deploy-proxy-api --region us-east-1(지역) 
//claudia update 프로젝트 업로드
// npm install superb -S //무작위 단어 만들기
// 이하 폴더 기본 값
'user strict'
var express = require('express');
var app = express();
var aws_serverless = require('aws-serverless-express')
var http = require('http');

var port1 = 3000; //http 서버 포트

http.createServer(app).listen(port1, function(){  
  console.log("Http server listening on port " + port1);
});
app.get('/server',function(req,res){
	res.send('hello lambda')
})

module.exports = app;