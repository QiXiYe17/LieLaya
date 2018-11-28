var lie;
(function (lie) {
    /**
     * 类型检验工具类
     */
    var TypeUtils = /** @class */ (function () {
        function TypeUtils() {
        }
        /**
         * 检测是否是字符串类型，注意new String检测不通过的
         */
        TypeUtils.isString = function (obj) {
            return typeof obj === 'string' && obj.constructor === String;
        };
        /**
         * 检测是不是数组
         */
        TypeUtils.isArray = function (obj) {
            return obj instanceof Array && Object.prototype.toString.call(obj) === '[object Array]';
        };
        /**
         * 检测是不是数字，注意new Number不算进来
         */
        TypeUtils.isNumber = function (obj) {
            return typeof obj === 'number' && !isNaN(obj); // type NaN === 'number' 所以要去掉
        };
        /**
         * 是不是对象，数组也是一种对象
         */
        TypeUtils.isObject = function (obj) {
            return typeof obj === 'object';
        };
        /**
         * 是不是函数
         */
        TypeUtils.isFunction = function (obj) {
            return typeof obj === 'function';
        };
        /**
         * 检测类型是否相等
         */
        TypeUtils.isSame = function (obj0, obj1) {
            var bool = true;
            if (obj0 != obj1) {
                bool = obj0.__proto__ == obj1.__proto__;
            }
            return bool;
        };
        return TypeUtils;
    }());
    lie.TypeUtils = TypeUtils;
})(lie || (lie = {}));
//# sourceMappingURL=TypeUtils.js.map