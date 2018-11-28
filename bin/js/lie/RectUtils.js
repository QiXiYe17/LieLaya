var lie;
(function (lie) {
    var Rectangle = Laya.Rectangle; // 类
    var sign = 'LRectangle'; // 缓存标志
    /**
     * 矩形操作工具类
     */
    var RectUtils = /** @class */ (function () {
        function RectUtils() {
        }
        /**
         * 创建矩形
         * @param x 默认0
         * @param y 默认0
         * @param width 默认0
         * @param height 默认0
         */
        RectUtils.create = function (x, y, width, height) {
            var rect = Laya.Pool.getItemByClass(sign, Rectangle);
            var array = arguments, len = array.length;
            if (len < 4) {
                array.length = 4;
                for (var i = len; i < 4; i++) {
                    array[i] = 0;
                }
            }
            return rect.setTo.apply(rect, array);
        };
        /**
         * 释放矩形到缓存
         * @param rect 矩形
         */
        RectUtils.release = function (rect) {
            Laya.Pool.recover(sign, rect);
        };
        /**
         * 释放多个矩形到缓存
         */
        RectUtils.releases = function (rects) {
            var release = RectUtils.release;
            for (var i in rects)
                release(rects[i]);
        };
        /**
         * 切割矩形，分割空间-重点，这里优先分割宽
         * @param range 范围矩形
         * @param rect 内置矩形
         * @param minw 分割出来的矩形必须满足最小宽
         * @param minh 分割出来的矩形必须满足最小高
         * @returns {Rectangle[]}
         */
        RectUtils.splitSpace = function (range, rect, minw, minh) {
            var splits = [];
            // 属性
            var rectX = rect.x, rectY = rect.y, rectW = rect.width, rectH = rect.height;
            var rangeX = range.x, rangeY = range.y, rangeW = range.width, rangeH = range.height;
            // 高度分割属性，默认左上角开始裁剪
            var splitH = rangeH, splitY = rangeY, create = RectUtils.create;
            /**
             * 存入
             */
            var push = function (x, y, w, h) {
                splits.push(create(x, y, w, h));
            };
            // 宽度裁剪
            if (rangeW >= minw) {
                var topH = rectY - rangeY, bottomH = rangeH - topH - rectH, bottomY = rectY + rectH;
                splitH = rectH;
                if (topH >= minh) {
                    splitY = rectY;
                    push(rangeX, rangeY, rangeW, topH);
                }
                else
                    splitH += topH;
                if (bottomH >= minh)
                    push(rangeX, bottomY, rangeW, bottomH);
                else
                    splitH += bottomH;
            }
            // 高度裁剪
            if (splitH >= minh) {
                var leftW = rectX - rangeX, rightW = rangeW - leftW - rectW, rightX = rectX + rectW;
                if (leftW >= minw)
                    push(rangeX, splitY, leftW, splitH);
                if (rightW >= minw)
                    push(rightX, splitY, rightW, splitH);
            }
            return splits;
        };
        /**
         * 切割矩形，分割空间，其中多个分割块
         * @param range 范围矩形
         * @param rects 内置矩形数组
         * @param minw 分割出来的矩形必须满足最小宽
         * @param minh 分割出来的矩形必须满足最小高
         * @returns {Rectangle[]}
         */
        RectUtils.splitSpaces = function (range, rects, minw, minh) {
            var self = RectUtils;
            var ranges = [range], rect;
            var contains = self.contains, splitSpace = self.splitSpace;
            // 按从高到低，从左到右排序
            lie.SortTools.sortMaps(rects, ['y', 'x']);
            while (rect = rects.shift()) {
                for (var i = 0, len = ranges.length; i < len; i++) {
                    var range_1 = ranges[i];
                    if (contains(range_1, rect)) {
                        var splice = splitSpace(range_1, rect, minw, minh);
                        ranges.splice(i, 1);
                        ranges = ranges.concat(splice);
                        break;
                    }
                }
            }
            return ranges;
        };
        /**
         * 检测range是否包含rect
         */
        RectUtils.contains = function (range, rect) {
            var disX = range.x - rect.x;
            var disY = range.y - rect.y;
            return disX <= 0 && disY <= 0 && rect.width <= disX + range.width &&
                rect.height <= disY + range.height;
        };
        return RectUtils;
    }());
    lie.RectUtils = RectUtils;
})(lie || (lie = {}));
//# sourceMappingURL=RectUtils.js.map