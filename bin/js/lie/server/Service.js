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
     * 前后端交互方法
     */
    var Service = /** @class */ (function () {
        function Service() {
        }
        /**
         * 请求游戏Action，参数自带uid
         */
        Service.reqGameAction = function (type, param, notify) {
            var uid = lie.Server.uid;
            var action = lie.ActionUtils.newAction(type, function (info) {
                info.uid = uid;
                for (var i in param)
                    info[i] = param[i];
            });
            return lie.Http.postAction(action, notify);
        };
        /**
         * 带好友ID的请求
         */
        Service.reqRidAction = function (type, param) {
            var param = param || {};
            param.rid = lie.Server.rid;
            // 忽略报错
            return Service.reqGameAction(type, param, true);
        };
        //////// 请求相关 ////////
        /**
         * 请求结束/结算游戏
         * @param chapterId 关卡ID
         * @param score 获得分数
         * @param success 是否通关
         * @param petIds 解锁的宠物ID
         */
        Service.reqFinishGame = function (score, perfect, petIds) {
            return __awaiter(this, void 0, void 0, function () {
                var clzz, scKey, data, info;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            clzz = AppConfig;
                            scKey = clzz.gameInfo.scKey;
                            data = Object.create(null);
                            // 玩家id需要加入签名
                            data.uid = lie.Server.uid;
                            data.score = score;
                            data.perfect = perfect;
                            data.petIds = petIds;
                            if (scKey) {
                                // 设置签名
                                data.sign = CryptoJS.HmacSHA256(lie.Http.getUrlParam(data, function (a, b) {
                                    return a > b ? 1 : -1;
                                }), scKey).toString();
                            }
                            return [4 /*yield*/, Service.reqGameAction(lie.ActionType.finish, data)
                                // 更新本地数据
                            ];
                        case 1:
                            info = _a.sent();
                            // 更新本地数据
                            clzz.updateUnknow(info);
                            return [2 /*return*/, info];
                    }
                });
            });
        };
        /**
         * 请求添加为好友
         */
        Service.reqAddFriend = function () {
            Service.reqRidAction(lie.ActionType.addFriend);
        };
        /**
         * 请求转盘状态
         */
        Service.reqGetDialSate = function () {
            return Service.reqGameAction(lie.ActionType.getDialState);
        };
        /**
         * 请求使用转盘
         */
        Service.reqUseDialCount = function () {
            return __awaiter(this, void 0, void 0, function () {
                var info;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, Service.reqGameAction(lie.ActionType.useDialCount)];
                        case 1:
                            info = _a.sent();
                            AppConfig.updateUnknow(info, true);
                            return [2 /*return*/, info];
                    }
                });
            });
        };
        /**
         * 切换角色
         * @param roleId 角色ID
         */
        Service.reqSelectRole = function (roleId) {
            return __awaiter(this, void 0, void 0, function () {
                var info;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, Service.reqGameAction(lie.ActionType.selectRole, { roleId: roleId })];
                        case 1:
                            info = _a.sent();
                            AppConfig.updateSelectRole(info);
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * 请求解锁角色
         * @param roleId 角色ID
         */
        Service.reqUnlockRole = function (roleId) {
            return __awaiter(this, void 0, void 0, function () {
                var info;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, Service.reqGameAction(lie.ActionType.unlockRole, { roleId: roleId })];
                        case 1:
                            info = _a.sent();
                            AppConfig.updateUnknow(info, true);
                            return [2 /*return*/];
                    }
                });
            });
        };
        return Service;
    }());
    lie.Service = Service;
})(lie || (lie = {}));
//# sourceMappingURL=Service.js.map