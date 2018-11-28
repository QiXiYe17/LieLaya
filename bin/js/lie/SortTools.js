/**
 * Created by Yong on 2016/5/21.
 */
var ArraySort;
(function (ArraySort) {
    /**升序 */
    ArraySort[ArraySort["UPPER"] = 1] = "UPPER";
    /**降序 */
    ArraySort[ArraySort["LOWER"] = 2] = "LOWER";
})(ArraySort || (ArraySort = {}));
;
var lie;
(function (lie) {
    /**
     * 排序工具
     */
    var SortTools = /** @class */ (function () {
        function SortTools() {
        }
        /**
         * 获取子项比较的数值
         */
        SortTools.getCompareNum = function (value, key) {
            var v = value[key];
            // 如果是数组，则返回其长度
            if (v instanceof Array)
                v = v.length;
            // 字符串有其自己的比较方式
            else if (typeof v !== 'string')
                v = Number(v);
            return v;
        };
        /**
         * 单项排序
         * @param arr 要排序的数组
         * @param key 排序的字段
         * @param asc 是否升序，默认true
         */
        SortTools.sortMap = function (arr, key, asc) {
            if (asc === void 0) { asc = true; }
            return arr.sort(function (a, b) {
                var comp = a[key] - b[key];
                !asc && (comp *= -1);
                return comp;
            });
        };
        /**
         * 多项排序
         * @param array 待排序数组
         * @param keys 排序字段
         * @param argType 对应字段的排序类型，默认都是升序
         */
        SortTools.sortMaps = function (array, keys, argType) {
            if (argType === void 0) { argType = []; }
            return array.sort(function (a, b) {
                var comp = -1; // 默认不用交换
                var index = 0;
                for (var i = 0, len = keys.length; i < len; i++) {
                    var key = keys[i];
                    var aValue = a[key], bValue = b[key];
                    // 数字型采取比较
                    if (aValue == bValue || (isNaN(aValue) && isNaN(bValue)))
                        continue;
                    if (aValue > bValue)
                        comp = 1;
                    if (argType[i] == ArraySort.LOWER)
                        comp *= -1;
                    break;
                }
                return comp;
            });
        };
        /**
         * 多项排序，不规则数组
         * @param array 待排序数组
         * @param keys 排序字段
         * @param argType 对应字段的排序类型，默认升序
         * @param getNum 根据keys子对象获取数组子对象的值的比较值方法
         */
        SortTools.sortMaps2 = function (array, keys, argType, getNum) {
            if (argType === void 0) { argType = []; }
            if (getNum === void 0) { getNum = SortTools.getCompareNum; }
            array.sort(function (a, b) {
                var comp = -1; // 默认不用交换
                var index = 0;
                for (var i = 0, len = keys.length; i < len; i++) {
                    var key = keys[i];
                    var aValue = getNum(a, key), bValue = getNum(b, key);
                    // 数字型采取比较
                    if (aValue == bValue || (isNaN(aValue) && isNaN(bValue)))
                        continue;
                    if (aValue > bValue)
                        comp = 1;
                    if (argType[i] == ArraySort.LOWER)
                        comp *= -1;
                    break;
                }
                return comp;
            });
        };
        return SortTools;
    }());
    lie.SortTools = SortTools;
})(lie || (lie = {}));
//# sourceMappingURL=SortTools.js.map