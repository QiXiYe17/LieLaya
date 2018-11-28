var lie;
(function (lie) {
    /**
     * 时间工具类
     * @author Yin
     */
    var TimeUtils = /** @class */ (function () {
        function TimeUtils() {
        }
        /**
         * 计时开始
         * @param key 标志
         */
        TimeUtils.begin = function (key) {
            TimeUtils.cache[key] = Date.now();
        };
        /**
         * 计时结束
         * @param key 标志
         */
        TimeUtils.end = function (key) {
            var cache = TimeUtils.cache;
            var time = cache[key];
            if (time) {
                delete cache[key];
                console.log(key + ' used time:' + (Date.now() - time));
            }
        };
        /**
         * 数字保持两位数
         */
        TimeUtils.formatTen = function (num) {
            return (num > 9 ? '' : '0') + num;
        };
        /**
         * 小时-分-秒
         */
        TimeUtils.formatHour = function (second, sufix) {
            if (sufix === void 0) { sufix = ':'; }
            var ten = TimeUtils.formatTen;
            var hour = second / 3600 | 0;
            var min = (second / 60 | 0) % 60;
            var sec = second % 60;
            return ten(hour) + sufix + ten(min) + sufix + ten(sec);
        };
        /**
         * 获取天数
         * @param second
         */
        TimeUtils.getDay = function (second) {
            return (second + 8 * 3600) / 86400 | 0;
        };
        /**
         * 检测两个秒数是否同一天
         */
        TimeUtils.isSameDay = function (second0, second1) {
            var get = TimeUtils.getDay;
            return get(second0) == get(second1);
        };
        TimeUtils.cache = {};
        return TimeUtils;
    }());
    lie.TimeUtils = TimeUtils;
    var outCode = 0, valCode = 0, timeout = {}, interval = {};
    /**
     * 模仿setTimeout
     * @param call
     * @param thisObj
     * @param delay
     */
    lie.setTimeout = function (call, thisObj, delay) {
        var param = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            param[_i - 3] = arguments[_i];
        }
        var curc = ++outCode;
        var func = timeout[curc] = function () {
            call.apply(thisObj, param);
            delete timeout[curc];
        };
        Laya.timer.once(delay, null, func);
        return curc;
    };
    /**
     * 清除延迟回调
     * @param key 标志
     */
    lie.clearTimeout = function (key) {
        clear(timeout, key);
    };
    /**
     * 设置间隔回调
     * @param call 回调函数
     * @param thisObj 回调所属对象
     * @param delay 回调间隔
     */
    lie.setInterval = function (call, thisObj, delay) {
        var param = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            param[_i - 3] = arguments[_i];
        }
        var curc = ++valCode;
        var func = interval[curc] = function () {
            call.apply(thisObj, param);
        };
        Laya.timer.loop(delay, null, func);
        return curc;
    };
    /**
     * 清除间隔回调
     * @param key
     */
    lie.clearInterval = function (key) {
        clear(interval, key);
    };
    /**
     * 清除
     * @param data 缓存数据
     * @param key 标志
     */
    var clear = function (data, key) {
        var info = data[key];
        if (info) {
            delete data[key];
            Laya.timer.clear(null, info);
        }
    };
})(lie || (lie = {}));
//# sourceMappingURL=TimeUtils.js.map