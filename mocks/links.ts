import type { MockMethod } from 'vite-plugin-mock'

// 模拟链接数据
const links = [
  {
    id: '1',
    shortUrl: 'http://short.url/abc123',
    originalUrl: 'https://example.com/very/long/url/1',
    visits: 10,
    isCustom: false,
    createdAt: new Date('2023-04-01T12:00:00Z').getTime(),
    updatedAt: new Date('2023-04-01T12:00:00Z').getTime(),
    expiresAt: new Date('2024-04-01T12:00:00Z').getTime(),
  },
  {
    id: '2',
    shortUrl: 'http://short.url/def456',
    originalUrl: 'https://example.com/very/long/url/2',
    visits: 5,
    isCustom: false,
    createdAt: new Date('2023-04-02T14:30:00Z').getTime(),
    updatedAt: new Date('2023-04-02T14:30:00Z').getTime(),
    expiresAt: new Date('2024-04-02T14:30:00Z').getTime(),
  },
  {
    id: '3',
    shortUrl: 'http://short.url/custom',
    originalUrl: 'https://example.com/very/long/url/3',
    visits: 15,
    isCustom: true,
    createdAt: new Date('2023-04-03T09:15:00Z').getTime(),
    updatedAt: new Date('2023-04-03T09:15:00Z').getTime(),
    expiresAt: new Date('2024-04-03T09:15:00Z').getTime(),
  },
]

export default [
  {
    url: '/api/v1/links',
    method: 'get',
    response: () => {
      return {
        code: 200,
        data: links,
        message: '获取链接列表成功',
      }
    },
  },
  {
    url: '/api/v1/links/:id',
    method: 'get',
    rawResponse: async (req, res) => {
      const id = req.url?.split('/').pop()
      const link = links.find((l) => l.id === id)
      if (link) {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.end(
          JSON.stringify({
            code: 200,
            data: link,
            message: '获取链接详情成功',
          })
        )
      } else {
        res.statusCode = 404
        res.setHeader('Content-Type', 'application/json')
        res.end(
          JSON.stringify({
            code: 404,
            message: 'Link not found',
          })
        )
      }
    },
  },
  {
    url: '/api/v1/links',
    method: 'post',
    rawResponse: async (req, res) => {
      let reqbody = ''
      await new Promise((resolve) => {
        req.on('data', (chunk) => {
          reqbody += chunk
        })
        req.on('end', () => resolve(undefined))
      })
      const { originalUrl, customAlias, expiresAt } = JSON.parse(reqbody)
      const newLink = {
        id: String(links.length + 1),
        shortUrl: `http://short.url/${customAlias || Math.random().toString(36).slice(2, 6)}`,
        originalUrl,
        visits: 0,
        isCustom: !!customAlias,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
        expiresAt: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).getTime(),
      }
      links.push(newLink)
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 200
      res.end(
        JSON.stringify({
          code: 201,
          data: newLink,
          message: '创建链接成功',
        })
      )
    },
  },
] as MockMethod[]
