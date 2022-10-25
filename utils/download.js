var qiniu = require("qiniu");
const AK = 'CDxgCx4vs99x-Lvb-JXysT9BFcEGzNRvZcBlgk-h'
const SK = 'BjsS_TcKpx3_XXazZ1zb1EhLDv3FN2w_NNBJEabJ'
var mac = new qiniu.auth.digest.Mac(AK, SK);
var config = new qiniu.conf.Config();
var bucketManager = new qiniu.rs.BucketManager(mac, config);
var privateBucketDomain = 'http://g.auroraone.top';


const getDownloadUrl = (filename) => {
    var deadline = parseInt(Date.now() / 1000) + 3600; // 1小时过期
    var privateDownloadUrl = bucketManager.privateDownloadUrl(privateBucketDomain, filename, deadline);
    return privateDownloadUrl
}

module.exports = getDownloadUrl