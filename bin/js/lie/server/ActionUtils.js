var lie;
(function (lie) {
    /**
     * 行为类型
     */
    var ActionType;
    (function (ActionType) {
        ActionType[ActionType["login"] = 0] = "login";
        // reLogin,
        // setUserInfo,
        // play,
        ActionType[ActionType["finish"] = 1] = "finish";
        ActionType[ActionType["addFriend"] = 2] = "addFriend";
        // getFriend,
        ActionType[ActionType["getDialState"] = 3] = "getDialState";
        ActionType[ActionType["useDialCount"] = 4] = "useDialCount";
        ActionType[ActionType["selectRole"] = 5] = "selectRole";
        ActionType[ActionType["unlockRole"] = 6] = "unlockRole";
    })(ActionType = lie.ActionType || (lie.ActionType = {}));
    /**
     * 请求类型工具类
     */
    var ActionUtils = /** @class */ (function () {
        function ActionUtils() {
        }
        /**
         * 根据类型获取action
         */
        ActionUtils.getAction = function (type) {
            return ActionType[type];
        };
        /**
         * 获取请求失败action
         */
        ActionUtils.getFailAction = function () {
            var push = Object.create(null);
            var info = push.info = Object.create(null);
            push.errorCode = -1;
            info.msg = '请求服务器失败';
            return push;
        };
        /**
         * 获取info action
         */
        ActionUtils.getInfoAction = function (info) {
            var push = Object.create(null);
            push.info = info;
            return push;
        };
        /**
         * 是否拥有该action类型
         */
        ActionUtils.hasAction = function (type) {
            return !!ActionUtils.getAction(type);
        };
        /**
         * 创建一个前端发送action
         * @param type 类型
         * @param setInfo 设置info的数据
         */
        ActionUtils.newAction = function (type, setInfo) {
            var action = Object.create(null);
            action.action = ActionUtils.getAction(type);
            if (setInfo) {
                var info = action.info = Object.create(null);
                setInfo(info);
            }
            return action;
        };
        return ActionUtils;
    }());
    lie.ActionUtils = ActionUtils;
})(lie || (lie = {}));
//# sourceMappingURL=ActionUtils.js.map