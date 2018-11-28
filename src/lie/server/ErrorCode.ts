module lie {

	/**
	 * 错误编码
	 */
	export enum ErrorCode {
		E_ERROR = -1,
		E_NORMAL,
		E_METHOD,
		E_ACTION,
		E_PARAM,
		E_LOGIN,
		E_PLAY,		// 开始游戏返回失败：体力不足
		E_BALANCE,
		E_GOLD
	}
}