function approvalEdit(e){if(!e||!e.range||e.range.getSheet().getName()!=='Content'||e.range.getRow()<2)return;return locked_(function(){var start=e.range.getRow(),end=start+e.range.getNumRows()-1;rows_().filter(function(r){return r._row>=start&&r._row<=end;}).forEach(function(r){
 var j=journal_(r.ID);if(j){if(j.state==='DONE')applyReceipt_(r,j);else{r['Trạng thái']='Lỗi';r['Lỗi']='Đã có lần gửi Facebook; cần đối soát journal, không đăng lại.';save_(r);}return;}
 var old=props_().getProperty('approved:'+r.ID),hash=fingerprint_(r);
 if(r['Trạng thái']==='Đã duyệt'&&r['Giai đoạn']==='READY'&&r['Nội dung']&&r['File ảnh ID']&&Number.isFinite(scheduled_(r))){
  var statusExplicit=e.range.getColumn()<=12&&e.range.getLastColumn()>=12;
  if(statusExplicit){var blob=DriveApp.getFileById(r['File ảnh ID']).getBlob();props_().setProperty('approvedImage:'+r.ID,Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,blob.getBytes())));props_().setProperty('approved:'+r.ID,hash);r['Dấu duyệt']=hash;log_(r.ID,'APPROVED',e.user?e.user.getEmail():'admin');}
  else if(old!==hash){invalidate_(r);}
 }else{invalidate_(r,r['Trạng thái']);}save_(r);
 });});}
function invalidate_(r,status){props_().deleteProperty('approved:'+r.ID);props_().deleteProperty('approvedImage:'+r.ID);r['Dấu duyệt']='';r['Trạng thái']=status||'Chờ duyệt';}
function command_(r){var c=r['Lệnh'];if(!c)return false;if(journal_(r.ID))throw Error('Không sửa/thử lại bài đã có publishing journal. Đối soát trước.');invalidate_(r);r['Lần thử']=0;r['Thử lại lúc']='';r['Lỗi']='';r['Lệnh']='';if(c==='Viết lại')r['Giai đoạn']='TEXT';else if(c==='Tạo lại ảnh'){if(!r['Prompt ảnh'])throw Error('Chưa có prompt ảnh');r['Giai đoạn']='IMAGE';}else if(c==='Thử lại'){if(['TEXT','IMAGE','READY'].indexOf(r['Giai đoạn'])<0)throw Error('Giai đoạn không hợp lệ');}else throw Error('Lệnh không hợp lệ');save_(r);return true;}
