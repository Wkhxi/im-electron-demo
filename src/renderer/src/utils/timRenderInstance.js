// 报错
// import TimRender from 'im_electron_sdk/dist/renderer'
const TimRender = require('im_electron_sdk/dist/renderer')

let timRenderInstance

const getInstance = () => {
  if (!timRenderInstance) {
    const renderInstance = new TimRender()
    const proxyInstance = new Proxy(renderInstance, {
      get: (obj, prop) => {
        return async (...args) => {
          const [params] = args
          const res = await obj[prop](...args)
          if (res && res.data && res.data.code != undefined && res.data.code !== 0) {
            const { code, desc } = res
            console.error('接口出错:', prop, code, desc, res, JSON.stringify(args[0]))

            if (!params.hide_tips) {
              // message 提示
            }
            return res
          }
          return res
        }
      }
    })
    timRenderInstance = proxyInstance
  }
  return timRenderInstance
}

export default getInstance()
