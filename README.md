## Jscontext

创建全新的上下文运行环境，避免访问全局window或global

### 使用

```js
import generateRunner from 'self-global'

const { code, run } = generateRunner(`
console.log('start')
const a = 1
class A { 
  a
  constructor(init = 1) {
    this.a = init
  }
  add(n) {this.a += n}}

const objA = new A(1 + a * 5)
objA.add(3)
console.log(objA.a)
console.log('end')
`, { console })


run()

// res:
// start
// 9
// end
```
