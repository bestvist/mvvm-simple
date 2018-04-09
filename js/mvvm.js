class MVVM {
    constructor(options) {
        this.$options = options || {};
        let data = this._data = this.$options.data();

        // 数据代理 vm.xxx => vm._data.xxx
        Object.keys(data).forEach(key => {
            this._proxyData(key);
        });

        // 数据劫持
        observe(data, this);

        this.$compile = new Compile(options.el || document.body, this);
    }

    _proxyData(key) {
        Object.defineProperty(this, key, {
            configurable: true,
            enumerable: true,
            get: () => {
                return this._data[key];
            },
            set: newVal => {
                this._data[key] = newVal;
            }
        });
    }

}