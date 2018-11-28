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
    //// 说明：注释前带*的说明是要自己实现的功能、接口、函数等 ////
    /**
     * 检测对象是否是数组
     */
    var isArray = Array.isArray || function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };
    /**
     * 引导界面
     * *注，继承可修改，如果继承Dialog的话要先初始化DialogManager，Laya的奇葩
     */
    var GuideView = /** @class */ (function (_super) {
        __extends(GuideView, _super);
        function GuideView(config, displays) {
            var _this = _super.call(this) || this;
            /**
             * 约束属性，即存放会影响一个控件坐标的属性数组
             */
            _this.$attrs = ['x', 'y', 'left', 'right',
                'bottom', 'top', 'centerX', 'centerY'];
            var stage = Laya.stage;
            var width = _this.width = stage.width;
            var height = _this.height = stage.height;
            _this.$distance = height - 1334; // 微信小游戏默认高度1334
            // *如果继承Dialog的话可取消
            var rect = new Laya.Sprite;
            var graphics = rect.graphics;
            graphics.setAlpha(.9);
            graphics.drawRect(0, 0, width, height, '#000000');
            _this.addChild(rect);
            // 界面初始化完毕后执行高亮
            GuideView.$isSave = true;
            _this.setConfig(config, displays);
            return _this;
        }
        /**
         * 点击关闭引导
         */
        GuideView.prototype.onClick = function (e) {
            var self = this;
            // *e.stopPropagation(); // *按需要是否停止监听传递，默认引导的点击是最先触发的
            // 更新引导
            GuideView.$guide++;
            // *发送服务器更新
            // 界面
            self.recoveryConstrain();
            self.destroy(true);
            GuideView.$isSave = false;
        };
        /**
         * 初始化点击控件的监听，保证引导的监听是最先触发
         */
        GuideView.prototype.initDisplayEvent = function (displays) {
            var self = this;
            var type = Laya.Event.CLICK;
            for (var i in displays) {
                var display = displays[i];
                var patcher = display._events; // 监听存放对象
                display.on(type, self, self.onClick);
                // 保证这次监听最前接受
                var array = patcher[type];
                // 存在多个监听时为数组
                if (isArray(array))
                    array.unshift(array.pop());
            }
        };
        /**
         * 移除约束
         */
        GuideView.prototype.removeConstrain = function (displays) {
            var self = this;
            var length = displays.length;
            if (length > 0) {
                var attrs = self.$attrs;
                var points = [];
                var values = self.$values = [];
                for (var i in displays) {
                    var display = displays[i];
                    var point = display.localToGlobal(new Laya.Point(0, 0)); // 先将当前世界坐标保存起来
                    var value = values[i] = [display];
                    var position = value[1] = [];
                    points.push(point);
                    for (var j in attrs) {
                        var attr = attrs[j];
                        position[j] = display[attr];
                        display[attr] = NaN;
                    }
                    // 从原始父控件脱离
                    var parent_1 = value[2] = display.parent;
                    value[3] = parent_1.getChildIndex(display);
                    parent_1.removeChild(display);
                    // 加入引导
                    self.addChild(display);
                    display.x = point.x;
                    display.y = point.y;
                    // ui控件
                    if (display instanceof Laya.Component) {
                        display.x += display.anchorX * display.width;
                        display.y += display.anchorY * display.height;
                    }
                }
            }
        };
        /**
         * 恢复约束
         */
        GuideView.prototype.recoveryConstrain = function () {
            var self = this;
            var values = self.$values;
            if (values) {
                var attrs = self.$attrs;
                for (var i in values) {
                    var value = values[i];
                    var display = value[0];
                    // 恢复坐标
                    var position = value[1];
                    for (var j in attrs) {
                        display[attrs[j]] = position[j];
                    }
                    // 恢复父控件
                    value[2].addChildAt(display, value[3]);
                    // 删除监听
                    display.off(Laya.Event.CLICK, self, self.onClick);
                }
                self.$values = null;
            }
        };
        /**
         * 设置配置
         * @param config 配置
         * @param displays 高亮控件，必存在，但长度未知
         */
        GuideView.prototype.setConfig = function (config, displays) {
            var self = this;
            // *按照配置初始化界面-请自行增加
            // 引导的通用功能
            if (config.later)
                Laya.timer.callLater(self, self.removeConstrain, displays);
            else
                self.removeConstrain(displays);
        };
        /**
         * *初始化玩家引导数据
         * @param guide 玩家的引导步骤
         */
        GuideView.init = function (guide) {
            GuideView.$guide = guide;
        };
        /**
         * *显示引导
         * @param step 引导步骤
         * @param displays 高亮的控件，当配置为1时只有点击该控件才会关闭窗口
         */
        GuideView.showGuide = function (step) {
            var displays = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                displays[_i - 1] = arguments[_i];
            }
            // var self = GuideView;
            // var guide = self.$guide;
            // // var configs = <IGuideConfig[]>[]; 存放服务器配置的数组，请自行初始化，也可在init函数初始化
            // if (!self.$isSave && guide < configs.length) {
            // 	let config = configs[guide];
            // 	if (config.step == step) {
            // 		// 加入场景，改成
            // 		Laya.stage.addChild(new GuideView(config, displays));
            // 	}
            // }
            // Laya比较奇葩，继承Dialog的话要定义
            Laya.stage.addChild(new GuideView({ later: false }, displays));
        };
        //// 引导的界面方法，不同游戏引导需要自己修改 ////
        GuideView.$guide = 0; // 看init函数
        return GuideView;
    }(Laya.Sprite));
    lie.GuideView = GuideView;
})(lie || (lie = {}));
//# sourceMappingURL=GuideDialog.js.map