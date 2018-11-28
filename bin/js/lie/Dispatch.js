var lie;
(function (lie) {
    /**
     * 事件分发工具类，异步操作用
     */
    var Dispatch = /** @class */ (function () {
        function Dispatch() {
        }
        /**
         * 注册对象
         * @param key 事件的唯一标志
         * @param obj 注册事件
         * @param replace 是否替换掉之前的回调
         */
        Dispatch.$register = function (key, obj, replace) {
            var self = Dispatch;
            var target = self.$targets[key];
            var isReg = !target || replace;
            isReg && (self.$targets[key] = obj);
            self.$removeLater(key);
            return isReg;
        };
        /**
         * 移除延迟
         */
        Dispatch.$removeLater = function (key) {
            var self = Dispatch;
            var params = self.$laters[key];
            if (params !== void 0) {
                delete self.$laters[key];
                self.$notice(key, params);
            }
        };
        /**
         * 被动触发回调
         */
        Dispatch.$notice = function (key, params) {
            var self = Dispatch;
            params.unshift(key);
            self.notice.apply(self, params);
        };
        /**
         * 注册事件
         * @param key 事件的唯一标志
         * @param call 回调函数
         * @param thisObj 回调所属对象
         * @param replace 是否替换掉之前的回调
         */
        Dispatch.register = function (key, call, thisObj, replace) {
            return Dispatch.$register(key, [call, thisObj], replace);
        };
        /**
         * 通知，触发回调
         * @param key 事件标志
         * @param param 回调参数
         */
        Dispatch.notice = function (key) {
            var params = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                params[_i - 1] = arguments[_i];
            }
            var target = Dispatch.$targets[key];
            target && target[0].apply(target[1], params);
        };
        /**
         * 移除事件
         */
        Dispatch.remove = function (key) {
            delete Dispatch.$targets[key];
        };
        /**
         * 是否注册了某个事件
         */
        Dispatch.hasRegister = function (key) {
            return !!Dispatch.$targets[key];
        };
        /**
         * 注册多个事件，统一回调，参数功能看register
         */
        Dispatch.registers = function (keys, call, thisObj, replace) {
            var obj = [call, thisObj];
            for (var i in keys) {
                var key = keys[i];
                Dispatch.$register(key, obj, replace);
            }
        };
        /**
         * 清除所有事件
         */
        Dispatch.clear = function () {
            var self = Dispatch;
            self.$targets = {};
            self.$laters = {};
        };
        /**
         * 延迟通知，如果已经注册的事件功能同notice，如果未注册，则会等到
         * 事件注册时立马触发回调
         * @param key 事件标志
         * @param param 回调参数
         */
        Dispatch.noticeLater = function (key) {
            var params = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                params[_i - 1] = arguments[_i];
            }
            var self = Dispatch;
            if (self.hasRegister(key))
                self.$notice(key, params);
            else
                self.$laters[key] = params;
        };
        Dispatch.$targets = {}; // 存放所有回调函数
        Dispatch.$laters = {}; // 存放延迟数据
        return Dispatch;
    }());
    lie.Dispatch = Dispatch;
})(lie || (lie = {}));
//# sourceMappingURL=Dispatch.js.map