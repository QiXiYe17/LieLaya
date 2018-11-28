module lie {
	/**
	 * 前后端交互方法
	 */
	export class Service {

		/**
		 * 请求游戏Action，参数自带uid
		 */
		protected static reqGameAction(type: ActionType, param?: any, notify?: boolean): Promise<any> {
			var uid = Server.uid;
			var action = ActionUtils.newAction(type, function (info: any) {
				info.uid = uid;
				for (let i in param)
					info[i] = param[i];
			});
			return Http.postAction(action, notify);
		}

		/**
		 * 带好友ID的请求
		 */
		protected static reqRidAction(type: ActionType, param?: any): Promise<any> {
			var param = param || {};
			param.rid = Server.rid;
			// 忽略报错
			return Service.reqGameAction(type, param, true);
		}

		//////// 请求相关 ////////

		/**
		 * 请求结束/结算游戏
		 * @param chapterId 关卡ID
		 * @param score 获得分数
		 * @param success 是否通关
		 * @param petIds 解锁的宠物ID
		 */
		public static async reqFinishGame(score: number, perfect: number, petIds: number[]): Promise<IFinishInfo> {
			var clzz = AppConfig;
			var scKey = clzz.gameInfo.scKey;
			var data = Object.create(null);
			// 玩家id需要加入签名
			data.uid = Server.uid;
			data.score = score;
			data.perfect = perfect;
			data.petIds = petIds;
			if (scKey) {
				// 设置签名
				data.sign = CryptoJS.HmacSHA256(Http.getUrlParam(data, function (a, b) {
					return a > b ? 1 : -1
				}), scKey).toString();
			}
			var info: IFinishInfo = await Service.reqGameAction(ActionType.finish, data)
			// 更新本地数据
			clzz.updateUnknow(info);
			return info;
		}

		/**
		 * 请求添加为好友
		 */
		public static reqAddFriend(): void {
			Service.reqRidAction(ActionType.addFriend);
		}

		/**
		 * 请求转盘状态
		 */
		public static reqGetDialSate(): Promise<IDialStateInfo> {
			return Service.reqGameAction(ActionType.getDialState)
		}

		/**
		 * 请求使用转盘
		 */
		public static async reqUseDialCount(): Promise<IUseDialInfo> {
			var info = await Service.reqGameAction(ActionType.useDialCount);
			AppConfig.updateUnknow(info, true);
			return info;
		}

		/**
		 * 切换角色
		 * @param roleId 角色ID
		 */
		public static async reqSelectRole(roleId: number): Promise<void> {
			var info = await Service.reqGameAction(ActionType.selectRole, { roleId });
			AppConfig.updateSelectRole(info);
		}

		/**
		 * 请求解锁角色
		 * @param roleId 角色ID
		 */
		public static async reqUnlockRole(roleId: number): Promise<void> {
			var info = await Service.reqGameAction(ActionType.unlockRole, { roleId });
			AppConfig.updateUnknow(info, true);
		}
	}
}