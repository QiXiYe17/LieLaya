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
    // test
    var pfUtils = lie.WXUtils.getInstance();
    /**
     * 微信数据开放域控件
     * 使用：设置好控件大小、坐标及类型即可，其它的无需管理
     * 注：该控件跟开放域的代码是配套的，不同开放域代码请勿使用该类
     */
    var WXBitmap = /** @class */ (function (_super) {
        __extends(WXBitmap, _super);
        function WXBitmap() {
            var _this = _super.call(this) || this;
            _this.auto = true; // 仅在未加入场景前修改有效，兼容ui
            _this.once(Laya.Event.DISPLAY, _this, _this.onCreate);
            _this.once(Laya.Event.UNDISPLAY, _this, _this.onDestroy);
            return _this;
        }
        /**
         * 加入场景
         */
        WXBitmap.prototype.onCreate = function () {
            var self = this;
            // 纹理
            var texture = self.$texture = pfUtils.getShareCanvas();
            var bitmap = self.$bitmap = texture.bitmap;
            self.graphics.drawTexture(texture);
            self.visible = false;
            self.$timer = new lie.Timer(self.reloadCanvas, self, 5, false, true);
            self.auto && self.refresh();
        };
        /**
         * 离开场景
         */
        WXBitmap.prototype.onDestroy = function () {
            var self = this;
            var post = pfUtils.postMessage;
            self.clear();
            post('exit', { view: self.$viewName });
            // post('pause');
        };
        Object.defineProperty(WXBitmap.prototype, "viewName", {
            /**
             * 设置界面名称
             */
            set: function (value) {
                this.$viewName = value;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 刷新开放域界面
         * @param param 携带参数通知开放域
         */
        WXBitmap.prototype.refresh = function (param) {
            var self = this;
            var width = self.width;
            var height = self.height;
            var data = {
                view: self.$viewName,
                width: width,
                height: height
            };
            // 赋值属性
            for (var i in param)
                data[i] = param[i];
            self.visible = true;
            // 检测
            var texture = self.$texture;
            if (texture) {
                var timer = self.$timer;
                // 通知+延迟刷新界面
                var post = pfUtils.postMessage;
                // post('resume');
                post('enter', data);
                // 5秒后停止绘画
                self.clearTimeout();
                self.reloadCanvas(); // 先刷新一次
                timer.start();
                self.$timeout = lie.setTimeout(timer.stop, timer, 5000);
            }
        };
        /**
         * 重新渲染cavans界面
         */
        WXBitmap.prototype.reloadCanvas = function () {
            var bitmap = this.$bitmap;
            var func = bitmap._source && bitmap.reloadCanvasData;
            func && func.call(bitmap);
        };
        /**
         * 清除延迟
         */
        WXBitmap.prototype.clearTimeout = function () {
            var self = this;
            lie.clearTimeout(self.$timeout);
            self.$timeout = null;
        };
        /**
         * 清除界面
         */
        WXBitmap.prototype.clear = function () {
            var self = this;
            var texture = self.$texture;
            var timer = self.$timer;
            if (timer) {
                timer.clear();
                self.$timer = null;
            }
            if (texture) {
                texture.destroy(true);
                self.$texture = null;
                self.$bitmap = null;
            }
            self.clearTimeout();
            self.graphics.clear();
        };
        return WXBitmap;
    }(Laya.Sprite));
    lie.WXBitmap = WXBitmap;
})(lie || (lie = {}));
//# sourceMappingURL=WXBitmap.js.map