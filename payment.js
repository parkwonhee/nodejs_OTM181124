//아임포트 결제모듈

module.exports.send = function (id){  //모듈 exports
  // --> npm install --save iamport
  var Iamport = require('iamport');
  var iamport = new Iamport({
    impKey: '6508046199942235',
    impSecret: 'QPLOR33uD9kEzVOxVI1aXlLOjLZwoS3fIP3zT63wfoaPjZmfHopEJbt2XsyllCA4sDElKIR062Pq1bFJ'
  });

  // 아임포트 고유 아이디로 결제 정보를 조회
  iamport.payment.getByImpUid({
    imp_uid: 'imp_071496155067'
  }).then(function(result){
    console.log('접근ok');
  }).catch(function(error){
  });
}
