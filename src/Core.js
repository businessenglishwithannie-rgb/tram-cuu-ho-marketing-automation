var APP = {tz:'Asia/Ho_Chi_Minh', slots:['08:00','12:00','19:30'], headers:[
 'ID','Ngày đăng','Giờ đăng','Chủ đề','Ý tưởng','Tiêu đề','Nội dung','Hashtag','Prompt ảnh','Link ảnh','Xem trước','Trạng thái','Ghi chú','Facebook Post ID','Link bài đăng','Thời gian đăng thực tế','Lỗi',
 'Đối tượng','File ảnh ID','Giai đoạn','Dấu duyệt','Lần thử','Thử lại lúc','Lệnh','Nguồn tham khảo'
]};
var PROPERTY_STORE_=null;
function props_(){if(PROPERTY_STORE_)return PROPERTY_STORE_;var service=PropertiesService.getScriptProperties(),values=service.getProperties();PROPERTY_STORE_={getProperty:function(k){return Object.prototype.hasOwnProperty.call(values,k)?values[k]:null;},setProperty:function(k,v){service.setProperty(k,String(v));values[k]=String(v);return PROPERTY_STORE_;},deleteProperty:function(k){service.deleteProperty(k);delete values[k];return PROPERTY_STORE_;}};return PROPERTY_STORE_;}
function cfg_(key,fallback){var v=props_().getProperty(key);return v===null?fallback:v;}
function required_(key){var v=cfg_(key,'');if(!v)throw Error('Thiếu Script Property: '+key);return v;}
function dry_(){return cfg_('DRY_RUN','true')!=='false';}
function book_(){return SpreadsheetApp.openById(required_('SPREADSHEET_ID'));}
function sheet_(){return book_().getSheetByName('Content');}
function locked_(fn){var l=LockService.getScriptLock();if(!l.tryLock(1000))return;PROPERTY_STORE_=null;try{return fn();}finally{PROPERTY_STORE_=null;l.releaseLock();}}
function rows_(){var s=sheet_();if(s.getLastRow()<2)return [];return s.getRange(2,1,s.getLastRow()-1,APP.headers.length).getValues().map(function(a,i){var r={_row:i+2};APP.headers.forEach(function(h,j){r[h]=a[j];});return r;});}
function safeCell_(v){return typeof v==='string'&&/^[=+@-]/.test(v)?"'"+v:v;}
function save_(r){sheet_().getRange(r._row,1,1,APP.headers.length).setValues([APP.headers.map(function(h){return safeCell_(r[h]===undefined?'':r[h]);})]);SpreadsheetApp.flush();}
function append_(r){r._row=sheet_().getLastRow()+1;save_(r);}
function day_(d){return Utilities.formatDate(d,APP.tz,'yyyy-MM-dd');}
function dateText_(v){return v instanceof Date?day_(v):String(v);}
function timeText_(v){return v instanceof Date?Utilities.formatDate(v,APP.tz,'HH:mm'):String(v);}
function scheduled_(r){var d=dateText_(r['Ngày đăng']),t=timeText_(r['Giờ đăng']);if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(t))return NaN;var ms=Date.parse(d+'T'+t+':00+07:00');if(!Number.isFinite(ms)||new Date(ms+7*3600000).toISOString().slice(0,10)!==d)return NaN;return ms;}
function fingerprint_(r){var a=['ID','Ngày đăng','Giờ đăng','Chủ đề','Ý tưởng','Tiêu đề','Nội dung','Hashtag','Prompt ảnh','Link ảnh','File ảnh ID','Nguồn tham khảo'].map(function(k){return r[k] instanceof Date?r[k].toISOString():String(r[k]||'');});return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,JSON.stringify(a)));}
function due_(r,now,maxLate){var t=scheduled_(r);return r['Trạng thái']==='Đã duyệt'&&r['Giai đoạn']==='READY'&&!r['Lệnh']&&!r['Facebook Post ID']&&!!r['Dấu duyệt']&&r['Dấu duyệt']===fingerprint_(r)&&Number.isFinite(t)&&t<=now&&now-t<=maxLate*60000;}
function redact_(msg){var s=String(msg);['OPENAI_API_KEY','META_PAGE_TOKEN'].forEach(function(k){var v=cfg_(k,'');if(v)s=s.split(v).join('[REDACTED]');});return s.slice(0,1500);}
function log_(id,event,detail){book_().getSheetByName('Logs').appendRow([new Date(),safeCell_(id||''),event,safeCell_(redact_(detail||''))]);}
function fail_(r,e){r['Lỗi']=redact_(e.message||e);r['Lần thử']=Number(r['Lần thử']||0)+1;r['Thử lại lúc']=new Date(Date.now()+Math.min(60,Math.pow(2,r['Lần thử']))*60000);if(r['Lần thử']>=3)r['Trạng thái']='Lỗi';save_(r);log_(r.ID,'ERROR',r['Lỗi']);}
