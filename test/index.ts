import generateRunner from ".."

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


// console.log(code)

run()