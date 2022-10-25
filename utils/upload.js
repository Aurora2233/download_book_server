var qiniu = require("qiniu");
//要上传的空间
const bucket = 'auroraone';
const AK = 'CDxgCx4vs99x-Lvb-JXysT9BFcEGzNRvZcBlgk-h'
const SK = 'BjsS_TcKpx3_XXazZ1zb1EhLDv3FN2w_NNBJEabJ'
var mac = new qiniu.auth.digest.Mac(AK, SK);
var config = new qiniu.conf.Config({
    zone: qiniu.zone.Zone_z2
});
var formUploader = new qiniu.form_up.FormUploader(config);
//构建上传策略函数
function uptoken(bucket, key) {
    var options = {
        scope: bucket + ":" + key,
    };
    var putPolicy = new qiniu.rs.PutPolicy(options);
    return putPolicy.uploadToken(mac);
}

//要上传文件的本地路径
//构造上传函数
function uploadFile(filename, data) {
    var extra = new qiniu.form_up.PutExtra();
    const token = uptoken(bucket, filename);
    return new Promise((resolve, reject) => {
        formUploader.put(token, filename, data, extra, function (err, ret) {
            if (!err) {
                resolve(ret)
            } else {
                reject(err)
            }
        });
    })
}
//调用uploadFile上传
// uploadFile(token, key, filePath);

module.exports = uploadFile