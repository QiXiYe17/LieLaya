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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var lie;
(function (lie) {
    /**
     * *基础颜色默认大小，因游戏而异
     */
    var colorBase = {
        'pic_number_y_': 104,
        'pic_number_w_': 44
    };
    /**
     * 获取尺寸
     * @param format 格式
     */
    var getSize = function (format) {
        var keys = Object.keys(colorBase);
        for (var i in keys) {
            var key = keys[i];
            if (format.indexOf(key) > -1)
                return colorBase[key];
        }
        return 30;
    };
    /**
     * 位图文本
     */
    var BitmapLabel = /** @class */ (function (_super) {
        __extends(BitmapLabel, _super);
        function BitmapLabel() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.$sScale = 1;
            _this.$bSzie = 30; // 默认大小
            _this.$distance = 4;
            return _this;
        }
        Object.defineProperty(BitmapLabel.prototype, "format", {
            /**
             * 设置位图的通用格式，使用%s或%d取代替换符号的位置
             * @example format = 'font_%s.png'
             */
            set: function (value) {
                var self = this;
                Laya.Component;
                if (value != self.$format) {
                    self.$format = value;
                    self.$bSzie = getSize(value);
                    self.update();
                    self.updateScale();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BitmapLabel.prototype, "text", {
            /**
             * 获取文本
             */
            get: function () {
                return this.$text;
            },
            /**
             * 设置文本
             */
            set: function (value) {
                var self = this;
                value = value == void 0 ? '' : String(value);
                if (value != self.$text) {
                    self.$text = value;
                    self.update();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BitmapLabel.prototype, "fontSize", {
            /**
             * 设置字体大小
             */
            set: function (value) {
                value = Number(value);
                if (!isNaN(value)) {
                    var self_1 = this;
                    self_1.$fontSize = value;
                    self_1.updateScale();
                }
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 更新内容
         */
        BitmapLabel.prototype.update = function () {
            return __awaiter(this, void 0, void 0, function () {
                var self, format, text, graphics, width, height, turn, scale, distance, sx, texs, i, len, url, tet, i, len, tet, tw, th, call;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            self = this;
                            format = self.$format;
                            if (!format) return [3 /*break*/, 7];
                            text = self.$text;
                            graphics = self.graphics;
                            width = 0, height = 0;
                            if (!text) return [3 /*break*/, 5];
                            turn = lie.Utils.formatString, scale = self.$sScale, distance = self.$distance * scale, sx = 0, texs = [];
                            i = 0, len = text.length;
                            _a.label = 1;
                        case 1:
                            if (!(i < len)) return [3 /*break*/, 4];
                            url = turn(format, text[i]);
                            return [4 /*yield*/, lie.RES.getAsyncRes(url)];
                        case 2:
                            tet = _a.sent();
                            tet && texs.push(tet);
                            _a.label = 3;
                        case 3:
                            i++;
                            return [3 /*break*/, 1];
                        case 4:
                            // 放这里有效减少闪屏时间
                            graphics.clear();
                            for (i = 0, len = texs.length; i < len; i++) {
                                tet = texs[i];
                                tw = tet.width * scale, th = tet.height * scale;
                                graphics.drawTexture(tet, sx, 0, tw, th);
                                width = sx + tw;
                                sx = width + distance;
                                height = Math.max(th, height);
                            }
                            return [3 /*break*/, 6];
                        case 5:
                            graphics.clear();
                            _a.label = 6;
                        case 6:
                            self.width = width;
                            self.height = height;
                            call = self.$upCall;
                            call && call.call(self.$upThis);
                            _a.label = 7;
                        case 7: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * 更新尺寸
         */
        BitmapLabel.prototype.updateScale = function () {
            var self = this;
            var value = self.$fontSize;
            if (!isNaN(value)) {
                var scale = value / self.$bSzie;
                // if (scale != self.$sScale) {
                // 	self.$sScale = scale;
                // 	self.update();
                // }
                // 如果出现所防冲突，再打开注释
                self.scale(scale, scale);
            }
        };
        /**
         * 添加刷新回调
         */
        BitmapLabel.prototype.addUpdateCall = function (call, thisObj) {
            var self = this;
            self.$upCall = call;
            self.$upThis = thisObj;
        };
        return BitmapLabel;
    }(Laya.Component));
    lie.BitmapLabel = BitmapLabel;
})(lie || (lie = {}));
//# sourceMappingURL=BitmapLabel.js.map