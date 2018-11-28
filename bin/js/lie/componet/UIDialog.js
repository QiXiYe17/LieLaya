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
     * 可视化组件Dialog模板类
     */
    var UIDialog = /** @class */ (function (_super) {
        __extends(UIDialog, _super);
        function UIDialog() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * 此时已有宽高
         */
        UIDialog.prototype.initialize = function () {
            _super.prototype.initialize.call(this);
            this.initObscure();
        };
        /**
         * 重写
         */
        UIDialog.prototype.$unDisplay = function () {
            _super.prototype.$unDisplay.call(this);
            var self = this;
            if (self.isDestroy) {
                var call_1 = self.m_pCall;
                if (call_1) {
                    var m_pThis_1 = self.m_pThis;
                    self.callLater(function () {
                        call_1.call(m_pThis_1);
                    });
                }
                self.m_pCall = self.m_pThis = null;
            }
        };
        /**
         * 初始化朦层
         */
        UIDialog.prototype.initObscure = function () {
            var self = this;
            var stage = Laya.stage;
            var rect = self.obscure = new Laya.Sprite;
            var width = rect.width = stage.width;
            var height = rect.height = stage.height;
            rect.x = (self.width - width) / 2;
            rect.y = (self.height - height) / 2;
            rect.graphics.drawRect(0, 0, width, height, '#000000');
            self.addChildAt(rect, 0);
            self.setObscureAlpha(0.5);
            lie.EventUtils.addClickListener(rect, self.onClickObs, self);
        };
        /**
         * 点击了遮罩，阻挡监听
         */
        UIDialog.prototype.onClickObs = function () {
        };
        /**
         * 设置朦层的透明度
         */
        UIDialog.prototype.setObscureAlpha = function (alpha) {
            this.obscure.alpha = alpha;
        };
        /**
         * 添加关闭回调
         */
        UIDialog.prototype.addCloseCall = function (call, thisObj) {
            var self = this;
            self.m_pCall = call;
            self.m_pThis = thisObj;
        };
        /**
         * 关闭窗口
         */
        UIDialog.prototype.onClose = function (event) {
            event.stopPropagation();
            this.removeSelf();
        };
        return UIDialog;
    }(lie.UIView));
    lie.UIDialog = UIDialog;
})(lie || (lie = {}));
//# sourceMappingURL=UIDialog.js.map