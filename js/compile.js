class Compile {
    constructor(el, vm) {
        this.$vm = vm;
        this.$el = this.isElementNode(el) ? el : document.querySelector(el);
        if (this.$el) {
            this.$fragment = this.node2Fragment(this.$el);
            this.init();
            this.$el.appendChild(this.$fragment);
        }
    }

    init() {
        this.compileElement(this.$fragment);
    }

    node2Fragment(el) {
        let fragment = document.createDocumentFragment(), child;

        // 原生节点拷贝到fragment
        while (child = el.firstChild) {
            // appendChild将元素从dom上移到fragment
            fragment.appendChild(child);
        }
        return fragment;
    }

    compileElement(el) {
        let childNodes = el.childNodes;

        [].slice.call(childNodes).forEach(node => {
            let text = node.textContent;
            let reg = /\{\{(.*)\}\}/;

            if (this.isElementNode(node)) {
                this.compile(node);
            } else if (this.isTextNode(node) && reg.test(text)) {
                this.compileText(node, RegExp.$1);
            }

            if (node.childNodes && node.childNodes.length) {
                this.compileElement(node);
            }
        })
    }

    compile(node) {
        let nodeAttrs = node.attributes;
        [].slice.call(nodeAttrs).forEach(attr => {
            let attrName = attr.name;
            if (this.isDirective(attrName)) {
                let exp = attr.value;
                let dir = attrName.substring(2);

                if (this.isEventDirective(dir)) {
                    // 事件指令
                    compileUtil.eventHandler(node, this.$vm, exp, dir);
                } else {
                    // 普通指令
                    compileUtil[dir] && compileUtil[dir](node, this.$vm, exp);
                }

                node.removeAttribute(attrName);
            }
        });
    }

    compileText(node, exp) {
        compileUtil.text(node, this.$vm, exp);
    }

    isDirective(attr) {
        return attr.indexOf('v-') == 0;
    }

    isEventDirective(dir) {
        return dir.indexOf('on') === 0;
    }

    isElementNode(node) {
        return node.nodeType == 1;
    }

    isTextNode(node) {
        return node.nodeType == 3;
    }

}

// 指令处理集合
let compileUtil = {
    text: function (node, vm, exp) {
        this.bind(node, vm, exp, 'text');
    },

    html: function (node, vm, exp) {
        this.bind(node, vm, exp, 'html');
    },

    model: function (node, vm, exp) {
        this.bind(node, vm, exp, 'model');

        let _this = this,
            val = this._getVMVal(vm, exp);
        node.addEventListener('input', function (e) {
            let newValue = e.target.value;
            if (val === newValue) {
                return;
            }

            _this._setVMVal(vm, exp, newValue);
            val = newValue;
        });
    },

    class: function (node, vm, exp) {
        this.bind(node, vm, exp, 'class');
    },

    bind: function (node, vm, exp, dir) {
        let updaterFn = updater[dir + 'Updater'];

        updaterFn && updaterFn(node, this._getVMVal(vm, exp));

        new Watcher(vm, exp, function (value, oldValue) {
            updaterFn && updaterFn(node, value, oldValue);
        });
    },

    // 事件处理
    eventHandler: function (node, vm, exp, dir) {
        let eventType = dir.split(':')[1],
            fn = vm.$options.methods && vm.$options.methods[exp];

        if (eventType && fn) {
            node.addEventListener(eventType, fn.bind(vm), false);
        }
    },

    _getVMVal: function (vm, exp) {
        let val = vm;
        exp = exp.split('.');
        exp.forEach((k) => {
            val = val[k];
        });
        return val;
    },

    _setVMVal: function (vm, exp, value) {
        let val = vm;
        exp = exp.split('.');
        exp.forEach((k, i) => {
            // 非最后一个key，更新val的值
            if (i < exp.length - 1) {
                val = val[k];
            } else {
                val[k] = value;
            }
        });
    }
};


let updater = {
    textUpdater: function (node, value) {
        node.textContent = typeof value == 'undefined' ? '' : value;
    },

    htmlUpdater: function (node, value) {
        node.innerHTML = typeof value == 'undefined' ? '' : value;
    },

    classUpdater: function (node, value, oldValue) {
        let className = node.className;
        className = className.replace(oldValue, '').replace(/\s$/, '');

        let space = className && String(value) ? ' ' : '';

        node.className = className + space + value;
    },

    modelUpdater: function (node, value, oldValue) {
        node.value = typeof value == 'undefined' ? '' : value;
    }
};