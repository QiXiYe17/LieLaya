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
     * 格式化位图
     */
    var FormatImage = /** @class */ (function (_super) {
        __extends(FormatImage, _super);
        function FormatImage() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(FormatImage.prototype, "format", {
            /**
             * 设置skin的通用格式，用%s或%d表示替换符号位置，只允许出现一次，如font_%s.png
             */
            set: function (value) {
                this.$format = value;
                this.update();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FormatImage.prototype, "value", {
            /**
             * 设置符号
             */
            set: function (value) {
                this.$value = value;
                this.update();
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 更新
         */
        FormatImage.prototype.update = function () {
            var self = this;
            var format = self.$format;
            if (format) {
                var value = self.$value;
                if (value) {
                    self.skin = lie.Utils.formatString(format, value);
                }
            }
        };
        return FormatImage;
    }(Laya.Image));
    lie.FormatImage = FormatImage;
})(lie || (lie = {}));
//# sourceMappingURL=FormatImage.js.map