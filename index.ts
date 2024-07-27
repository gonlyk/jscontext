import * as babelParser from '@babel/parser'
import * as t from '@babel/types';
import traverse from '@babel/traverse'
import generator from '@babel/generator'

const __JS_CONTEXT__ = '__jsContext'

export default function generateRunner(code: string, jsContext: Object = {}) {
  function replace(path: any, node: t.Identifier) {
    const allExist = existIdentify.flat()
    if (!allExist.includes(node.name)) {
      if (Object.keys(__jsContext).includes(node.name)) {
        path.replaceWithSourceString(`${__JS_CONTEXT__}.${node.name}`)
      } else {
        throw new Error(`not declara ${node.name}`)
      }
    }
  }

  function freeze(obj: any) {
    if (typeof obj === 'object') {
      Object.freeze(obj)
      Object.keys(obj).forEach(key => freeze(obj[key]))
    }
    return obj
  }

  let now: ('declara' | 'expression' | 'member')[] = []
  let nowNode: any[] = []
  const ast = babelParser.parse(code, {
    sourceType: 'script',
  });
  const __jsContext = freeze(jsContext)
  const existIdentify = [[__JS_CONTEXT__]]

  traverse(ast, {
    enter(path) {
      const { node } = path
      if (t.isVariableDeclarator(node) || t.isClassDeclaration(node) || t.isFunctionDeclaration(node)) {
        now.push('declara')
        nowNode.push(node)
      } else if (t.isExpressionStatement(node)) {
        now.push('expression')
        nowNode.push(node)
      } else if (t.isMemberExpression(node)) {
        now.push('member')
        nowNode.push(node)
      } else if (t.isIdentifier(node)) {
        // is declara id, add identify
        // is declara init, add identify
        // is expression, check and change
        // is member object, check and change
        // is member property, skip
        const n = now[now.length - 1]
        const nn = nowNode[nowNode.length - 1]
        const currExist = existIdentify[existIdentify.length - 1]
        if (n === 'declara') {
          if (t.isVariableDeclarator(nn) && nn.init === node) {
            replace(path, node)
          } else {
            currExist.push(node.name)
          }
        } else if (n === 'expression') {
          replace(path, node)
        } else if (n === 'member') {
          if (t.isMemberExpression(nn) && nn.object === node) {
            replace(path, node)
          }
        }
      } else if (t.isBlockStatement(node)) {
        existIdentify.push([])
      }
    },
    exit(path) {
      const { node } = path
      if (nowNode[nowNode.length - 1] === node) {
        nowNode.pop()
        now.pop()
      }
      if (t.isBlockStatement(node)) {
        existIdentify.pop()
      }
    }
  })

  const newCode = generator(ast).code
  return { code: newCode, run: () => eval(newCode) }
}


