module.exports = async function (context, req) {
  context.log('dataMerge processed a request.')

  const salesOrderHeadersV2 = req.body.salesOrderHeadersV2.split('\r\n')
  const salesOrderLinesV2 = req.body.salesOrderLinesV2.split('\r\n')

  // incase the data is not defined return an empty string
  if (typeof salesOrderHeadersV2 === 'undefined' || typeof salesOrderLinesV2 === 'undefined' || salesOrderHeadersV2.length < 1 || salesOrderHeadersV2.length < 1) {
    context.res = { body: 'item,quantity,order,price,email,timestamp' }
    context.done()
    return
  }

  // Create the master hash
  const hashMap = {}

  const regex = RegExp('^.*[.]+.*$');

  for (let i = 1; i < salesOrderHeadersV2.length - 1; ++i) {
    const linedata = salesOrderHeadersV2[i].split(',')
    if (linedata.length === 3) {
      if (linedata[2].includes('T') === false) {
        linedata[2] = linedata[2].split(' ').join('T') + 'Z'
      }
      hashMap[linedata[0]] = {
        email: linedata[1],
        timestamp: linedata[2]
      }
    }
  }

  const mergedData = [['item', 'quantity', 'order', 'price', 'email', 'timestamp']]
  for (let i = 1; i < salesOrderLinesV2.length - 1; i++) {
    const element = salesOrderLinesV2[i].split(',')
    let line = []
    if (element.length === 5) {
      if ((element[3] in hashMap) && (hashMap[element[3]].email !== '') && (regex.test(hashMap[element[3]].email))) {
        line = [element[0], element[2], element[3], element[4], hashMap[element[3]].email, hashMap[element[3]].timestamp].join(',')
        mergedData.push([line])
      }
    }
  }
  
  
  const responseMessage = mergedData.join('\n')

  context.res = {
    body: responseMessage
  }
}
