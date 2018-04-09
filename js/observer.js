class Observer {
    constructor(data) {
        this.data = data;
        Object.keys(this.data).forEach(key => {
            this.defineReactive(key, this.data[key]);
        })
    }

    // 定义反应
    defineReactive(key, val) {
        let dep = new Dep();
        Object.defineProperty(this.data, key, {
            enumerable: true,
            configurable: false,
            get: () => {
                if (Dep.target) {
                    console.log('Dep depend');
                    dep.depend();
                }
                return val;
            },
            set: newVal => {
                if (val === newVal) {
                    return;
                }
                val = newVal;
                // 赋值对象再进行劫持
                observe(val);
                // 数据修改通知
                dep.notify();
            }
        })
    }

}

function observe(val) {
    if (!val || typeof val !== 'object') {
        return;
    }
    return new Observer(val);
}

let uid = 0;

function Dep() {
    this.id = uid++;
    this.subs = [];
}

Dep.prototype = {

    addSub: function (sub) {
        this.subs.push(sub);
    },

    depend: function () {
        Dep.target.addDep(this);
    },

    removeSub: function (sub) {
        let index = this.subs.indexOf(sub);
        if (index !== -1) {
            this.subs.splice(index, 1);
        }
    },

    notify: function () {
        this.subs.forEach((sub) => {
            sub.update();
        })
    }
};

Dep.target = null;