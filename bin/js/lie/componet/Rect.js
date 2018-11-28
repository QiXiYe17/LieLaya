var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var lie;
(function (lie) {
    /**
     * 纯颜色的矩形，默认黑色
     */
    var Rect = /** @class */ (function (_super) {
        __extends(Rect, _super);
        function Rect(width, height, color) {
            if (width === void 0) { width = 0; }
            if (height === void 0) { height = 0; }
            if (color === void 0) { color = '#0'; }
            var _this = _super.call(this) || this;
            var graphics = _this.graphics;
            graphics.drawRect(0, 0, width, height, color);
            _this.$once = [0, 0, width, height, color];
            _this.width = width;
            _this.height = height;
            return _this;
        }
        Rect.prototype.destroy = function (dc) {
            _super.prototype.destroy.call(this, dc);
            this.$once = null;
        };
        Object.defineProperty(Rect.prototype, "color", {
            /**
             * 获取颜色
             */
            get: function () {
                return this.$once[4];
            },
            /**
             * 设置颜色
             */
            set: function (value) {
                var self = this;
                if (self.color != value) {
                    self.$once[4] = value;
                    self.update(true);
                }
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 重写，监听宽高变化
         */
        Rect.prototype.repaint = function () {
            _super.prototype.repaint.call(this);
            this.update();
        };
        /**
         * 刷新
         * @param isReset 强制刷新
         */
        Rect.prototype.update = function (isReset) {
            var self = this;
            var once = self.$once;
            if (once) {
                var width = self.width, height = self.height;
                if (isReset || once[2] != width || once[3] != height) {
                    once[2] = width;
                    once[3] = height;
                    // 重绘会影响repaint
                    var graphics = self.graphics;
                    graphics.clear();
                    graphics.drawRect.apply(graphics, once);
                }
            }
        };
        return Rect;
    }(Laya.Sprite));
    lie.Rect = Rect;
})(lie || (lie = {}));
//# sourceMappingURL=Rect.js.map