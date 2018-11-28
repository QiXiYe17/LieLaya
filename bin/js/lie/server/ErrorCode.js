var lie;
(function (lie) {
    /**
     * 错误编码
     */
    var ErrorCode;
    (function (ErrorCode) {
        ErrorCode[ErrorCode["E_ERROR"] = -1] = "E_ERROR";
        ErrorCode[ErrorCode["E_NORMAL"] = 0] = "E_NORMAL";
        ErrorCode[ErrorCode["E_METHOD"] = 1] = "E_METHOD";
        ErrorCode[ErrorCode["E_ACTION"] = 2] = "E_ACTION";
        ErrorCode[ErrorCode["E_PARAM"] = 3] = "E_PARAM";
        ErrorCode[ErrorCode["E_LOGIN"] = 4] = "E_LOGIN";
        ErrorCode[ErrorCode["E_PLAY"] = 5] = "E_PLAY";
        ErrorCode[ErrorCode["E_BALANCE"] = 6] = "E_BALANCE";
        ErrorCode[ErrorCode["E_GOLD"] = 7] = "E_GOLD";
    })(ErrorCode = lie.ErrorCode || (lie.ErrorCode = {}));
})(lie || (lie = {}));
//# sourceMappingURL=ErrorCode.js.map