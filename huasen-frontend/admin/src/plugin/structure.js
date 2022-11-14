/**
 * 数组拓展二维数组
 * @param {*} numrows
 * @param {*} numcols
 * @param {*} initial
 * @returns
 */
Array.matrix = function(numrows, numcols, initial) {
    var arr = []
    for (var i = 0; i < numrows; ++i) {
        var columns = []
        for (var j = 0; j < numcols; ++j) {
            columns[j] = initial
        }
        arr[i] = columns
    }
    return arr
}

// 栈
function Stack() {
    this.dataStore = []
    this.top = 0 // 表示栈顶位置
    // 元素压栈操作
    this.push = function push(element) {
        this.dataStore[this.top++] = element
    }
    // 元素弹栈操作
    this.pop = function pop() {
        this.top = this.top - 1 // 指针下移找到栈顶元素
        return this.dataStore[this.top]
    }
    // 获得栈顶元素
    this.peek = function peek() {
        return this.dataStore[this.top - 1]
    }
    // 获取栈内元素个数
    this.length = function length() {
        return this.top
    }
    this.clear = function clear() {
        delete this.dataStore
        this.dataStore = []
        this.top = 0
    }
}

// 队列
function Queue() {
    this.dataStore = []
    // 队列尾部插入一个元素
    this.enqueue = function enqueue(element) {
        this.dataStore.push(element)
    }
    // 队列头部删除一个元素
    this.dequeue = function dequeue() {
        return this.dataStore.shift()
    }
    // 返回队列首元素
    this.front = function front() {
        return this.dataStore[0]
    }
    // 返回队列尾元素
    this.back = function back() {
        return this.dataStore[this.dataStore.length - 1]
    }
    //
    this.toString = function toString() {
        let retStr = ''
        for (let i = 0; i < this.dataStore.length; ++i) {
            retStr += this.dataStore[i] + '\n'
        }
        return retStr
    }
    this.empty = function empty() {
        if (this.dataStore.length == 0) {
            return true
        } else {
            return false
        }
    }
    // 返回队列的个数
    this.count = function conut() {
        return this.dataStore.length
    }
}

export default {
    Stack,
    Queue
}
