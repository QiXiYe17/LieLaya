var lie;
(function (lie) {
    /**
     * 对Laya自身的类、控件（节点）、方法等进行二次声明
     * 目的：1.官方文档出的TS库说明不规范，没把TS的优点发挥出来，故有此类；
     *      2.简化、优化一些操作，以提高Laya的使用便利；
     *      3.新增类声明
     */
    var LayaUtils = /** @class */ (function () {
        function LayaUtils() {
        }
        /**
         * 创建Handle，Laya的Handle回调参数不完善
         * @param method 回调
         * @param caller 回调所属对象
         * @param args 回调参数，类型必须是T或者T数组
         * @param once 是否只调用一次，默认true
         */
        LayaUtils.createHandler = function (method, caller, args, once) {
            return Laya.Handler.create(caller, method, args, once);
        };
        return LayaUtils;
    }());
    lie.LayaUtils = LayaUtils;
})(lie || (lie = {}));
//# sourceMappingURL=LayaUtils.js.map