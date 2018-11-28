var lie;
(function (lie) {
    var key = 0;
    var cache = {};
    var Lock = /** @class */ (function () {
        function Lock(time, call, thisObj, params) {
            this.$time = time;
            this.$call = call;
            this.$thisObj = thisObj;
            this.$params = params;
        }
        /**
         * 锁住
         */
        Lock.prototype.lock = function () {
            var self = this;
            var timer = Laya.timer;
            self.$isLock = true;
            // timer.clear(self, self.unlock); // 会被覆盖
            timer.once(self.$time, self, self.unlock);
        };
        /**
         * 解锁
         */
        Lock.prototype.unlock = function () {
            var self = this;
            self.$isLock = false;
            Laya.timer.clear(self, self.unlock);
        };
        /**
         * 执行
         */
        Lock.prototype.excute = function () {
            var self = this;
            if (!self.$isLock) {
                self.$call.apply(self.$thisObj, self.$params);
            }
        };
        /**
         * 清除
         */
        Lock.prototype.clear = function () {
            var self = this;
            self.$call = self.$thisObj = self.$params = null;
        };
        return Lock;
    }());
    /**
     * 锁工具类，用于锁住时效性的代码
     */
    var LockUtils = /** @class */ (function () {
        function LockUtils() {
        }
        /**
         * 创建时间锁
         * @param time 时间长度，锁住之后经过time自动解锁
         * @param call 解锁状态可执行的代码块
         * @param thisObj 代码块所属对象
         * @param params 代码块参数
         * @returns 返回锁的唯一标识，用于下面代码
         */
        LockUtils.create = function (time, call, thisObj) {
            var params = [];
            for (var _i = 3; _i < arguments.length; _i++) {
                params[_i - 3] = arguments[_i];
            }
            if (time > 0 && lie.TypeUtils.isFunction(call)) {
                cache[++key] = new Lock(time, call, thisObj, params);
                return key;
            }
            return 0;
        };
        /**
         * 锁住
         */
        LockUtils.lock = function (key) {
            var lock = cache[key];
            lock && lock.lock();
        };
        /**
         * 解锁
         */
        LockUtils.unlock = function (key) {
            var lock = cache[key];
            lock && lock.unlock();
        };
        /**
         * 执行代码块，解锁状态才会执行
         */
        LockUtils.excute = function (key) {
            var lock = cache[key];
            lock && lock.excute();
        };
        /**
         * 清除
         */
        LockUtils.clear = function (key) {
            var lock = cache[key];
            if (lock) {
                lock.clear();
                delete cache[key];
            }
        };
        return LockUtils;
    }());
    lie.LockUtils = LockUtils;
})(lie || (lie = {}));
//# sourceMappingURL=LockUtils.js.map