const fs = require('fs')
const request = require('../../utils/request')
const jsdom = require('jsdom')
const iconv = require('iconv-lite');
const lodash = require('lodash')
const async = require('async')
const {
    uniqBy,
    orderBy
} = lodash
const {
    JSDOM
} = jsdom
const DownloadBook = async (url) => {
    try {

        const res = await request.get(url, {}, {
            responseType: 'arraybuffer'
        })
        if (res.headers['content-type'].indexOf('text/html') == -1) {
            return 'Error'
        }
        // const html = iconv.decode(res.data, 'GBK')
        // console.log(html, 'outerHTML');
        let dom = new JSDOM(res.data, {
            url: url,
            contentType: res.headers['content-type']
        })
        let sum = 0
        const results = {}

        const bookName = dom.window.document.querySelector("h1").textContent

        if(fs.existsSync(`${process.cwd()}/public/book/${bookName}.txt`)){
            return bookName
        }

        dom.window.document.querySelectorAll("a").forEach((item, index) => {
            const title = item.textContent
            const url = item.href
            const rule = /第(.{1,})章/
            if (rule.test(title)) {
                results[url] = {
                    index: sum++,
                    title
                }
            }
        })

        let data = Object.keys(results).map(key => {
            return {
                url: key,
                ...results[key]
            }
        }).sort((a, b) => a.index - b.index)
        // 第一步 获取目录 data
        // return data

        // const data2 = Array(100).fill('').map((_, index) => index)


        return new Promise((resolve, reject) => {
            async.mapLimit(data, 10, function (item, callback) {
                try {
                    request.get(item.url, {}, {
                        responseType: 'arraybuffer'
                    }).then(res => {
                        let {
                            window
                        } = new JSDOM(res.data, {
                            url: url,
                            contentType: res.headers['content-type']
                        })
                        const content = window.document.querySelector('#content').textContent
                        var data = {
                            index: item.index,
                            title: item.title,
                            content: content
                        };
                        callback(null, data);
                    })

                } catch (error) {
                    console.error(error);
                    callback(null)
                }
            }, (err, results) => {
                const bookContent = results.map((item) => item.title + '\n\r' + item.content).join('\n\r');
                fs.writeFileSync(`${process.cwd()}/public/book/${bookName}.txt`, bookContent, 'utf-8');
                resolve(bookName)
            })
        })





        // TODO: 有可能响应头不包含字符集，导致解析字符集失败
        // let charset = ''
        // dom.window.document.querySelectorAll("meta").forEach((item) => {
        //     if (item.getAttribute('charset')) {
        //         charset = item.getAttribute('charset')
        //     }
        // })
        // console.log(dom.window.document.documentElement.outerHTML, 'dom.window');
        // console.log(charset, 'charset');
    } catch (error) {
        console.log(error, 'error');
        return error
    }
}
module.exports = DownloadBook