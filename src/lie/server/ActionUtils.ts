module lie {

	/**
	 * 前端发送数据
	 */
	export interface ITFSendAction {
		action: string;
		info: any;
	}

	/**
	 * 后端推送数据格式
	 */
	export interface ITFPushAction {
		errorCode: number;
		info: any;		// 错误的时候格式是ITFStringInfo，正常的话格式任意，根据接口来
	}

	/**
	 * 纯字符串消息
	 */
	export interface ITFStringInfo {
		msg: string;
	}

	/**
	 * 行为类型
	 */
	export enum ActionType {
		login,
		// reLogin,
		// setUserInfo,
		// play,
		finish,
		addFriend,
		// getFriend,
		getDialState,
		useDialCount,
		selectRole,
		unlockRole
	}

	/**
	 * 请求类型工具类
	 */
	export class ActionUtils {

		/**
		 * 根据类型获取action
		 */
		public static getAction(type: ActionType): string {
			return ActionType[type];
		}

		/**
		 * 获取请求失败action
		 */
		public static getFailAction(): ITFPushAction {
			var push = <ITFPushAction>Object.create(null);
			var info = push.info = <ITFStringInfo>Object.create(null);
			push.errorCode = -1;
			info.msg = '请求服务器失败';
			return push;
		}

		/**
		 * 获取info action
		 */
		public static getInfoAction(info: any): ITFPushAction {
			var push = <ITFPushAction>Object.create(null);
			push.info = info;
			return push;
		}

		/**
		 * 是否拥有该action类型
		 */
		public static hasAction(type: ActionType): boolean {
			return !!ActionUtils.getAction(type);
		}

		/**
		 * 创建一个前端发送action
		 * @param type 类型
		 * @param setInfo 设置info的数据
		 */
		public static newAction(type: ActionType, setInfo: (info: any) => void): ITFSendAction {
			var action = <ITFSendAction>Object.create(null);
			action.action = ActionUtils.getAction(type);
			if (setInfo) {
				let info = action.info = Object.create(null);
				setInfo(info);
			}
			return action;
		}
	}
}