const request = require('../../utils/request')
const jsdom = require('jsdom')
// const iconv = require('iconv-lite');
const async = require('async')
const mongodb = require('../../utils/mongodb')
const uploadFile = require('../../utils/upload')
const getDownloadUrl = require('../../utils/download')
const {
    JSDOM
} = jsdom

const DownloadBook = async (url) => {
    try {
        const collection = await mongodb('list')

        // /**
        //  * 判断是否已保存
        //  */
        const [bookUrl] = await collection.find({
            url: url,
        }).toArray()
        console.log(bookUrl, 'bookUrl');
        if (bookUrl) {
            return {
                ...bookUrl,
                downloadUrl: `${getDownloadUrl(`books/${bookUrl.name}.txt`)}&attname=${encodeURI(bookUrl.name)}.txt`
            }
        }
        const res = await request.get(url, {}, {
            responseType: 'arraybuffer'
        })
        if (res.headers['content-type'].indexOf('text/html') == -1) {
            return 'Error'
        }
        let dom = new JSDOM(res.data, {
            url: url,
            contentType: res.headers['content-type']
        })
        let sum = 0
        const results = {}
        const bookName = dom.window.document.querySelector("h1").textContent
        dom.window.document.querySelectorAll("a").forEach((item) => {
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
            console.log(key, 'key');
            return {
                url: key,
                ...results[key]
            }
        }).sort((a, b) => a.index - b.index)

        return new Promise((resolve) => {
            async.mapLimit(data, 5, function (item, callback) {
                try {
                    request.get(item.url, {}, {
                        responseType: 'arraybuffer'
                    }).then(async (res) => {
                        let {
                            window
                        } = new JSDOM(res.data, {
                            url: url,
                            contentType: res.headers['content-type']
                        })


                        //获取文章主体

                        const childNodes = window.document.body.children
                        const stack = []
                        stack.push(...childNodes)
                        const list = []
                        while (stack.length) {
                            const item = stack.pop()
                            const children = item.children
                            const len = children.length
                            if (!len) continue;
                            const filterData = [...children].filter(item => {
                                return ['br'].some(i => i == item.localName)
                            })
                            if (filterData.length / len > 0.8) {
                                list.push(item)
                                continue;
                            }
                            stack.push(...children)
                        }

                        const content = list.reduce((cur, acc) => {
                            return acc.textContent.length > cur.length ? acc.textContent : cur
                        }, '')

                        var data = {
                            index: item.index,
                            title: item.title,
                            content: content
                        };
                        // await new Promise(resolve => setTimeout(resolve, 1000));
                        callback(null, data);
                    })

                } catch (error) {
                    console.error(error);
                    callback(null)
                }
            }, (err, results) => {
                const bookContent = results.map((item) => item.title + '\n\r' + item.content).join('\n\r');
                uploadFile(`books/${bookName}.txt`, bookContent).then(() => {
                    console.log(getDownloadUrl(`books/${bookName}.txt`), );
                    collection.insertOne({
                        name: bookName,
                        url: url,
                        done: true
                    })
                })
                resolve(bookName)
            })
        })
    } catch (error) {
        console.log(error, 'error');
        return error
    }
}
module.exports = DownloadBook