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
     * 可视化组件View模板类
     * 功能：onCreate、onDestroy、onShow、onHide，自带清除监听
     */
    var UIView = /** @class */ (function (_super) {
        __extends(UIView, _super);
        function UIView() {
            var _this = _super.call(this) || this;
            _this.isClear = true; // 是否清除所有
            _this.once(Laya.Event.DISPLAY, _this, _this.onCreate);
            _this.once(Laya.Event.UNDISPLAY, _this, _this.$unDisplay);
            return _this;
        }
        /**
         * 离开舞台调用，重写前需注意不要删除原有功能
         */
        UIView.prototype.$unDisplay = function () {
            var self = this;
            if (self.isClear) {
                self.offAll();
                self.onDestroy();
                self.isDestroy = true;
            }
        };
        /**
         * 加入舞台时调用（先加入再触发），此时父控件不为空，Laya自带的方法都是不存在父控件的
         */
        UIView.prototype.onCreate = function () {
        };
        /**
         * 离开舞台时调用（先触发再离开）
         */
        UIView.prototype.onDestroy = function () {
        };
        /**
         * 层级变化——显示，AppViews
         */
        UIView.prototype.onShow = function () {
        };
        /**
         * 层级变化——被覆盖，AppViews
         */
        UIView.prototype.onHide = function () {
        };
        return UIView;
    }(Laya.View));
    lie.UIView = UIView;
})(lie || (lie = {}));
//# sourceMappingURL=UIView.js.map